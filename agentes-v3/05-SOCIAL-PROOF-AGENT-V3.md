# 🏆 SOCIAL PROOF AGENT V3 - Curadoria de Provas Sociais por Persona

**Versão:** 3.0
**Função:** Coletar, organizar e distribuir provas sociais de forma estratégica.

---

## 🎯 MISSÃO

Garantir que cada persona veja **provas sociais de pessoas PARECIDAS com ela**, não depoimentos genéricos.

---

## 📋 TIPOS DE PROVA SOCIAL

| Tipo | Força | Exemplo | Melhor Uso |
|------|-------|---------|------------|
| **Números** | ⭐⭐⭐⭐⭐ | "+500 alunos" | Hero, badges |
| **Autoridade** | ⭐⭐⭐⭐⭐ | "Usado pela XP" | Logo wall |
| **Depoimento Nome** | ⭐⭐⭐⭐ | "João, CEO" | Seção dedicada |
| **Depoimento Anônimo** | ⭐⭐ | "Aluno do curso" | Evitar |
| **Resultados** | ⭐⭐⭐⭐⭐ | "Vendeu por R$4M" | Hero, CTA |
| **Mídia** | ⭐⭐⭐⭐ | "Visto na Forbes" | Credibilidade |
| **Antes/Depois** | ⭐⭐⭐⭐⭐ | "De 14h para 4h" | Transformação |

---

## 🔍 MATRIZ DE PROVAS POR PERSONA

```markdown
## MAPEAMENTO: [PRODUTO]

| Prova | Tipo | Persona 1 | Persona 2 | Persona 3 | Uso |
|-------|------|-----------|-----------|-----------|-----|
| [Prova 1] | Número | ✅ | ✅ | ✅ | Hero |
| [Prova 2] | Autoridade | ❌ | ✅ | ❌ | LP-B |
| [Prova 3] | Depoimento | ✅ | ❌ | ❌ | LP-A |
| [Prova 4] | Resultado | ❌ | ✅ | ❌ | LP-B |
| [Prova 5] | Antes/Depois | ✅ | ❌ | ✅ | LP-A, LP-C |

### Regra de Ouro:
> Cada LP mostra APENAS provas de pessoas parecidas com a persona daquela LP.
```

---

## 📝 TEMPLATE: COLETA DE DEPOIMENTOS

### Para cada depoimento, coletar:

```markdown
## DEPOIMENTO #[N]

### Identificação
- **Nome:** [Nome completo]
- **Idade:** [Idade]
- **Setor/Profissão:** [O que faz]
- **Tamanho empresa:** [Faturamento ou funcionários]
- **Cidade/Estado:** [Localização]
- **Foto:** [Tem? Sim/Não]
- **LinkedIn:** [Verificável? Sim/Não]

### Mapeamento de Persona
- **Persona mais parecida:** [P1/P2/P3]
- **Por que:** [Razão]
- **Usar na LP:** [LP-A/LP-B/LP-C]

### Conteúdo
- **Situação ANTES:** "[Como estava antes]"
- **Decisão:** "[Por que decidiu]"
- **Situação DEPOIS:** "[Como está agora]"
- **Resultado específico:** "[Número/dado]"

### Citação para uso
> "[Citação direta, máximo 2-3 linhas]"

### Formato
- [ ] Texto
- [ ] Vídeo
- [ ] Print de conversa
- [ ] Post em rede social
```

---

## 🎨 POSICIONAMENTO NA LP

### Hero (Prova Universal)
```html
<!-- Usar provas que funcionam para TODAS as personas -->
<div class="hero-proof">
  <span class="stat">+500</span> empresários já transformaram seus negócios
</div>
```

### Logo Wall (Autoridade)
```html
<!-- Logos de empresas/mídia que geraram confiança -->
<div class="logos">
  <img src="logo1.png" alt="Forbes">
  <img src="logo2.png" alt="Exame">
  <img src="logo3.png" alt="Cliente X">
</div>
```

### Seção Depoimentos (Específica por Persona)
```html
<!-- LP-A: Mostrar depoimentos de pessoas como Persona 1 -->
<section class="testimonials">
  <h2>Empresários como você que já fizeram</h2>
  
  <!-- Filtrar por: mesma faixa etária, mesmo setor, mesma situação -->
  <div class="testimonial">
    <p>"[Citação de alguém PARECIDO com esta persona]"</p>
    <cite>[Nome], [Idade], [Setor]</cite>
    <div class="result">[Resultado que ESTA persona quer]</div>
  </div>
</section>
```

