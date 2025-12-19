# Fiscal BR - Assistente Fiscal Brasileiro

MCP Server para a OpenAI App Store focado em operações fiscais brasileiras.

## Funcionalidades

### Validação de Documentos
- **validar_cpf** - Valida CPF com verificação de dígitos
- **validar_cnpj** - Valida CNPJ com verificação de dígitos
- **validar_chave_nfe** - Valida chave de acesso NFe (44 dígitos)

### Consultas
- **consultar_cnpj** - Consulta dados da empresa na Receita Federal (via BrasilAPI)
- **consultar_ncm** - Consulta código NCM com descrição e alíquotas
- **consultar_cfop** - Consulta código CFOP com descrição

### Cálculo de Impostos
- **calcular_icms** - Calcula ICMS (interno e interestadual, com DIFAL)
- **calcular_pis_cofins** - Calcula PIS/COFINS (cumulativo e não-cumulativo)
- **calcular_simples_nacional** - Calcula imposto do Simples (Anexo I - Comércio)
- **calcular_iss** - Calcula ISS sobre serviços
- **calcular_impostos_nf** - Cálculo completo para nota fiscal

## Exemplos de Uso

### Validar CPF
```
"Valide o CPF 123.456.789-09"
```

### Consultar Empresa
```
"Consulte os dados da empresa com CNPJ 00.000.000/0001-91"
```

### Calcular ICMS
```
"Calcule o ICMS de uma venda de R$ 10.000 de SP para RJ"
```

### Calcular Simples Nacional
```
"Quanto de imposto do Simples Nacional para uma empresa com faturamento de R$ 500.000 nos últimos 12 meses e R$ 50.000 este mês?"
```

### Cálculo Completo de NF
```
"Calcule todos os impostos de uma NF de R$ 5.000 em produtos + R$ 300 de frete, de MG para SP, NCM 8471.30.19 (notebook), empresa Lucro Real"
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:8787

## Deploy

```bash
npm run deploy
```

## Testes

```bash
# Testar localmente
npm run test

# Testar produção
npm run test:prod https://fiscal-br.seu-dominio.workers.dev
```

## Estrutura do Projeto

```
fiscal-br-app/
├── src/
│   └── index.ts      # Worker principal com todas as tools
├── tests/
│   ├── run-tests.js  # Script de testes
│   └── test-cases.json
├── wrangler.toml     # Config Cloudflare
├── package.json
├── tsconfig.json
└── README.md
```

## APIs Utilizadas

- [BrasilAPI](https://brasilapi.com.br) - Consulta CNPJ e NCM (gratuita)

## Tabelas Fiscais Incluídas

- Alíquotas ICMS por estado (internas e interestaduais)
- Tabela Simples Nacional - Anexo I (Comércio)
- NCMs comuns com alíquotas IPI/PIS/COFINS
- CFOPs mais utilizados

## Limitações

- Tabelas de impostos simplificadas (consulte legislação para casos específicos)
- Simples Nacional apenas Anexo I (Comércio)
- NCM com base limitada (expanda conforme necessidade)

## Roadmap

- [ ] Adicionar mais anexos do Simples Nacional
- [ ] Integrar consulta SEFAZ para NFe
- [ ] Cálculo de ST (Substituição Tributária)
- [ ] Integrar base completa de NCM
- [ ] Suporte a GNRE

## Licença

MIT
