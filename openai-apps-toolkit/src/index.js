/**
 * OpenAI Apps MCP Server Template
 * Cloudflare Worker com proxy para OpenAI Agents API
 * 
 * Requisitos:
 * - wrangler secrets: OPENAI_API_KEY, AGENT_ID, VERIFICATION_TOKEN
 */

// ============================================
// CONFIGURAÇÃO DAS TOOLS
// ============================================

const TOOLS = [
  {
    name: "analyze_message",
    title: "Analisar Mensagem",
    description: "Use this when user wants to analyze a suspicious message for potential fraud or scam detection.",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The suspicious message text to analyze"
        },
        context: {
          type: "string",
          description: "Additional context about the message (optional)",
          default: ""
        }
      },
      required: ["message"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  {
    name: "analyze_screenshot",
    title: "Analisar Screenshot",
    description: "Use this when user wants to analyze a screenshot for potential fraud indicators.",
    inputSchema: {
      type: "object",
      properties: {
        image_url: {
          type: "string",
          description: "URL of the screenshot to analyze"
        },
        image_base64: {
          type: "string",
          description: "Base64 encoded image (alternative to URL)"
        }
      },
      required: []
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  {
    name: "get_security_tips",
    title: "Dicas de Segurança",
    description: "Use this when user wants security tips to protect themselves from scams.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["pix", "whatsapp", "email", "telefone", "geral"],
          description: "Category of security tips",
          default: "geral"
        }
      },
      required: []
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  }
];

// ============================================
// UTILIDADES
// ============================================

function generateTraceId() {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeForLogging(input, maxLength = 100) {
  if (typeof input !== 'string') return '[non-string]';
  // Remove possíveis PII e limita tamanho
  const sanitized = input
    .replace(/\b\d{11}\b/g, '[CPF_REDACTED]')
    .replace(/\b\d{10,11}\b/g, '[PHONE_REDACTED]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + '...' : sanitized;
}

function createJsonRpcResponse(id, result) {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}

function createJsonRpcError(id, code, message, data = null) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data && { data })
    }
  };
}

// ============================================
// HANDLERS MCP
// ============================================

async function handleInitialize(params) {
  return {
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "openai-mcp-template",
      version: "1.0.0"
    },
    capabilities: {
      tools: {}
    }
  };
}

async function handleListTools() {
  return {
    tools: TOOLS
  };
}

async function handleCallTool(params, env) {
  const { name, arguments: args } = params;
  const traceId = generateTraceId();
  
  console.log(`[${traceId}] Tool call: ${name}, args_hash: ${hashInput(JSON.stringify(args))}`);
  
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  
  try {
    const result = await executeToolWithAgent(name, args, env, traceId);
    return result;
  } catch (error) {
    console.error(`[${traceId}] Tool error: ${error.message}`);
    throw error;
  }
}

