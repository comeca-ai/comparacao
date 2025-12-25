# 📚 Exemplos de Uso

Esta pasta contém exemplos práticos de como usar o template MCP + React.

## 🔧 Exemplos Disponíveis

### 1. `server-with-tools.ts`

Servidor MCP com exemplos de:
- Tool de saudação (com parâmetros opcionais)
- Tool de calculadora (com tratamento de erros)
- Resource estático (lista de ferramentas)

#### Como testar:

```bash
# Usando MCP Inspector
npx @modelcontextprotocol/inspector node --loader ts-node/esm examples/server-with-tools.ts

# Ou rodando diretamente (stdio mode)
node --loader ts-node/esm examples/server-with-tools.ts
```

#### Ferramentas disponíveis:

1. **saudacao**
   - Parâmetros: `nome`, `idioma` (opcional), `formal` (opcional)
   - Exemplo: `{ "nome": "Maria", "idioma": "pt", "formal": true }`

2. **calcular**
   - Parâmetros: `operacao`, `a`, `b`
   - Exemplo: `{ "operacao": "somar", "a": 10, "b": 5 }`

3. **Resource: ferramentas**
   - URI: `example://ferramentas`
   - Lista todas as ferramentas disponíveis

## 💡 Como Adaptar para Seu Projeto

1. Copie o exemplo que mais se aproxima do que você precisa
2. Renomeie as tools para refletir seu domínio
3. Ajuste os schemas para seus dados
4. Implemente a lógica de negócio
5. Teste com o MCP Inspector

## 🎯 Padrões Recomendados

### Nomenclatura de Tools
- Use verbos no infinitivo: `buscar`, `criar`, `atualizar`, `deletar`
- Seja específico: `buscar_produto` em vez de `buscar`
- Evite nomes genéricos como `fazer`, `executar`

### Estrutura de Schemas
```typescript
z.object({
  // Parâmetros obrigatórios primeiro
  id: z.string().describe("ID único do recurso"),
  
  // Parâmetros opcionais depois
  filtro: z.string().optional().describe("Filtro opcional"),
  
  // Use enums para valores conhecidos
  tipo: z.enum(["A", "B", "C"]).describe("Tipo de recurso"),
})
```

### Tratamento de Erros
```typescript
if (condicaoDeErro) {
  return {
    content: [{
      type: "text",
      text: "Mensagem de erro clara e acionável"
    }],
    isError: true
  };
}
```

## 📖 Recursos Adicionais

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
