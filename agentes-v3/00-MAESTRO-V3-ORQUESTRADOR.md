# 🎼 MAESTRO V3 - ORQUESTRADOR COMPLETO

**Versão:** 3.0
**Evolução:** LIGHT V2 → V3 com novos agentes

---

## 🆕 O QUE MUDOU DO V2 PARA V3

| Aspecto | V2 (Light) | V3 (Completo) |
|---------|------------|---------------|
| **LPs** | 1 LP para todas as personas | **1 LP por persona** |
| **Cores** | Intuição/"boas práticas" | **Pesquisa VISUAL AGENT** |
| **Objeções** | Inventadas | **OBJECTION HUNTER** |
| **Variações** | Manuais | **COPY VARIATOR** automático |
| **Testes A/B** | Ad-hoc | **Roadmap estruturado** |
| **Tempo** | 40 min | 60-90 min |
| **Output** | 1 LP + docs | **3 LPs + variações + roadmap** |

---

## 🏗️ ARQUITETURA V3

```
┌─────────────────────────────────────────────────────────────┐
│                      MAESTRO V3                              │
│                   (Orquestrador)                             │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   FASE 1     │   │   FASE 2     │   │   FASE 3     │
│   COLETA     │──▶│  RESEARCH    │──▶│  PERSONAS    │
│              │   │   AGENT      │   │   AGENT      │
└──────────────┘   └──────────────┘   └──────────────┘
                            │                   │
                            ▼                   │
                   ┌──────────────┐            │
                   │  OBJECTION   │◀───────────┘
                   │   HUNTER     │
                   │   [NOVO]     │
                   └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   VISUAL     │   │   LP PER     │   │    COPY      │
│   AGENT      │──▶│  PERSONA     │◀──│  VARIATOR    │
│   [NOVO]     │   │   [NOVO]     │   │   [NOVO]     │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │     QA       │
                   │   AGENT      │
                   └──────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │  BRIEFING    │
                   │   + A/B      │
                   │  ROADMAP     │
                   └──────────────┘
```

---

## 📋 FLUXO COMPLETO V3

### FASE 1: COLETA (5 min)
```
INPUT: Termo do produto + Conversa com cliente

PERGUNTAS (máx 5):
1. Qual o preço do produto?
2. Já tem provas/depoimentos?
3. Qual o principal resultado que promete?
4. Qual sua história/credencial?
5. Quem é seu cliente ideal (se souber)?

OUTPUT: Briefing inicial documentado
```

---

### FASE 2: RESEARCH AGENT (10 min)
```
INPUT: Briefing da Fase 1

EXECUTA:
├── Pesquisa de mercado (tamanho, crescimento)
├── Análise de 3-5 concorrentes
├── Coleta de dores (com citações REAIS)
├── Coleta de desejos (com evidências)
├── Identificação de ângulos de copy
└── Planejamento de Quick Wins

OUTPUT: 
├── Research completo
├── 3 ângulos prontos
└── 3 Quick Wins
```

---

### FASE 3: PERSONAS AGENT (10 min)
```
INPUT: Research da Fase 2

EXECUTA:
├── Criação de 3 personas distintas
├── Jornada visual (Dia 1→5)
├── Trigger de compra específico
├── CTA Override para cada
└── Objeção #1 de cada

OUTPUT:
├── 3 Personas completas
├── Matriz de diferenciação
└── CTAs específicos
```

---

### FASE 4: OBJECTION HUNTER [NOVO] (10 min)
```
INPUT: Personas + Nicho

EXECUTA:
├── Pesquisa em reviews/fóruns/grupos
├── Coleta de objeções com citações
├── Classificação por frequência/intensidade
├── Criação de scripts de quebra
└── Mapeamento de onde colocar na LP

OUTPUT:
├── Matriz de objeções priorizada
├── Scripts de quebra
└── FAQ baseado em objeções reais
```

---

### FASE 5: VISUAL AGENT [NOVO] (5 min)
```
INPUT: Personas + Nicho

EXECUTA:
├── Pesquisa de marcas que público confia
├── Análise de sites que frequentam
├── Identificação de padrões visuais
├── Definição de paleta POR PERSONA
└── Escolha de tipografia

OUTPUT:
├── Paleta de cores por persona (com justificativa)
├── Tipografia recomendada
├── CSS Variables prontas
└── Moodboard descritivo
```

---

### FASE 6: LP PER PERSONA [NOVO] (20 min)
```
INPUT: Research + Personas + Objeções + Visual

EXECUTA:
├── Criação de LP-A (Persona 1)
├── Criação de LP-B (Persona 2)
├── Criação de LP-C (Persona 3)
│
└── Cada LP com:
    ├── Headline específica
    ├── CTA Override
    ├── Cores da persona
    ├── Prova social relevante
    └── Objeções quebradas

OUTPUT:
├── 3 arquivos HTML
├── 3 arquivos CSS
└── Matriz de diferenciação
```

---

