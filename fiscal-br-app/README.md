# Fiscal BR - Assistente Fiscal Brasileiro

Solução completa para operações fiscais brasileiras com MCP Server + Frontend ChatKit.

![Fiscal BR](https://img.shields.io/badge/Fiscal_BR-v1.0.0-blue)
![OpenAI ChatKit](https://img.shields.io/badge/ChatKit-React-green)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)

## Visão Geral

O Fiscal BR é uma aplicação completa que inclui:
- **MCP Server** (Cloudflare Workers) - Backend com tools fiscais
- **Frontend** (React + ChatKit) - Interface de chat moderna
- **API Backend** (FastAPI) - Orquestração ChatKit + MCP

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│  FastAPI        │────▶│  MCP Server     │
│  React+ChatKit  │     │  Backend        │     │  (Workers)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     :3000                   :8000                   :8787
```

## Funcionalidades

### Tools Fiscais (11 ferramentas)

| Categoria | Tool | Descrição |
|-----------|------|-----------|
| **Validação** | `validar_cpf` | Valida CPF com dígitos verificadores |
| | `validar_cnpj` | Valida CNPJ com dígitos verificadores |
| | `validar_chave_nfe` | Valida chave NFe (44 dígitos) |
| **Consulta** | `consultar_cnpj` | Consulta empresa na Receita Federal |
| | `consultar_ncm` | NCM com alíquotas IPI/PIS/COFINS |
| | `consultar_cfop` | CFOP com descrição |
| **Cálculo** | `calcular_icms` | ICMS interno/interestadual + DIFAL |
| | `calcular_pis_cofins` | PIS/COFINS cumulativo e não-cumulativo |
| | `calcular_simples_nacional` | Simples Nacional (Anexo I) |
| | `calcular_iss` | ISS sobre serviços (2%-5%) |
| | `calcular_impostos_nf` | Cálculo completo de NF |

## Quick Start

### 1. Clonar e Configurar

```bash
# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com sua OPENAI_API_KEY
```

### 2. Iniciar MCP Server (Worker)

```bash
cd fiscal-br-app
npm install
npm run dev
# Rodando em http://localhost:8787
```

### 3. Iniciar Backend FastAPI

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# Rodando em http://localhost:8000
```

### 4. Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:3000
```

### 5. Acessar

Abra http://localhost:3000 no navegador.

## Estrutura do Projeto

```
fiscal-br-app/
├── src/                      # MCP Server (Cloudflare Worker)
│   └── index.ts              # Worker com todas as tools
├── frontend/                 # Frontend React + ChatKit
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ToolResultDisplay.tsx
│   │   │   ├── SuggestionCards.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── lib/
│   │   │   └── config.ts     # Configurações ChatKit
│   │   ├── styles/
│   │   │   └── globals.css   # Tailwind + customizações
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                  # Backend FastAPI
│   ├── app/
│   │   └── main.py           # API + integração MCP
│   └── requirements.txt
├── tests/                    # Testes do MCP Server
│   ├── run-tests.js
│   └── test-cases.json
├── wrangler.toml             # Config Cloudflare
├── package.json
└── README.md
```

## Exemplos de Uso

### Via Chat (Frontend)

```
"Valide o CNPJ 11.222.333/0001-81 e mostre os dados da empresa"

"Calcule o ICMS de uma venda de R$ 10.000 de SP para BA"

"Quanto de Simples Nacional para faturamento de R$ 500.000/ano?"

"Calcule os impostos de uma NF: R$ 5.000 produtos, R$ 300 frete,
 de MG para SP, NCM 8471.30.19, empresa Lucro Real"
```

### Via API

```bash
# Listar tools disponíveis
curl http://localhost:8000/api/tools

# Enviar mensagem
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Valide o CPF 529.982.247-25"}]}'
```

### Via MCP Server direto

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "calcular_icms",
      "arguments": {"valor": 10000, "uf_origem": "SP", "uf_destino": "RJ"}
    },
    "id": "1"
  }'
```

## Frontend Features

- **Interface ChatKit** - Experiência de chat moderna
- **Sugestões rápidas** - Cards com exemplos de uso
- **Painel lateral** - Histórico de conversas
- **Quick Actions** - Acesso rápido às ferramentas por categoria
- **Resultados formatados** - Visualização rica para cada tipo de tool
- **Tema customizado** - Cores e estilos fiscais/profissionais
- **Responsivo** - Funciona em desktop e mobile

## Deploy

### MCP Server (Cloudflare)

```bash
npm run deploy
```

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy da pasta dist/
```

### Backend (Railway/Render/etc)

```bash
cd backend
# Deploy com uvicorn
```

## Tecnologias

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons
- **Backend**: FastAPI, OpenAI SDK, httpx
- **MCP Server**: Cloudflare Workers, TypeScript
- **APIs**: BrasilAPI (CNPJ, NCM)

## Testes

```bash
# Testar MCP Server
node tests/run-tests.js http://localhost:8787

# Com relatório HTML
node tests/run-tests.js http://localhost:8787 --html
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | Chave API da OpenAI | Sim |
| `MCP_SERVER_URL` | URL do MCP Server | Não (default: localhost:8787) |
| `VITE_CHATKIT_API_URL` | URL da API para frontend | Não (default: /chatkit) |

## Roadmap

- [x] MCP Server com 11 tools
- [x] Frontend ChatKit React
- [x] Backend FastAPI
- [x] Integração completa
- [ ] Autenticação de usuários
- [ ] Persistência de histórico
- [ ] Mais anexos Simples Nacional
- [ ] Integração SEFAZ
- [ ] Cálculo de ST
- [ ] App móvel

## Licença

MIT

---

Desenvolvido com base no projeto [comeca-ai/projeto_Apps](https://github.com/comeca-ai/projeto_Apps)
