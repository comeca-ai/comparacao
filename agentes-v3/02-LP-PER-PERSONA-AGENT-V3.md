# 📄 LP PER PERSONA AGENT V3 - Uma LP para Cada Persona

**Versão:** 3.0
**Função:** Gerar LPs específicas para cada persona, não uma LP genérica para todas.

---

## 🎯 MISSÃO

Criar **uma LP dedicada para cada persona**, com:
- Headline específica
- CTA Override específico
- Paleta de cores específica (do VISUAL AGENT)
- Copy focada nas dores DESTA persona
- Prova social relevante para ESTA persona

---

## ❌ PROBLEMA: LP GENÉRICA

```
LP Genérica (ERRADO)
├── Tenta falar com 3 personas
├── Headline compromisso (não ressoa com ninguém 100%)
├── CTA genérico ("Comprar Agora")
├── Prova social aleatória
└── Resultado: Conversão medíocre (1-2%)
```

## ✅ SOLUÇÃO: LP POR PERSONA

```
3 LPs Específicas (CERTO)
├── LP-A: Ricardo (Exausto) → Headline de liberdade
├── LP-B: Marcelo (Estratégico) → Headline de valuation
├── LP-C: Carlos (Patriarca) → Headline de legado
└── Resultado: Cada LP converte 3-5% do seu público
```

---

## 📋 ESTRUTURA DO OUTPUT

### Para cada persona, gerar:

```
/produto-nome/
├── lp-persona-1/
│   ├── index.html        (LP completa)
│   ├── style.css         (paleta específica)
│   └── copy.md           (textos isolados)
├── lp-persona-2/
│   ├── index.html
│   ├── style.css
│   └── copy.md
└── lp-persona-3/
    ├── index.html
    ├── style.css
    └── copy.md
```

---

## 🔧 TEMPLATE: MATRIZ DE DIFERENCIAÇÃO

Antes de criar as LPs, preencher esta matriz:

```markdown
## MATRIZ DE LPS POR PERSONA

| Elemento | LP-A (Persona 1) | LP-B (Persona 2) | LP-C (Persona 3) |
|----------|------------------|------------------|------------------|
| **Nome Persona** | [Nome] | [Nome] | [Nome] |
| **% do Público** | [X%] | [Y%] | [Z%] |
| **Dor Principal** | [Dor] | [Dor] | [Dor] |
| **Desejo Principal** | [Desejo] | [Desejo] | [Desejo] |
| **Ângulo de Copy** | [Liberdade/Valuation/Legado] | | |
| **Headline** | "[Exata]" | "[Exata]" | "[Exata]" |
| **Subheadline** | "[Exata]" | "[Exata]" | "[Exata]" |
| **CTA Principal** | "[CTA Override]" | "[CTA Override]" | "[CTA Override]" |
| **Cor Primária** | #XXXXXX | #XXXXXX | #XXXXXX |
| **Cor Accent** | #XXXXXX | #XXXXXX | #XXXXXX |
| **Prova Social Ideal** | [Tipo] | [Tipo] | [Tipo] |
| **Objeção #1** | "[Objeção]" | "[Objeção]" | "[Objeção]" |
| **Quebra Objeção** | "[Como quebra]" | "[Como quebra]" | "[Como quebra]" |
| **Timing Ideal** | [Dia/Hora] | [Dia/Hora] | [Dia/Hora] |
| **Canal Principal** | [Instagram/LinkedIn/Email] | | |
```

---

## 📄 TEMPLATE: LP ESPECÍFICA POR PERSONA

### Seção Hero (Personalizada)

```html
<!-- LP PARA: [NOME DA PERSONA] -->
<!-- ÂNGULO: [Liberdade/Valuation/Legado] -->

<section class="hero" style="background: var(--primary-persona-X);">
  
  <!-- Badge contextual para ESTA persona -->
  <span class="badge">[Badge relevante para esta persona]</span>
  
  <!-- HEADLINE: Específica para ESTA persona -->
  <h1>[Headline que ressoa com ESTA persona]</h1>
  
  <!-- SUBHEADLINE: Promessa para ESTA persona -->
  <p class="sub">[Subheadline focada na dor/desejo DESTA persona]</p>
  
  <!-- MICRO-COPY: Quebra objeção #1 DESTA persona -->
  <p class="micro">[Texto que quebra a objeção principal]</p>
  
  <!-- CTA: Override DESTA persona -->
  <a href="#pricing" class="btn-primary">
    [CTA ESPECÍFICO - NÃO GENÉRICO]
  </a>
  
</section>
```

---

### Seção Problema (Personalizada)

```html
<section class="problem">
  
  <h2>Você se identifica com isso?</h2>
  
  <!-- Mostrar APENAS as dores DESTA persona -->
  <div class="problem-card">
    <h3>[Dor #1 desta persona]</h3>
    <p>[Descrição]</p>
    <blockquote>"[Citação real desta persona]"</blockquote>
  </div>
  
  <div class="problem-card">
    <h3>[Dor #2 desta persona]</h3>
    <p>[Descrição]</p>
    <blockquote>"[Citação real desta persona]"</blockquote>
  </div>
  
</section>
```

---

### Seção Prova Social (Personalizada)

```html
<section class="testimonials">
  
  <h2>Pessoas como você que já fizeram</h2>
  
  <!-- DEPOIMENTOS de pessoas PARECIDAS com esta persona -->
  <!-- Mesma idade, mesmo setor, mesma situação -->
  
  <div class="testimonial">
    <p>"[Depoimento de alguém PARECIDO com esta persona]"</p>
    <cite>
      [Nome], [Idade similar], [Setor similar], [Cidade]
    </cite>
    <div class="result">
      [Resultado que ESTA persona quer]
    </div>
  </div>
  
</section>
```

