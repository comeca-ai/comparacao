/**
 * MCP Server Worker - Proxy para OpenAI Agents API
 *
 * Este worker implementa um servidor MCP compatível com a OpenAI App Store,
 * atuando como proxy inteligente para a Agents API.
 *
 * Recursos:
 * - Tool Annotations completas (readOnlyHint, destructiveHint, openWorldHint)
 * - Rate limiting built-in
 * - Logging estruturado
 * - Health check / Keep-alive
 * - Content Security Policy
 */

export interface Env {
  OPENAI_API_KEY: string;
  ENVIRONMENT: string;
  RATE_LIMIT_RPM: string;
  KEEP_ALIVE_DAYS: string;
  MCP_CACHE?: KVNamespace;
}

// ============================================================================
// CONFIGURAÇÃO DE TOOLS
// ============================================================================

interface ToolAnnotation {
  readOnlyHint: boolean;      // Não modifica dados
  destructiveHint: boolean;    // Pode deletar/sobrescrever
  openWorldHint: boolean;      // Chama APIs externas
}

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  annotations: ToolAnnotation;
}

// Defina suas tools aqui
const TOOLS: Tool[] = [
  {
    name: "get_data",
    description: "Busca dados do sistema de forma segura",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Termo de busca" },
        limit: { type: "number", description: "Limite de resultados" }
      },
      required: ["query"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "update_data",
    description: "Atualiza dados existentes no sistema",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do registro" },
        data: { type: "object", description: "Dados para atualizar" }
      },
      required: ["id", "data"]
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "delete_data",
    description: "Remove dados do sistema (ação destrutiva)",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do registro a remover" },
        confirm: { type: "boolean", description: "Confirmação da ação" }
      },
      required: ["id", "confirm"]
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false
    }
  },
  {
    name: "call_external_api",
    description: "Faz chamada a API externa",
    parameters: {
      type: "object",
      properties: {
        endpoint: { type: "string", description: "URL da API" },
        method: { type: "string", description: "Método HTTP" }
      },
      required: ["endpoint"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  }
];

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string, limitRpm: number): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto

  let entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitMap.set(clientId, entry);
  }

  entry.count++;
  return entry.count <= limitRpm;
}

// ============================================================================
// CSP HEADERS
// ============================================================================

const CSP_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

// ============================================================================
// OPENAI AGENTS API PROXY
// ============================================================================

interface AgentRequest {
  messages: Array<{ role: string; content: string }>;
  tools?: Tool[];
  model?: string;
}

async function callAgentsAPI(
  env: Env,
  request: AgentRequest
): Promise<Response> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2"
    },
    body: JSON.stringify({
      model: request.model || "gpt-4-turbo-preview",
      messages: request.messages,
      tools: request.tools?.map(t => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }))
    })
  });

  return response;
}

// ============================================================================
// TOOL EXECUTION
// ============================================================================

async function executeTool(
  toolName: string,
  parameters: Record<string, unknown>,
  env: Env
): Promise<{ success: boolean; result: unknown; error?: string }> {
  const tool = TOOLS.find(t => t.name === toolName);

  if (!tool) {
    return { success: false, result: null, error: `Tool '${toolName}' não encontrada` };
  }

  // Log da execução
  console.log(JSON.stringify({
    type: "tool_execution",
    tool: toolName,
    parameters,
    annotations: tool.annotations,
    timestamp: new Date().toISOString()
  }));

  // Implementação específica de cada tool
  switch (toolName) {
    case "get_data":
      return {
        success: true,
        result: {
          data: [{ id: "1", name: "Exemplo" }],
          query: parameters.query,
          total: 1
        }
      };

    case "update_data":
      return {
        success: true,
        result: {
          updated: true,
          id: parameters.id
        }
      };

    case "delete_data":
      if (!parameters.confirm) {
        return {
          success: false,
          result: null,
          error: "Confirmação necessária para ação destrutiva"
        };
      }
      return {
        success: true,
        result: {
          deleted: true,
          id: parameters.id
        }
      };

    case "call_external_api":
      try {
        const response = await fetch(parameters.endpoint as string, {
          method: (parameters.method as string) || "GET"
        });
        const data = await response.json();
        return { success: true, result: data };
      } catch (error) {
        return {
          success: false,
          result: null,
          error: `Erro ao chamar API: ${error}`
        };
      }

    default:
      return {
        success: false,
        result: null,
        error: `Implementação não encontrada para '${toolName}'`
      };
  }
}

