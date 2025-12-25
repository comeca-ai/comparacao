/**
 * Exemplo: MCP Server com Tool de Saudação
 * 
 * Este exemplo demonstra:
 * - Como criar uma tool simples
 * - Como usar schemas Zod
 * - Como retornar conteúdo estruturado
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "exemplo-saudacao",
  version: "0.1.0",
});

// 🔧 Tool 1: Saudação Simples
server.tool(
  "saudacao",
  {
    description: "Retorna uma saudação personalizada em diferentes idiomas",
    inputSchema: z.object({
      nome: z.string().describe("O nome da pessoa para saudar"),
      idioma: z.enum(["pt", "en", "es"]).optional().default("pt").describe("Idioma da saudação"),
      formal: z.boolean().optional().default(false).describe("Se a saudação deve ser formal"),
    }),
  },
  async ({ nome, idioma, formal }) => {
    const saudacoes = {
      pt: {
        informal: `Olá, ${nome}! Bem-vindo ao nosso app.`,
        formal: `Prezado(a) ${nome}, é um prazer tê-lo(a) em nosso aplicativo.`,
      },
      en: {
        informal: `Hello, ${nome}! Welcome to our app.`,
        formal: `Dear ${nome}, we are pleased to have you in our application.`,
      },
      es: {
        informal: `¡Hola, ${nome}! Bienvenido a nuestra app.`,
        formal: `Estimado(a) ${nome}, es un placer tenerle en nuestra aplicación.`,
      },
    };

    const mensagem = formal
      ? saudacoes[idioma].formal
      : saudacoes[idioma].informal;

    return {
      content: [
        {
          type: "text",
          text: mensagem,
        },
      ],
    };
  }
);

// 🔧 Tool 2: Calculadora Simples
server.tool(
  "calcular",
  {
    description: "Realiza operações matemáticas básicas",
    inputSchema: z.object({
      operacao: z.enum(["somar", "subtrair", "multiplicar", "dividir"]).describe("Tipo de operação"),
      a: z.number().describe("Primeiro número"),
      b: z.number().describe("Segundo número"),
    }),
  },
  async ({ operacao, a, b }) => {
    let resultado: number;
    let expressao: string;

    switch (operacao) {
      case "somar":
        resultado = a + b;
        expressao = `${a} + ${b} = ${resultado}`;
        break;
      case "subtrair":
        resultado = a - b;
        expressao = `${a} - ${b} = ${resultado}`;
        break;
      case "multiplicar":
        resultado = a * b;
        expressao = `${a} × ${b} = ${resultado}`;
        break;
      case "dividir":
        if (b === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Erro: Não é possível dividir por zero.",
              },
            ],
            isError: true,
          };
        }
        resultado = a / b;
        expressao = `${a} ÷ ${b} = ${resultado}`;
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `Resultado: ${expressao}`,
        },
      ],
    };
  }
);

// 📦 Resource: Lista de Exemplos
server.resource(
  {
    uri: "example://ferramentas",
    name: "Lista de Ferramentas",
    description: "Todas as ferramentas disponíveis neste servidor de exemplo",
  },
  async () => {
    const ferramentas = [
      {
        nome: "saudacao",
        descricao: "Gera saudações personalizadas",
        parametros: ["nome", "idioma", "formal"],
      },
      {
        nome: "calcular",
        descricao: "Realiza operações matemáticas",
        parametros: ["operacao", "a", "b"],
      },
    ];

    return {
      contents: [
        {
          uri: "example://ferramentas",
          mimeType: "application/json",
          text: JSON.stringify(ferramentas, null, 2),
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