---

## 🎨 CSS VARIABLES POR PERSONA

```css
/* ===== LP PERSONA 1: [NOME] ===== */
/* Ângulo: [Liberdade/Valuation/Legado] */
/* Emoção: [Cansaço/Ambição/Segurança] */

:root {
  --primary: #[cor pesquisada para esta persona];
  --accent: #[cor de ação para esta persona];
  --text: #[cor de texto];
  /* ... resto das variáveis */
}

/* ===== LP PERSONA 2: [NOME] ===== */
/* Arquivo separado: style-persona-2.css */
```

---

## 🔄 FLUXO DE ADS + LPs

```
┌─────────────────────────────────────────────────────┐
│                    META ADS                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  AD SET 1              AD SET 2              AD SET 3│
│  Público: Exaustos     Público: Analíticos   Público: 50+│
│  Criativo: Liberdade   Criativo: ROI         Criativo: Família│
│       │                     │                     │  │
│       ▼                     ▼                     ▼  │
│    LP-A                  LP-B                  LP-C  │
│  (Ricardo)             (Marcelo)             (Carlos)│
│       │                     │                     │  │
│       └──────────┬──────────┴──────────┬──────────┘  │
│                  ▼                                   │
│           MESMO CHECKOUT                             │
│           MESMA OFERTA                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 MÉTRICAS POR LP

```markdown
## DASHBOARD DE PERFORMANCE

| LP | Persona | Tráfego | CTR | Conversão | CAC | Status |
|----|---------|---------|-----|-----------|-----|--------|
| LP-A | Ricardo | 1.000 | 3.2% | 2.1% | R$450 | ✅ Boa |
| LP-B | Marcelo | 800 | 4.1% | 1.8% | R$520 | ⚠️ Ajustar |
| LP-C | Carlos | 500 | 2.8% | 3.2% | R$380 | ✅ Melhor |

### Insights:
- LP-C (Carlos) tem melhor conversão → escalar este público
- LP-B (Marcelo) tem bom CTR mas baixa conversão → melhorar LP
- LP-A (Ricardo) performance média → testar novas headlines
```

---

## ⚡ COMANDOS

```
/lp-persona [persona-name]         → Gera LP específica
/lp-all-personas                   → Gera 3 LPs de uma vez
/lp-matrix [produto]               → Gera matriz de diferenciação
/lp-compare [persona1] [persona2]  → Compara elementos das LPs
```

---

## ✅ CHECKLIST LP POR PERSONA

```
Para cada LP, verificar:

□ Headline é específica para ESTA persona?
□ CTA é o Override desta persona (não genérico)?
□ Cores vieram do VISUAL AGENT para ESTA persona?
□ Dores mostradas são as DESTA persona?
□ Citações são de pessoas PARECIDAS com esta persona?
□ Depoimentos são de perfis SIMILARES?
□ Objeção #1 DESTA persona está quebrada?
□ Timing de ads está configurado para ESTA persona?

STATUS: [COMPLETO/INCOMPLETO]
```

---

## 🎯 EXEMPLO PRÁTICO: EXIT READY

### LP-A: Ricardo (O Exausto)

| Elemento | Valor |
|----------|-------|
| **Headline** | "Pare de ser refém do seu próprio negócio" |
| **Subheadline** | "Prepare sua saída em 90 dias e recupere sua vida" |
| **CTA** | "QUERO MINHA LIBERDADE DE VOLTA" |
| **Cor Primária** | Azul escuro (#0f172a) - calma, profissionalismo |
| **Cor Accent** | Laranja (#f59e0b) - energia, ação |
| **Prova Social** | João, 48 anos, distribuidor, "de 14h para 5h por dia" |
| **Objeção** | "Não tenho tempo" → "Só 4h por semana" |
| **Canal** | Instagram, domingo à noite |

### LP-B: Marcelo (O Estratégico)

| Elemento | Valor |
|----------|-------|
| **Headline** | "Sua empresa pode valer 2x mais. Você sabe como?" |
| **Subheadline** | "O framework para maximizar seu valuation antes de vender" |
| **CTA** | "VER O MÉTODO COMPLETO" |
| **Cor Primária** | Azul mais claro (#1e40af) - confiança, dados |
| **Cor Accent** | Verde (#10b981) - crescimento, sucesso |
| **Prova Social** | Ricardo, 44 anos, agência, "vendeu por R$4.2M vs oferta inicial R$1.8M" |
| **Objeção** | "Meu caso é diferente" → "Funciona para qualquer PME R$1-20M" |
| **Canal** | LinkedIn, terça-feira manhã |

### LP-C: Carlos (O Patriarca)

| Elemento | Valor |
|----------|-------|
| **Headline** | "31 anos de trabalho merecem um final digno" |
| **Subheadline** | "Venda sua empresa e garanta o futuro da sua família" |
| **CTA** | "GARANTIR O FUTURO DA MINHA FAMÍLIA" |
| **Cor Primária** | Verde escuro (#064e3b) - segurança, tradição |
| **Cor Accent** | Dourado (#d97706) - valor, legado |
| **Prova Social** | Carlos, 58 anos, indústria, "aposentado, viajando com esposa" |
| **Objeção** | "Não confio em internet" → "Converse antes de decidir" |
| **Canal** | Email, sábado manhã |

---

**LP PER PERSONA AGENT V3: Uma LP = Uma Persona = Máxima Conversão**
