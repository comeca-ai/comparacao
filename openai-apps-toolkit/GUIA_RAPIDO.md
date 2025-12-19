# Guia Rápido - OpenAI Apps Toolkit 🇧🇷

Este guia em português te ajuda a lançar seu primeiro app na OpenAI Store de forma eficiente.

## ⚡ Processo em 6 Fases

### Fase 1: Ideação (30 min)
```
✓ Problema real e frequente?
✓ Pode ser resolvido com 1-3 tools MCP?
✓ Não viola policies da OpenAI?
✓ Tenho infraestrutura Cloudflare?
✓ Conta OpenAI verificada com role Owner?
```

### Fase 2: Design de Tools (45 min)
- Uma tool = uma ação discreta
- Descrições "Use this when..."
- Input schemas completos
- Todas as annotations obrigatórias

### Fase 3: Prompt Engineering (1 hora)
- Escrever prompt inicial
- Testar com casos reais
- Iterar 2-3x
- Documentar versão final

### Fase 4: MCP Server (1 hora)
```bash
# Deploy em 3 comandos
npm install
wrangler secret put OPENAI_API_KEY
npm run deploy
```

### Fase 5: Submissão (30 min)
```bash
# Gerar bundle de submissão
APP_NAME="Meu App" npm run bundle
```

### Fase 6: Pós-Lançamento
- Monitorar logs: `npm run logs`
- Atualizar: `npm run deploy`

---

## 🛠️ Comandos Essenciais

```bash
# Desenvolvimento local
npm run dev

# Testes
npm run test:local

# Deploy produção
npm run deploy

# Gerar bundle submissão
npm run bundle

# Ver logs
npm run logs
```

---

## 📝 Checklist de Annotations

Toda tool PRECISA ter:

| Annotation | Quando usar |
|------------|-------------|
| `readOnlyHint: true` | Tool que NÃO modifica dados |
| `destructiveHint: true` | Tool que deleta/sobrescreve |
| `openWorldHint: true` | Tool que chama API externa |

Exemplo:
```javascript
annotations: {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: true  // Se chama Workers AI ou OpenAI
}
```

---

## 📦 Estrutura de Resposta Obrigatória

```javascript
return {
  structuredContent: {
    // JSON para widget E modelo (OBRIGATÓRIO)
  },
  content: "Markdown para o modelo (opcional)",
  _meta: {
    // Dados que não vão pro modelo
  }
};
```

---

## 🚨 Erros Comuns

| Erro | Solução |
|------|---------|
| Tool sem annotation | Adicionar todas as 3 |
| Resposta sem structuredContent | Sempre retornar |
| API key no código | Usar `wrangler secret put` |
| HTTP em vez de HTTPS | Workers usa HTTPS |
| Domínio não verificado | Arquivo .well-known |

---

## 💡 Dicas para Aprovação

1. **Descrições claras**: Use "Use this when the user wants to..."
2. **Teste tudo**: Execute `npm run test` antes de submeter
3. **Documentação**: O bundle gera docs automáticos
4. **Logo profissional**: 512x512 PNG, clean design
5. **Resposta rápida**: Probe deve responder em < 1s

---

## 🔗 Links Úteis

- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [Submission Guidelines](https://developers.openai.com/apps-sdk/deploy/submission)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 📞 Próximos Passos

1. **Personalize as tools** em `src/index.js`
2. **Configure secrets**: `wrangler secret put`
3. **Teste localmente**: `npm run dev` + `npm run test:local`
4. **Deploy**: `npm run deploy`
5. **Gere bundle**: `npm run bundle`
6. **Submeta**: https://developers.openai.com/apps-sdk/deploy/submission

Boa sorte! 🚀
