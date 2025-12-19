"""
Backend FastAPI para Fiscal BR - Integração ChatKit + MCP Server

Este backend:
1. Fornece endpoint para criar sessões ChatKit
2. Proxy para chamadas ao MCP Server
3. Orquestra a interação entre ChatKit e as tools fiscais
"""

import os
import json
import httpx
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Fiscal BR API",
    description="Backend para o assistente fiscal brasileiro",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8787")

# OpenAI Client
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# ============================================================================
# MODELS
# ============================================================================

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class ChatResponse(BaseModel):
    content: str
    toolCalls: Optional[list] = None

class SessionResponse(BaseModel):
    client_secret: str
    expires_at: str

# ============================================================================
# MCP CLIENT
# ============================================================================

async def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """Call a tool on the MCP Server"""
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        response = await http_client.post(
            f"{MCP_SERVER_URL}/mcp",
            json={
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                },
                "id": f"call-{datetime.now().timestamp()}"
            }
        )

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="MCP Server error")

        result = response.json()

        if "error" in result:
            return {"error": result["error"]["message"]}

        # Parse the content from MCP response
        if "result" in result and "content" in result["result"]:
            content = result["result"]["content"]
            if content and len(content) > 0:
                text = content[0].get("text", "{}")
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    return {"text": text}

        return result.get("result", {})

async def get_mcp_tools() -> list:
    """Get available tools from MCP Server"""
    async with httpx.AsyncClient(timeout=10.0) as http_client:
        try:
            response = await http_client.post(
                f"{MCP_SERVER_URL}/mcp",
                json={
                    "jsonrpc": "2.0",
                    "method": "tools/list",
                    "id": "list-tools"
                }
            )

            if response.status_code == 200:
                result = response.json()
                tools = result.get("result", {}).get("tools", [])

                # Convert to OpenAI function format
                return [
                    {
                        "type": "function",
                        "function": {
                            "name": tool["name"],
                            "description": tool["description"],
                            "parameters": tool.get("inputSchema", {})
                        }
                    }
                    for tool in tools
                ]
        except Exception as e:
            print(f"Error getting MCP tools: {e}")

    return []

# ============================================================================
# SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT = """Você é o Fiscal BR, um assistente especializado em questões fiscais e contábeis brasileiras.

Suas capacidades incluem:
- Validação de CPF e CNPJ
- Consulta de dados de empresas na Receita Federal
- Cálculo de impostos: ICMS, PIS, COFINS, ISS, Simples Nacional
- Consulta de códigos NCM e CFOP
- Validação de chaves de acesso de NFe
- Cálculo completo de impostos em notas fiscais

Diretrizes:
1. Sempre use as ferramentas disponíveis para cálculos e validações
2. Explique os resultados de forma clara e didática
3. Mencione limitações quando aplicável (ex: tabelas simplificadas)
4. Sugira consultar um contador para casos complexos
5. Seja preciso com valores monetários (use R$ e formato brasileiro)
6. Para alíquotas, sempre mostre o percentual

Formato de resposta:
- Use markdown para formatação
- Destaque valores importantes em **negrito**
- Liste informações em bullets quando apropriado
- Inclua avisos importantes em itálico
"""

# ============================================================================
# ROUTES
# ============================================================================

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fiscal-br-backend",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/session", response_model=SessionResponse)
async def create_session():
    """
    Create a ChatKit session
    Note: In production, this would create a real ChatKit session via OpenAI API
    """
    # For development, return a mock session
    # In production, use: client.chatkit.sessions.create(...)
    return SessionResponse(
        client_secret="dev_session_" + str(datetime.now().timestamp()),
        expires_at=(datetime.now()).isoformat()
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - processes user messages and returns AI responses
    """
    if not client:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )

    try:
        # Get available tools from MCP Server
        tools = await get_mcp_tools()

        # Build messages with system prompt
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

        # Call OpenAI with tools
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
            temperature=0.7,
            max_tokens=2048
        )

        assistant_message = response.choices[0].message
        tool_calls_results = []

        # Process tool calls if any
        if assistant_message.tool_calls:
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                # Call the MCP tool
                result = await call_mcp_tool(function_name, function_args)

                tool_calls_results.append({
                    "name": function_name,
                    "arguments": function_args,
                    "result": result
                })

                # Add tool result to messages for follow-up
                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [
                        {
                            "id": tool_call.id,
                            "type": "function",
                            "function": {
                                "name": function_name,
                                "arguments": tool_call.function.arguments
                            }
                        }
                    ]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })

            # Get final response after tool calls
            final_response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=2048
            )

            content = final_response.choices[0].message.content or ""
        else:
            content = assistant_message.content or ""

        return ChatResponse(
            content=content,
            toolCalls=tool_calls_results if tool_calls_results else None
        )

    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools")
async def list_tools():
    """List available fiscal tools from MCP Server"""
    tools = await get_mcp_tools()
    return {"tools": tools}

# ============================================================================
# CHATKIT PROXY (for direct ChatKit integration)
# ============================================================================

@app.api_route("/chatkit/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def chatkit_proxy(path: str):
    """
    Proxy for ChatKit requests
    In production, this would handle ChatKit protocol messages
    """
    return {"message": "ChatKit proxy endpoint", "path": path}

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