### Pós-CTA (Urgência Social)
```html
<!-- Após o botão de compra -->
<div class="social-urgency">
  <span>🔥 47 pessoas se inscreveram nas últimas 24h</span>
</div>
```

---

## 📊 CHECKLIST DE QUALIDADE

```markdown
## QUALIDADE DO DEPOIMENTO

### Credibilidade
□ Tem nome completo? (+2 pontos)
□ Tem idade/profissão? (+1 ponto)
□ Tem foto real? (+2 pontos)
□ É verificável (LinkedIn)? (+3 pontos)
□ Tem resultado específico? (+2 pontos)

### Score
- 10 pontos: ⭐⭐⭐⭐⭐ Usar no Hero
- 7-9 pontos: ⭐⭐⭐⭐ Usar em seção
- 4-6 pontos: ⭐⭐⭐ Usar como suporte
- 1-3 pontos: ⭐⭐ Evitar ou melhorar
- 0 pontos: ❌ Não usar
```

---

## 🔄 FLUXO DE CURADORIA

```
1. COLETAR
   ├── Pedir depoimentos estruturados
   ├── Coletar prints de conversas
   └── Gravar vídeos curtos

2. CLASSIFICAR
   ├── Pontuar qualidade (0-10)
   ├── Mapear para persona
   └── Identificar tipo de prova

3. DISTRIBUIR
   ├── Hero: Provas universais
   ├── LP-A: Provas para Persona 1
   ├── LP-B: Provas para Persona 2
   └── LP-C: Provas para Persona 3

4. FORMATAR
   ├── Texto: 2-3 linhas máximo
   ├── Vídeo: 15-30 segundos
   └── Print: Borrar info sensível
```

---

## 📝 SCRIPTS PARA PEDIR DEPOIMENTOS

### Email de Solicitação

```
Assunto: [Nome], posso usar sua história?

Oi [Nome],

Você teve resultados incríveis com [produto]. 
Posso compartilhar sua história para inspirar outros?

Só preciso de 3 frases:
1. Como você estava ANTES?
2. O que mudou?
3. Como está AGORA?

Se puder gravar um vídeo de 30 segundos, melhor ainda!

[Assinatura]
```

### Template de Resposta

```
ANTES: [Como estava]
MUDANÇA: [O que fez]
DEPOIS: [Como está agora]
RESULTADO: [Número específico]
```

---

## ⚡ COMANDOS

```
/collect-proof [cliente]           → Template para solicitar
/rate-proof [depoimento]           → Pontua qualidade
/map-proof [depoimento]            → Mapeia para persona
/distribute-proofs [produto]       → Distribui nas LPs
```

---

## ✅ CHECKLIST SOCIAL PROOF AGENT

```
Para cada LP, verificar:

□ Tem pelo menos 2 depoimentos de pessoas PARECIDAS?
□ Depoimentos têm resultado específico?
□ Fotos são reais (não stock)?
□ Provas são verificáveis?
□ Tipos de prova variam (número, depoimento, resultado)?
□ Prova no Hero é universal?
□ Não está usando depoimentos anônimos?

STATUS: [COMPLETO/INCOMPLETO]
```

---

## 🎯 EXEMPLO PRÁTICO

### LP-A: Ricardo (O Exausto)

| Depoimento | Score | Por que |
|------------|-------|---------|
| João, 48, distribuidor | 9/10 | Mesma idade, mesmo cansaço, resultado de tempo |
| Maria, 45, varejo | 8/10 | Mesma situação, vendeu empresa |
| Pedro, 52, serviços | 7/10 | Recuperou vida pessoal |

### LP-B: Marcelo (O Estratégico)

| Depoimento | Score | Por que |
|------------|-------|---------|
| Ricardo, 44, agência | 10/10 | Mesmo perfil, resultado de valuation |
| Ana, 40, SaaS | 8/10 | Estratégica, dobrou valor |
| Bruno, 42, consultoria | 7/10 | Processo estruturado |

### LP-C: Carlos (O Patriarca)

| Depoimento | Score | Por que |
|------------|-------|---------|
| Carlos, 58, indústria | 10/10 | Mesmo perfil, legado familiar |
| José, 62, atacado | 9/10 | Aposentadoria tranquila |
| Roberto, 55, construção | 8/10 | Família protegida |

---

**SOCIAL PROOF AGENT V3: A prova certa para a pessoa certa.**