### FASE 7: COPY VARIATOR [NOVO] (10 min)
```
INPUT: 3 LPs criadas

EXECUTA:
├── Gera 5-7 variações de headline por LP
├── Gera 5 variações de CTA por LP
├── Gera 3 variações de urgência
├── Define hipóteses para cada
└── Cria roadmap de testes

OUTPUT:
├── Documento de variações
├── Roadmap A/B de 4 semanas
└── Budget de teste recomendado
```

---

### FASE 8: QA AGENT (5 min)
```
INPUT: 3 LPs + Variações

EXECUTA:
├── Checklist de 5 críticos (para cada LP)
├── Verificação de responsividade
├── Verificação de CTAs
└── Teste de fluxo

OUTPUT:
├── Status de cada LP
└── Lista de fixes (se houver)
```

---

### FASE 9: BRIEFING + ROADMAP (5 min)
```
INPUT: Tudo anterior

EXECUTA:
├── Resumo executivo
├── Roadmap de 7 dias
├── Fail Detector
├── Plano de A/B testing
└── Métricas de sucesso

OUTPUT:
├── Briefing executivo
├── Roadmap de lançamento
└── Dashboard de métricas
```

---

## 📦 OUTPUT FINAL V3

```
/produto-nome/
├── 00-COLETA.md
├── 01-RESEARCH.md
├── 02-PERSONAS.md
├── 03-OBJECTIONS.md          [NOVO]
├── 04-VISUAL.md              [NOVO]
├── 05-LP-PERSONA-1/
│   ├── index.html
│   ├── style.css
│   └── variations.md         [NOVO]
├── 06-LP-PERSONA-2/
│   ├── index.html
│   ├── style.css
│   └── variations.md
├── 07-LP-PERSONA-3/
│   ├── index.html
│   ├── style.css
│   └── variations.md
├── 08-QA-CHECKLIST.md
├── 09-BRIEFING.md
└── 10-AB-ROADMAP.md          [NOVO]
```

---

## ⏱️ TEMPO TOTAL

| Fase | V2 | V3 | Diferença |
|------|----|----|-----------|
| Coleta | 5 min | 5 min | = |
| Research | 10 min | 10 min | = |
| Personas | 10 min | 10 min | = |
| Objection Hunter | - | 10 min | +10 |
| Visual | - | 5 min | +5 |
| LP | 12 min (1 LP) | 20 min (3 LPs) | +8 |
| Copy Variator | - | 10 min | +10 |
| QA | 3 min | 5 min | +2 |
| Briefing | 2 min | 5 min | +3 |
| **TOTAL** | **40 min** | **80 min** | **+40 min** |

**Trade-off:** +40 min de trabalho = 3 LPs otimizadas + variações A/B + cores pesquisadas

---

## 🆚 COMPARATIVO DE OUTPUT

| Output | V2 | V3 |
|--------|----|----|
| LPs | 1 | 3 |
| Variações de headline | 3-5 (comentários) | 15-21 (5-7 por LP) |
| Variações de CTA | 3 | 15 (5 por LP) |
| Paletas de cores | 1 (intuição) | 3 (pesquisadas) |
| Objeções documentadas | 3 (inventadas) | 10+ (pesquisadas) |
| Roadmap A/B | Básico | 4 semanas estruturado |

---

## ⚡ COMANDOS V3

```
/combo-v3 [termo]                  → Fluxo completo V3
/combo-light [termo]               → Fluxo V2 (mais rápido)

/research [tema]                   → Só research
/personas [nicho]                  → Só personas
/objections [nicho]                → Só objeções
/visual [nicho]                    → Só visual
/lp-persona [persona]              → LP para 1 persona
/lp-all                            → 3 LPs
/variations [produto]              → Variações A/B
/ab-roadmap [produto]              → Roadmap de testes
```

---

## 🎯 QUANDO USAR V2 vs V3

| Situação | Usar |
|----------|------|
| MVP, teste rápido | V2 (40 min) |
| Lançamento único, baixo budget | V2 |
| Precisa validar rápido | V2 |
| Lançamento profissional | **V3** |
| Budget para A/B testing | **V3** |
| Múltiplas personas distintas | **V3** |
| Quer maximizar conversão | **V3** |

---

## ✅ CHECKLIST MAESTRO V3

```
□ FASE 1: Coleta feita com cliente?
□ FASE 2: Research com citações reais?
□ FASE 3: 3 Personas com CTA Override?
□ FASE 4: Objeções pesquisadas (não inventadas)?
□ FASE 5: Cores pesquisadas (não intuição)?
□ FASE 6: 3 LPs criadas (1 por persona)?
□ FASE 7: Variações A/B documentadas?
□ FASE 8: QA passou (5/5 em cada LP)?
□ FASE 9: Briefing + Roadmap pronto?

STATUS: [COMPLETO/INCOMPLETO]
```

---

**MAESTRO V3: Mais completo, mais científico, mais conversão.**
