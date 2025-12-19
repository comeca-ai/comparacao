/**
 * Configurações do ChatKit para Fiscal BR
 */

export const CHATKIT_CONFIG = {
  // API endpoints
  api: {
    baseUrl: import.meta.env.VITE_CHATKIT_API_URL || '/chatkit',
    sessionEndpoint: '/api/session',
    mcpEndpoint: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8787',
  },

  // UI Configuration
  ui: {
    title: 'Fiscal BR',
    subtitle: 'Assistente Fiscal Brasileiro',
    placeholder: 'Digite sua dúvida fiscal...',
    welcomeMessage: `Olá! Sou o **Fiscal BR**, seu assistente fiscal brasileiro.

Posso ajudar você com:
- **Validação** de CPF e CNPJ
- **Consulta** de empresas na Receita Federal
- **Cálculo de impostos** (ICMS, PIS, COFINS, ISS, Simples Nacional)
- **Consulta NCM** e CFOP
- **Validação de chave NFe**

Como posso ajudar?`,
  },

  // Suggested prompts
  suggestions: [
    {
      title: 'Validar CNPJ',
      prompt: 'Valide o CNPJ 11.222.333/0001-81 e mostre os dados da empresa',
      icon: 'building',
    },
    {
      title: 'Calcular ICMS',
      prompt: 'Calcule o ICMS de uma venda de R$ 10.000 de São Paulo para Rio de Janeiro',
      icon: 'calculator',
    },
    {
      title: 'Simples Nacional',
      prompt: 'Calcule o imposto do Simples Nacional para uma empresa com faturamento de R$ 500.000 nos últimos 12 meses e R$ 50.000 este mês',
      icon: 'receipt',
    },
    {
      title: 'Consultar NCM',
      prompt: 'Qual é a descrição e alíquotas do NCM 8471.30.19 (notebooks)?',
      icon: 'search',
    },
  ],

  // Tools available
  tools: [
    { name: 'validar_cpf', label: 'Validar CPF', category: 'validacao' },
    { name: 'validar_cnpj', label: 'Validar CNPJ', category: 'validacao' },
    { name: 'consultar_cnpj', label: 'Consultar Empresa', category: 'consulta' },
    { name: 'calcular_icms', label: 'Calcular ICMS', category: 'calculo' },
    { name: 'calcular_pis_cofins', label: 'Calcular PIS/COFINS', category: 'calculo' },
    { name: 'calcular_simples_nacional', label: 'Simples Nacional', category: 'calculo' },
    { name: 'calcular_iss', label: 'Calcular ISS', category: 'calculo' },
    { name: 'consultar_ncm', label: 'Consultar NCM', category: 'consulta' },
    { name: 'consultar_cfop', label: 'Consultar CFOP', category: 'consulta' },
    { name: 'validar_chave_nfe', label: 'Validar Chave NFe', category: 'validacao' },
    { name: 'calcular_impostos_nf', label: 'Calcular NF Completa', category: 'calculo' },
  ],

  // Theme
  theme: {
    primary: '#0066CC',
    secondary: '#004C99',
    accent: '#00994C',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export type ToolName = typeof CHATKIT_CONFIG.tools[number]['name'];
export type ToolCategory = 'validacao' | 'consulta' | 'calculo';
