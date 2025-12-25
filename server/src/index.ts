/**
 * MCP Server – template base
 * Aqui ficam apenas:
 * - definição de tools
 * - schemas
 * - registro de widgets
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Criar instância do servidor MCP
const server = new McpServer({
  name: "meu-chatgpt-app",
  version: "0.1.0",
});

// 🔹 PONTO DE ENTRADA PARA DEFINIR A IDEIA DO APP
// Descreva mentalmente:
// - qual problema resolve
// - que dados expõe
// - que ações o usuário pode tomar
//
// Exemplo (não implementar agora):
// - listar algo
// - visualizar algo
// - interagir com algo

// Aqui você registrará suas tools, resources e prompts
// Exemplo:
// server.tool("exemplo", { description: "...", inputSchema: {...} }, async (params) => {
//   return { content: [{ type: "text", text: "..." }] };
// });

// Conectar ao transporte stdio
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Erro ao conectar servidor MCP:", error);
  process.exit(1);
});
