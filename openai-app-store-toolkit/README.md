# OpenAI App Store Toolkit

Toolkit completo para desenvolver e publicar apps na OpenAI App Store usando MCP Servers.

## Visão Geral

Este toolkit foi criado em resposta às necessidades identificadas no projeto [comeca-ai/projeto_Apps](https://github.com/comeca-ai/projeto_Apps), oferecendo uma esteira completa para:

- **Desenvolvimento** de MCP Servers
- **Testes** automatizados (7 success + 3 error cases)
- **Submissão** automatizada para a App Store

## Estrutura do Projeto

```
openai-app-store-toolkit/
├── ANALISE-RESPOSTAS.md      # Análise completa e respostas às dúvidas
├── README.md                  # Este arquivo
│
├── worker-template/           # [A] Template de Worker Cloudflare
│   ├── wrangler.toml         # Configuração do Wrangler
│   ├── package.json          # Dependências
│   ├── tsconfig.json         # Config TypeScript
│   └── src/
│       └── index.ts          # Worker principal com proxy MCP
│
├── tests/                     # [B] Suite de Testes
│   ├── run-tests.js          # Script executor de testes
│   ├── test-cases.json       # 7 casos sucesso + 3 erro
│   └── output/               # Relatórios gerados
│
└── submission-bundle/         # [C] Gerador de Bundle
    ├── generate-bundle.js    # Script de geração
    └── checklist.md          # Checklist de submissão
```

## Início Rápido

### 1. Configurar o Worker

```bash
cd worker-template
npm install

# Configurar API Key da OpenAI
wrangler secret put OPENAI_API_KEY

# Desenvolvimento local
npm run dev

# Deploy para produção
npm run deploy
```

### 2. Executar Testes

```bash
cd tests

# Testar servidor local
node run-tests.js http://localhost:8787

# Testar servidor em produção
node run-tests.js https://mcp.seudominio.com

# Gerar relatório HTML
node run-tests.js https://mcp.seudominio.com --html
```

### 3. Gerar Bundle de Submissão

```bash
cd submission-bundle

# Validar servidor
node generate-bundle.js \
  --name "Meu App" \
  --url "https://mcp.exemplo.com" \
  --validate

# Gerar bundle completo
node generate-bundle.js \
  --name "Meu App" \
  --url "https://mcp.exemplo.com" \
  --description "Descrição do meu app incrível" \
  --category "productivity"
```

## Opções Implementadas

| Opção | Descrição | Status |
|-------|-----------|--------|
| **A** | Worker template com proxy Agents API | ✅ Completo |
| **B** | Script de testes (7+3 casos) | ✅ Completo |
| **C** | Bundle de submissão automatizado | ✅ Completo |
| **D** | Pacote completo (A+B+C) | ✅ Completo |

## Worker Template - Recursos

- **MCP Protocol compliant** - Implementa tools/list, tools/call, server/info
- **Tool Annotations** - readOnlyHint, destructiveHint, openWorldHint
- **Rate Limiting** - Proteção contra abuso
- **CSP Headers** - Content Security Policy configurado
- **Health Check** - Endpoint /health para monitoramento
- **Manifesto MCP** - /.well-known/mcp.json automático

## Script de Testes - Casos

### Sucesso (7 casos)
1. Health Check funcional
2. Manifesto MCP válido
3. Lista de tools
4. Info do servidor
5. Tool get_data
6. Tool update_data
7. Tool delete_data (com confirmação)

### Erro (3 casos)
1. Unauthorized (401)
2. Rate Limit (429)
3. JSON-RPC inválido

## Requisitos

- Node.js 18+
- Conta Cloudflare (para Workers)
- Conta OpenAI verificada com role Owner
- Domínio com HTTPS

## Documentação Adicional

- [ANALISE-RESPOSTAS.md](./ANALISE-RESPOSTAS.md) - Análise completa do projeto
- [Checklist de Submissão](./submission-bundle/checklist.md) - Lista de verificação

## Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT

---

*Gerado com base no projeto [comeca-ai/projeto_Apps](https://github.com/comeca-ai/projeto_Apps)*
