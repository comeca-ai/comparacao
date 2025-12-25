# 🚀 Primeiros Passos

## Definindo a Ideia do App

Antes de começar a codar, responda estas perguntas:

### 1. Qual problema este app resolve?
*Exemplo: "Ajudar usuários a comparar produtos com base em especificações"*

### 2. Quem é o usuário?
*Exemplo: "Consumidores que querem tomar decisões de compra informadas"*

### 3. Que ações o usuário espera?
*Exemplo: "Listar produtos, comparar especificações, ver recomendações"*

### 4. O que precisa vir do backend (MCP Server)?
*Exemplo: "Dados dos produtos, lógica de comparação, filtros"*

### 5. O que é só visual (Widget)?
*Exemplo: "Tabelas de comparação, gráficos, interface de seleção"*

---

## Criando Sua Primeira Tool

### Passo 1: Definir a Tool

No arquivo `server/src/index.ts`, adicione uma tool usando o método `tool()`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "meu-chatgpt-app",
  version: "0.1.0",
});

// Registrar uma tool simples
server.tool(
  "saudacao",  // Nome da tool
  {
    description: "Retorna uma saudação personalizada",
    inputSchema: z.object({
      nome: z.string().describe("O nome da pessoa para saudar"),
      idioma: z.enum(["pt", "en", "es"]).optional().describe("Idioma da saudação"),
    }),
  },
  async ({ nome, idioma = "pt" }) => {
    const saudacoes = {
      pt: `Olá, ${nome}! Bem-vindo ao nosso app.`,
      en: `Hello, ${nome}! Welcome to our app.`,
      es: `¡Hola, ${nome}! Bienvenido a nuestra app.`,
    };

    return {
      content: [
        {
          type: "text",
          text: saudacoes[idioma],
        },
      ],
    };
  }
);

// Conectar ao transporte stdio
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Erro ao conectar servidor MCP:", error);
  process.exit(1);
});
```

### Passo 2: Testar com MCP Inspector

```bash
# Instalar o MCP Inspector (se ainda não tiver)
npm install -g @modelcontextprotocol/inspector

# Rodar o inspector
npx @modelcontextprotocol/inspector node --loader ts-node/esm server/src/index.ts
```

O inspector abrirá em `http://localhost:5173` e você poderá:
1. Ver sua tool "saudacao" na lista
2. Testar com diferentes parâmetros
3. Ver o resultado em tempo real

### Passo 3: Adicionar Mais Funcionalidades

#### Resources (Dados Estáticos ou Dinâmicos)

```typescript
// Registrar um resource
server.resource(
  {
    uri: "app://produtos",
    name: "Lista de Produtos",
    description: "Todos os produtos disponíveis",
  },
  async () => {
    return {
      contents: [
        {
          uri: "app://produtos",
          mimeType: "application/json",
          text: JSON.stringify([
            { id: 1, nome: "Produto A", preco: 100 },
            { id: 2, nome: "Produto B", preco: 200 },
          ]),
        },
      ],
    };
  }
);
```

#### Prompts (Templates Reutilizáveis)

```typescript
// Registrar um prompt
server.prompt(
  "comparar-produtos",
  {
    description: "Template para comparar dois produtos",
    arguments: [
      {
        name: "produto1",
        description: "ID do primeiro produto",
        required: true,
      },
      {
        name: "produto2",
        description: "ID do segundo produto",
        required: true,
      },
    ],
  },
  async ({ produto1, produto2 }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare o produto ${produto1} com o produto ${produto2}, destacando diferenças em preço, características e custo-benefício.`,
          },
        },
      ],
    };
  }
);
```

---

## Desenvolvendo o Widget React

### Quando usar o Widget?

Use o widget para:
- 📊 Visualizações complexas (gráficos, tabelas)
- 🎨 Interfaces interativas
- 📱 Experiências ricas que vão além de texto

### Exemplo Básico

Edite `web/src/App.tsx`:

```tsx
import { useState, useEffect } from "react";

export default function App() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    // Aqui você pode buscar dados do MCP server via window.openai
    // ou receber props do ChatGPT
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Comparação de Produtos</h2>
      <div>
        {produtos.length === 0 ? (
          <p>Nenhum produto selecionado</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>R$ {p.preco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

### Testar o Widget

```bash
npm run dev:web
```

Acesse `http://localhost:5173` para ver o widget em ação.

---

## 🧠 Boas Práticas

### Tools

✅ **DO**: Uma tool = uma intenção clara  
✅ **DO**: Use schemas Zod explícitos  
✅ **DO**: Retorne objetos estruturados  
✅ **DO**: Adicione descrições claras

❌ **DON'T**: Criar tools genéricas tipo "do_everything"  
❌ **DON'T**: Retornar strings sem estrutura  
❌ **DON'T**: Usar nomes vagos

### Widget

✅ **DO**: Mantenha simples inicialmente  
✅ **DO**: Use componentes reutilizáveis  
✅ **DO**: Priorize clareza sobre complexidade

❌ **DON'T**: Adicionar frameworks pesados sem necessidade  
❌ **DON'T**: Colocar lógica de negócio no widget

---

## 📚 Próximos Passos

1. ✍️ Defina a ideia do seu app
2. 🔧 Crie 1-3 tools principais
3. 🧪 Teste com MCP Inspector
4. 🎨 Desenvolva o widget (se necessário)
5. 📦 Publique no ChatGPT Apps

## 🔗 Recursos Úteis

- [MCP SDK Docs](https://modelcontextprotocol.io)
- [Zod Documentation](https://zod.dev)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
