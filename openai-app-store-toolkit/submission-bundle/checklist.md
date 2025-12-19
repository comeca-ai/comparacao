# Checklist de Submissão - OpenAI App Store

Use este checklist para garantir que sua submissão está completa.

## 1. Requisitos Obrigatórios

### Conta e Permissões
- [ ] Conta OpenAI verificada
- [ ] Role "Owner" na organização
- [ ] Aceito os termos de desenvolvedor da App Store

### Servidor MCP
- [ ] MCP Server rodando em HTTPS público
- [ ] Endpoint `/health` respondendo corretamente
- [ ] Manifesto `/.well-known/mcp.json` válido
- [ ] Content Security Policy (CSP) configurado

### Tool Annotations (CRÍTICO)
Cada tool DEVE declarar:
- [ ] `readOnlyHint` - indica se a tool não modifica dados
- [ ] `destructiveHint` - indica se pode deletar/sobrescrever dados
- [ ] `openWorldHint` - indica se chama APIs externas

Exemplo:
```json
{
  "name": "get_data",
  "annotations": {
    "readOnlyHint": true,
    "destructiveHint": false,
    "openWorldHint": false
  }
}
```

## 2. Testes Obrigatórios

### Casos de Sucesso (7 testes)
- [ ] S01: Health Check funcional
- [ ] S02: Manifesto MCP válido
- [ ] S03: Lista de tools retornando
- [ ] S04: Info do servidor correto
- [ ] S05: Tool de leitura funcionando
- [ ] S06: Tool de escrita funcionando
- [ ] S07: Tool destrutiva (com confirmação)

### Casos de Erro (3 testes)
- [ ] E01: Resposta correta para 401 (não autorizado)
- [ ] E02: Rate limit (429) funcionando
- [ ] E03: JSON-RPC inválido retorna erro correto

## 3. Assets para Upload

### Obrigatórios
- [ ] Screenshot principal (1280x800px, PNG ou JPG)
- [ ] Ícone do app (512x512px, PNG)

### Recomendados
- [ ] Screenshots adicionais (até 5)
- [ ] GIF demonstrativo
- [ ] Vídeo de demonstração (MP4, max 30s)

## 4. Informações da Submissão

### Básicas
- [ ] Nome do app (único, memorável)
- [ ] Descrição curta (< 100 caracteres)
- [ ] Descrição completa (< 500 caracteres)
- [ ] Categoria selecionada

### Legais
- [ ] URL da Política de Privacidade
- [ ] URL dos Termos de Uso
- [ ] Email de suporte

## 5. Limitações a Considerar

⚠️ **Antes de submeter, lembre-se:**

1. **Apenas 1 versão em review por vez**
   - Planeje bem antes de submeter

2. **Nomes/descrições de tools ficam bloqueados após publicação**
   - Use nomes genéricos: `get_weather` ao invés de `get_weather_sp`

3. **Apps inativos podem ser removidos**
   - Implemente keep-alive automático

4. **Não permite EU data residency**
   - Não processe dados de cidadãos EU sem consentimento

## 6. Pós-Submissão

- [ ] Monitoramento de erros configurado
- [ ] Dashboard de analytics ativo
- [ ] Keep-alive programado (recomendado: a cada 7 dias)
- [ ] Plano de resposta para feedback do review

---

## Comandos Úteis

```bash
# Executar testes
node tests/run-tests.js https://seu-mcp-server.com

# Gerar bundle de submissão
node submission-bundle/generate-bundle.js \
  --name "Meu App" \
  --url "https://mcp.exemplo.com" \
  --description "Descrição do app" \
  --category "productivity"

# Deploy do worker
cd worker-template && npm run deploy
```

---

**Data de criação**: ___/___/______
**Responsável**: ________________
**Status**: [ ] Pronto para submissão