// ============================================================================
// MCP PROTOCOL HANDLERS
// ============================================================================

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: string | number;
}

interface MCPResponse {
  jsonrpc: string;
  result?: unknown;
  error?: { code: number; message: string };
  id: string | number;
}

async function handleMCPRequest(
  request: MCPRequest,
  env: Env
): Promise<MCPResponse> {
  const { method, params, id } = request;

  switch (method) {
    // Lista de tools disponíveis
    case "tools/list":
      return {
        jsonrpc: "2.0",
        result: {
          tools: TOOLS.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters,
            annotations: t.annotations
          }))
        },
        id
      };

    // Execução de tool
    case "tools/call":
      if (!params?.name || !params?.arguments) {
        return {
          jsonrpc: "2.0",
          error: { code: -32602, message: "Parâmetros inválidos" },
          id
        };
      }

      const toolResult = await executeTool(
        params.name as string,
        params.arguments as Record<string, unknown>,
        env
      );

      return {
        jsonrpc: "2.0",
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult.result)
            }
          ],
          isError: !toolResult.success
        },
        id
      };

    // Informações do servidor
    case "server/info":
      return {
        jsonrpc: "2.0",
        result: {
          name: "MCP Agents Proxy",
          version: "1.0.0",
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: false }
          }
        },
        id
      };

    // Health check
    case "health/check":
      return {
        jsonrpc: "2.0",
        result: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime?.() || 0
        },
        id
      };

    default:
      return {
        jsonrpc: "2.0",
        error: { code: -32601, message: `Método '${method}' não encontrado` },
        id
      };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          ...CSP_HEADERS
        }
      });
    }

    // Health check endpoint
    if (url.pathname === "/health" || url.pathname === "/.well-known/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }), {
        headers: {
          "Content-Type": "application/json",
          ...CSP_HEADERS
        }
      });
    }

    // MCP Manifest
    if (url.pathname === "/.well-known/mcp.json") {
      return new Response(JSON.stringify({
        name: "MCP Agents Proxy",
        version: "1.0.0",
        description: "Proxy MCP para OpenAI Agents API",
        tools: TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.parameters,
          annotations: t.annotations
        }))
      }), {
        headers: {
          "Content-Type": "application/json",
          ...CSP_HEADERS
        }
      });
    }

    // Rate limiting
    const clientId = request.headers.get("CF-Connecting-IP") || "anonymous";
    const limitRpm = parseInt(env.RATE_LIMIT_RPM || "60");

    if (!checkRateLimit(clientId, limitRpm)) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Rate limit exceeded" },
        id: null
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          ...CSP_HEADERS
        }
      });
    }

    // MCP endpoint principal
    if (request.method === "POST" && (url.pathname === "/" || url.pathname === "/mcp")) {
      try {
        const body = await request.json() as MCPRequest;

        // Validação JSON-RPC
        if (body.jsonrpc !== "2.0" || !body.method) {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32600, message: "Requisição JSON-RPC inválida" },
            id: body.id || null
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...CSP_HEADERS
            }
          });
        }

        const response = await handleMCPRequest(body, env);

        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
            ...CSP_HEADERS
          }
        });

      } catch (error) {
        console.error("Error processing request:", error);

        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Erro interno do servidor" },
          id: null
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...CSP_HEADERS
          }
        });
      }
    }

    // 404 para outras rotas
    return new Response(JSON.stringify({
      error: "Not Found",
      message: "Use POST / ou POST /mcp para chamadas MCP"
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        ...CSP_HEADERS
      }
    });
  }
};
