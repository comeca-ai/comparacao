# Meu ChatGPT App (MCP)

## 🧱 Template Oficial — MCP + React (base limpa)

Este é um template base para criar ChatGPT Apps usando o Model Context Protocol (MCP), com separação clara entre backend (MCP Server) e frontend (widget).

## 📁 Project Layout

```
meu-chatgpt-app/
├─ server/
│  └─ src/
│     └─ index.ts          # MCP server + tools (backend)
├─ web/
│  ├─ src/
│  │  └─ App.tsx           # Widget principal (React)
│  ├─ public/
│  ├─ vite.config.ts
│  └─ dist/                # Gerado automaticamente
├─ package.json
├─ tsconfig.json
└─ README.md
```

Esse layout:

✅ segue o padrão do Apps SDK

✅ separa responsabilidades

✅ funciona bem em dev e produção

✅ evita decisões prematuras

## 🧰 Stack Recomendada

### Backend (MCP Server)
- Node.js ≥ 18
- TypeScript
- @modelcontextprotocol/sdk
- zod
- FastMCP-style UX (schemas + tools claros)

### Frontend (Widget)
- React
- Vite
- CSS simples (ou Tailwind depois)
- window.openai (UX nativa do ChatGPT)

📌 **Nada de frameworks pesados agora**  
📌 **A UX "nativa" vem do MCP + tools bem definidas**

## 📦 Instalação

### 1️⃣ Instalar dependências do projeto raiz
```bash
npm install
```

### 2️⃣ Instalar dependências do frontend
```bash
cd web
npm install
cd ..
```

### Ou instalar tudo de uma vez
```bash
npm run install:all
```

## 🚀 Scripts Disponíveis

### Desenvolvimento

```bash
# Rodar o MCP server (stdio mode - para uso com MCP Inspector ou clientes)
npm run dev:server

# Rodar o widget em modo desenvolvimento
npm run dev:web

# Build do widget
npm run build:web

# Verificar tipos TypeScript
npm run check:types
```

### Testando o MCP Server

Para testar o servidor MCP, você pode usar o **MCP Inspector**:

```bash
# Instalar o MCP Inspector globalmente (se ainda não tiver)
npm install -g @modelcontextprotocol/inspector

# Rodar o inspector conectado ao seu servidor
mcp-inspector node --loader ts-node/esm server/src/index.ts
```

O MCP Inspector abrirá uma interface web onde você pode:
- Ver as tools registradas
- Testar as tools interativamente
- Verificar schemas e responses

## 💡 Ideia do App (defina antes de codar)

Responda antes de continuar:

- **Que problema esse app resolve?**
- **Quem é o usuário?**
- **Que ações o usuário espera?**
- **O que precisa vir de backend?**
- **O que é só visual (widget)?**

## 🧠 UX Nativa (IMPORTANTE)

A UX nativa não vem de UI bonita, vem de:

- ✅ **tools bem nomeadas**
- ✅ **schemas claros**
- ✅ **respostas previsíveis**
- ✅ **widgets simples**

📌 **Estilo FastMCP:**
- um tool = uma intenção
- sem "do_everything"
- schema explícito
- retorno enxuto

Isso faz o modelo:
- entender melhor
- errar menos
- agir com mais autonomia

## 🧩 Estrutura dos Arquivos

### `server/src/index.ts`
Template base do MCP Server. Aqui você irá:
- Definir tools
- Criar schemas
- Registrar widgets

### `web/src/App.tsx`
Template base do widget React. Widget simples e funcional.

## 🧠 Regra Final

**Não comece codando tools.**  
**Comece definindo a ideia do app.**

A ideia define:
- quantos tools
- que schemas
- se precisa widget complexo ou simples

## 📚 Próximos Passos

1. **Defina a ideia do app** (veja seção "Ideia do App" acima)
2. **Crie 1 tool clara** que represente a principal intenção do usuário
3. **Implemente o widget** conforme necessário
4. **Teste via MCP Inspector**

## 🔗 Recursos

- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Zod Documentation](https://zod.dev)

## 📝 License

MIT