function hashInput(input) {
  // Simple hash for logging (não para segurança)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// ============================================
// INTEGRAÇÃO COM OPENAI AGENTS API
// ============================================

async function executeToolWithAgent(toolName, args, env, traceId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
  
  try {
    // Se não tiver AGENT_ID, usar processamento local (fallback/demo)
    if (!env.AGENT_ID || !env.OPENAI_API_KEY) {
      console.log(`[${traceId}] Using local processing (no Agent configured)`);
      return await executeToolLocally(toolName, args, env, traceId);
    }
    
    const response = await fetch(`https://api.openai.com/v1/agents/${env.AGENT_ID}/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Trace-Id': traceId
      },
      body: JSON.stringify({
        input: JSON.stringify({ tool: toolName, arguments: args })
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const status = response.status;
      if (status === 401) {
        throw new Error('Authentication failed with OpenAI API');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('OpenAI service temporarily unavailable');
      }
      throw new Error(`OpenAI API error: ${status}`);
    }
    
    const data = await response.json();
    
    return {
      structuredContent: data.output || data,
      content: formatResultForModel(toolName, data),
      _meta: {
        traceId,
        processedBy: "openai-agent",
        "openai/widgetCSP": {
          connect_domains: ["api.openai.com"],
          resource_domains: [],
          frame_domains: []
        }
      }
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - OpenAI Agent did not respond in time');
    }
    throw error;
  }
}

// ============================================
// PROCESSAMENTO LOCAL (FALLBACK/DEMO)
// ============================================

async function executeToolLocally(toolName, args, env, traceId) {
  switch (toolName) {
    case 'analyze_message':
      return await analyzeMessageLocal(args, env, traceId);
    case 'analyze_screenshot':
      return await analyzeScreenshotLocal(args, env, traceId);
    case 'get_security_tips':
      return await getSecurityTipsLocal(args, traceId);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function analyzeMessageLocal(args, env, traceId) {
  const { message, context } = args;
  
  // Se tiver Workers AI configurado, usar
  if (env.AI) {
    try {
      const prompt = `Você é um especialista em segurança digital no Brasil. Analise a seguinte mensagem e determine se é uma tentativa de golpe/fraude.

Mensagem: "${message}"
${context ? `Contexto adicional: ${context}` : ''}

Responda em JSON com o seguinte formato:
{
  "probabilidade_fraude": 0-100,
  "nivel_risco": "BAIXO" | "MEDIO" | "ALTO" | "CRITICO",
  "indicadores": ["lista de indicadores de fraude encontrados"],
  "explicacao": "explicação detalhada",
  "recomendacao": "o que o usuário deve fazer"
}`;

      const response = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
        messages: [{ role: 'user', content: prompt }]
      });
      
      let result;
      try {
        result = JSON.parse(response.response);
      } catch {
        result = {
          probabilidade_fraude: 50,
          nivel_risco: "MEDIO",
          indicadores: ["Análise em modo de demonstração"],
          explicacao: response.response,
          recomendacao: "Configure AGENT_ID para análise completa"
        };
      }
      
      return {
        structuredContent: result,
        content: `**Análise de Mensagem**\n\nNível de Risco: ${result.nivel_risco}\nProbabilidade de Fraude: ${result.probabilidade_fraude}%\n\n${result.explicacao}\n\n**Recomendação:** ${result.recomendacao}`,
        _meta: { traceId, processedBy: "workers-ai" }
      };
      
    } catch (error) {
      console.error(`[${traceId}] Workers AI error: ${error.message}`);
    }
  }
  
  // Fallback: análise baseada em regras simples
  const indicators = [];
  let riskScore = 0;
  
  const messageLower = message.toLowerCase();
  
  // Verificações de padrões comuns de golpe
  if (messageLower.includes('pix') || messageLower.includes('transferência')) {
    indicators.push("Menciona transação financeira");
    riskScore += 20;
  }
  if (messageLower.includes('urgente') || messageLower.includes('agora') || messageLower.includes('imediato')) {
    indicators.push("Pressão por urgência");
    riskScore += 25;
  }
  if (messageLower.includes('prêmio') || messageLower.includes('ganhou') || messageLower.includes('sorteio')) {
    indicators.push("Promessa de prêmio/ganho fácil");
    riskScore += 30;
  }
  if (messageLower.includes('clique') || messageLower.includes('link') || messageLower.includes('acesse')) {
    indicators.push("Solicita clique em link");
    riskScore += 20;
  }
  if (/https?:\/\/[^\s]+/.test(message)) {
    indicators.push("Contém URL");
    riskScore += 15;
  }
  if (messageLower.includes('banco') || messageLower.includes('conta') || messageLower.includes('senha')) {
    indicators.push("Solicita dados bancários/sensíveis");
    riskScore += 25;
  }
  
  const nivel_risco = riskScore >= 60 ? "CRITICO" : riskScore >= 40 ? "ALTO" : riskScore >= 20 ? "MEDIO" : "BAIXO";
  
  const result = {
    probabilidade_fraude: Math.min(riskScore, 100),
    nivel_risco,
    indicadores: indicators.length > 0 ? indicators : ["Nenhum indicador óbvio detectado"],
    explicacao: indicators.length > 0 
      ? `Foram encontrados ${indicators.length} indicador(es) de possível fraude na mensagem.`
      : "A mensagem não apresenta indicadores óbvios de fraude, mas mantenha-se vigilante.",
    recomendacao: riskScore >= 40 
      ? "NÃO clique em links, NÃO faça transferências e NÃO forneça dados pessoais. Na dúvida, entre em contato diretamente com a instituição por canais oficiais."
      : "Continue atento e verifique sempre a autenticidade do remetente."
  };
  
  return {
    structuredContent: result,
    content: `**Análise de Mensagem (Demo)**\n\nNível de Risco: ${result.nivel_risco}\nProbabilidade de Fraude: ${result.probabilidade_fraude}%\n\n${result.explicacao}\n\n**Recomendação:** ${result.recomendacao}`,
    _meta: { traceId, processedBy: "local-rules", mode: "demo" }
  };
}

async function analyzeScreenshotLocal(args, env, traceId) {
  const { image_url, image_base64 } = args;
  
  if (!image_url && !image_base64) {
    return {
      structuredContent: {
        error: true,
        message: "Forneça image_url ou image_base64"
      },
      content: "❌ Erro: É necessário fornecer uma imagem (URL ou base64) para análise.",
      _meta: { traceId }
    };
  }
  
  // Se tiver Workers AI com suporte a visão
  if (env.AI && image_url) {
    try {
      const prompt = `Analise esta imagem e identifique se contém elementos de golpe/fraude digital comum no Brasil (PIX falso, boleto falso, mensagem de banco falsa, etc.). 

Responda em JSON:
{
  "tipo_detectado": "tipo do possível golpe ou 'nenhum'",
  "indicadores_visuais": ["lista de elementos suspeitos"],
  "nivel_risco": "BAIXO" | "MEDIO" | "ALTO" | "CRITICO",
  "explicacao": "explicação",
  "recomendacao": "o que fazer"
}`;

      const response = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image_url } }
          ]
        }]
      });
      
      let result;
      try {
        result = JSON.parse(response.response);
      } catch {
        result = {
          tipo_detectado: "análise_parcial",
          indicadores_visuais: [],
          nivel_risco: "MEDIO",
          explicacao: response.response,
          recomendacao: "Verifique manualmente com especialista"
        };
      }
      
      return {
        structuredContent: result,
        content: `**Análise de Screenshot**\n\nTipo: ${result.tipo_detectado}\nRisco: ${result.nivel_risco}\n\n${result.explicacao}`,
        _meta: { traceId, processedBy: "workers-ai-vision" }
      };
      
    } catch (error) {
      console.error(`[${traceId}] Vision analysis error: ${error.message}`);
    }
  }
  
  return {
    structuredContent: {
      tipo_detectado: "análise_indisponível",
      indicadores_visuais: [],
      nivel_risco: "DESCONHECIDO",
      explicacao: "Análise de imagem requer configuração do AGENT_ID ou Workers AI com suporte a visão.",
      recomendacao: "Configure as credenciais para habilitar análise de screenshots."
    },
    content: "⚠️ Análise de screenshot indisponível no modo demo. Configure AGENT_ID para habilitar.",
    _meta: { traceId, processedBy: "local", mode: "demo" }
  };
}

async function getSecurityTipsLocal(args, traceId) {
  const { category = 'geral' } = args;
  
  const tips = {
    pix: {
      titulo: "Dicas de Segurança para PIX",
      dicas: [
        "Nunca faça PIX por pressão ou urgência",
        "Confira SEMPRE os dados do destinatário antes de confirmar",
        "Desconfie de pedidos de PIX por WhatsApp, mesmo de conhecidos",
        "Use apenas o app oficial do seu banco",
        "Ative notificações de transações no seu banco",
        "Nunca compartilhe QR Code de recebimento em grupos públicos"
      ]
    },
    whatsapp: {
      titulo: "Dicas de Segurança para WhatsApp",
      dicas: [
        "Ative verificação em duas etapas",
        "Nunca compartilhe código de 6 dígitos recebido por SMS",
        "Desconfie de mensagens pedindo dinheiro, mesmo de familiares",
        "Ligue para confirmar antes de transferir",
        "Não clique em links suspeitos",
        "Configure privacidade da foto de perfil"
      ]
    },
    email: {
      titulo: "Dicas de Segurança para E-mail",
      dicas: [
        "Verifique o remetente completo (não apenas o nome)",
        "Não clique em links de e-mails suspeitos",
        "Bancos nunca pedem senha por e-mail",
        "Desconfie de erros de português",
        "Não baixe anexos de remetentes desconhecidos",
        "Use autenticação de dois fatores"
      ]
    },
    telefone: {
      titulo: "Dicas de Segurança para Ligações",
      dicas: [
        "Bancos nunca ligam pedindo senha ou código",
        "Desconfie de ligações sobre prêmios ou promoções",
        "Não confirme dados pessoais por telefone",
        "Na dúvida, desligue e ligue você para o número oficial",
        "Não instale apps por orientação de ligações",
        "Golpistas podem falsificar número de telefone (spoofing)"
      ]
    },
    geral: {
      titulo: "Dicas Gerais de Segurança Digital",
      dicas: [
        "Mantenha apps e sistema operacional atualizados",
        "Use senhas fortes e diferentes para cada serviço",
        "Ative autenticação de dois fatores sempre que possível",
        "Desconfie de ofertas muito boas para ser verdade",
        "Não forneça dados pessoais por mensagem ou telefone",
        "Verifique a URL antes de inserir dados sensíveis",
        "Na dúvida, não clique - pesquise no Google primeiro"
      ]
    }
  };
  
  const selectedTips = tips[category] || tips.geral;
  
  return {
    structuredContent: {
      categoria: category,
      ...selectedTips,
      fonte: "Baseado em recomendações do Banco Central e CERT.br"
    },
    content: `## ${selectedTips.titulo}\n\n${selectedTips.dicas.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n_Fonte: Baseado em recomendações do Banco Central e CERT.br_`,
    _meta: { traceId, processedBy: "local" }
  };
}

function formatResultForModel(toolName, data) {
  // Formata resultado para o modelo LLM processar
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
}

// ============================================
// MCP JSON-RPC ROUTER
// ============================================

async function handleJsonRpcRequest(request, env) {
  const body = await request.json();
  const { jsonrpc, id, method, params } = body;
  
  if (jsonrpc !== "2.0") {
    return createJsonRpcError(id, -32600, "Invalid JSON-RPC version");
  }
  
  try {
    let result;
    
    switch (method) {
      case 'initialize':
        result = await handleInitialize(params);
        break;
      case 'tools/list':
        result = await handleListTools();
        break;
      case 'tools/call':
        result = await handleCallTool(params, env);
        break;
      case 'notifications/initialized':
        result = {};
        break;
      default:
        return createJsonRpcError(id, -32601, `Method not found: ${method}`);
    }
    
    return createJsonRpcResponse(id, result);
    
  } catch (error) {
    console.error(`JSON-RPC error: ${error.message}`);
    return createJsonRpcError(id, -32000, error.message);
  }
}

// ============================================
// SSE HANDLER
// ============================================

async function handleSSE(request, env) {
  const url = new URL(request.url);
  
  // Probe rápido
  if (url.searchParams.get('probe') === '1') {
    return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Para SSE, precisamos de uma conexão persistente
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  
  // Envia evento de conexão
  const sessionId = generateTraceId();
  await writer.write(encoder.encode(`event: open\ndata: {"sessionId":"${sessionId}"}\n\n`));
  
  // Mantém conexão aberta (em produção, isso seria gerenciado diferentemente)
  // Por simplicidade, enviamos apenas a mensagem de conexão
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleSSEMessage(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const response = await handleJsonRpcRequest(request, env);
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// ============================================
// MAIN HANDLER
// ============================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verificação de domínio OpenAI (OBRIGATÓRIO para submissão)
    if (url.pathname === '/.well-known/openai-verification.txt') {
      return new Response(env.VERIFICATION_TOKEN || 'CONFIGURE_VERIFICATION_TOKEN', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // MCP SSE endpoint
    if (url.pathname === '/sse') {
      return handleSSE(request, env);
    }
    
    // MCP message endpoint
    if (url.pathname === '/sse/message' || url.pathname === '/mcp') {
      return handleSSEMessage(request, env);
    }
    
    // Direct JSON-RPC endpoint (alternativa)
    if (url.pathname === '/jsonrpc' && request.method === 'POST') {
      const response = await handleJsonRpcRequest(request, env);
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Invoke endpoint (para testes diretos)
    if (url.pathname === '/invoke' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { tool, arguments: args } = body;
        
        if (!tool) {
          return new Response(JSON.stringify({ error: 'Missing tool parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await handleCallTool({ name: tool, arguments: args || {} }, env);
        
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
