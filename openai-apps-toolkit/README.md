# OpenAI Apps Toolkit 🚀

Kit completo para desenvolvimento e submissão de apps na **OpenAI App Store** usando MCP (Model Context Protocol) e Cloudflare Workers.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Início Rápido](#início-rápido)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deploy](#deploy)
- [Submissão](#submissão)
- [FAQ](#faq)

## Visão Geral

Este toolkit fornece:

1. **Worker Template** - Cloudflare Worker com MCP Server completo
2. **Scripts de Teste** - Suite de 10 testes (7 positivos + 3 negativos)
3. **Bundle de Submissão** - Gerador automático de assets para submissão
4. **Documentação** - Guias e checklists para aprovação

### Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    ChatGPT      │────▶│  MCP Server      │────▶│  OpenAI Agents  │
│   (Interface)   │     │ (CF Worker)      │     │      API        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Workers AI      │
                        │  (Fallback)      │
                        └──────────────────┘
```

## Pré-requisitos

- Node.js 18+
- Conta Cloudflare (com créditos Workers AI, opcional)
- Conta OpenAI verificada com role **Owner**
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
# Instalar Wrangler globalmente
npm install -g wrangler

# Login na Cloudflare
wrangler login
```

## Início Rápido

### 1. Clone e Configure

```bash
cd openai-apps-toolkit
npm install
```

### 2. Configure Secrets

```bash
# API Key da OpenAI (para Agents API)
wrangler secret put OPENAI_API_KEY

# ID do seu Agent na OpenAI (opcional)
wrangler secret put AGENT_ID

# Token de verificação da OpenAI (para submissão)
wrangler secret put VERIFICATION_TOKEN
```

### 3. Desenvolvimento Local

```bash
npm run dev
# Server rodando em http://localhost:8787
```

### 4. Teste

```bash
# Em outro terminal
npm run test:local
```

### 5. Deploy

```bash
npm run deploy
# Sua URL: https://openai-mcp-server.SEU_USUARIO.workers.dev
```

## Estrutura do Projeto

```
openai-apps-toolkit/
├── src/
│   └── index.js           # MCP Server principal
├── scripts/
│   ├── run_tests.sh       # Suite de testes
│   └── build_submission_bundle.sh
├── docs/                  # Documentação gerada
├── assets/               # Logo e screenshots
├── tests/                # Testes adicionais
├── wrangler.toml         # Config Cloudflare
├── package.json
└── README.md
```

## Desenvolvimento

### Adicionando Novas Tools

Edite `src/index.js` e adicione ao array `TOOLS`:

```javascript
const TOOLS = [
  // ... tools existentes ...
  {
    name: "sua_nova_tool",
    title: "Nome da Tool",
    description: "Use this when user wants to...",
    inputSchema: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Descrição do parâmetro"
        }
      },
      required: ["param1"]
    },
    annotations: {
      readOnlyHint: true,      // Não modifica dados?
      destructiveHint: false,   // Não deleta dados?
      openWorldHint: true       // Chama API externa?
    }
  }
];
```

Depois, implemente o handler em `executeToolLocally()`.

### Annotations Obrigatórias

| Annotation | Uso |
|------------|-----|
| `readOnlyHint: true` | Tool que NÃO modifica dados |
| `destructiveHint: true` | Tool que deleta/sobrescreve |
| `openWorldHint: true` | Tool que chama APIs externas |

### Formato de Resposta

```javascript
return {
  structuredContent: { /* JSON para widget E modelo */ },
  content: "Texto markdown para o modelo",
  _meta: {
    traceId: "...",
    "openai/widgetCSP": { /* CSP config */ }
  }
};
```

## Testes

### Executar Suite Completa

```bash
# Contra localhost
npm run test:local

# Contra URL de produção
MCP_SERVER_URL=https://seu-worker.workers.dev npm run test
```

### Testes Incluídos

| # | Tipo | Teste |
|---|------|-------|
| 1 | ✅ | Health Check |
| 2 | ✅ | Probe (< 1s) |
| 3 | ✅ | Arquivo de Verificação |
| 4 | ✅ | JSON-RPC Initialize |
| 5 | ✅ | List Tools |
| 6 | ✅ | analyze_message |
| 7 | ✅ | get_security_tips |
| 8 | ❌ | Tool Inválida |
| 9 | ❌ | JSON-RPC Inválido |
| 10 | ❌ | Método Desconhecido |

## Deploy

### Cloudflare Workers

```bash
# Desenvolvimento
npm run dev

# Produção
npm run deploy

# Produção (ambiente específico)
npm run deploy:prod
```

### Verificar Logs

```bash
# Logs em tempo real
npm run logs
```

## Submissão

### 1. Gerar Bundle

```bash
APP_NAME="Seu App" \
APP_SUBTITLE="Descrição curta" \
MCP_SERVER_URL="https://seu-worker.workers.dev" \
npm run bundle
```

### 2. Verificar Bundle

O bundle será criado em `submission-bundle/` com:

- `manifest.json` - Configuração do app
- `docs/how_to_test.md` - Instruções para revisores
- `docs/tool_justification.md` - Justificativa das tools
- `docs/privacy_policy.md` - Política de privacidade
- `docs/submission_checklist.md` - Checklist final
- `assets/` - Coloque seu logo aqui (512x512 PNG)

### 3. Submeter

1. Acesse: https://developers.openai.com/apps-sdk/deploy/submission
2. Preencha o formulário
3. Adicione URL do MCP Server
4. Clique "Scan Tools"
5. Verifique domínio
6. Marque checkboxes de compliance
7. Submeta!

### Requisitos Obrigatórios

- ✅ Conta OpenAI verificada
- ✅ Role Owner na organização
- ✅ MCP Server em HTTPS público
- ✅ Todas as tools com annotations
- ✅ Logo 512x512 PNG

## FAQ

### Por que usar Cloudflare Workers?

- **Custo**: Generous free tier + créditos
- **Performance**: Edge computing, baixa latência
- **Simplicidade**: Deploy em segundos
- **Workers AI**: Modelos de IA integrados (fallback)

### Posso usar outro provedor?

Sim! O código é compatível com qualquer host que suporte:
- HTTPS
- SSE (Server-Sent Events)
- POST requests JSON

### O que é OpenAI Agents API?

É a API que permite criar e invocar Agents na OpenAI. Este toolkit pode:
1. Usar Agents API (se configurado `AGENT_ID`)
2. Fallback para Workers AI
3. Fallback para regras locais

### Como debugar?

```bash
# Ver logs em tempo real
wrangler tail

# Testar endpoint específico
curl -X POST http://localhost:8787/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool":"analyze_message","arguments":{"message":"teste"}}'
```

### Quanto tempo demora a aprovação?

Varia, mas geralmente:
- Apps simples: 1-3 dias
- Apps complexos: 1-2 semanas
- Rejeição com feedback: ajuste e resubmeta

## 📚 Referências

- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [MCP Server Build Guide](https://developers.openai.com/apps-sdk/build/mcp-server/)
- [Submission Guidelines](https://developers.openai.com/apps-sdk/deploy/submission)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou PR.

## 📄 Licença

MIT

---

**Nota:** Este é um projeto da comunidade e não é afiliado oficialmente à OpenAI ou Cloudflare.
