/**
 * Fiscal BR - MCP Server para Contabilidade Brasileira
 *
 * App para OpenAI App Store focado em operações fiscais brasileiras:
 * - Consulta e validação de CNPJ/CPF
 * - Cálculo de impostos (ICMS, PIS, COFINS, ISS, Simples Nacional)
 * - Consulta NCM (Nomenclatura Comum do Mercosul)
 * - Consulta CFOP (Código Fiscal de Operações)
 * - Validação de Chave de Acesso NFe
 *
 * APIs utilizadas:
 * - BrasilAPI (https://brasilapi.com.br) - Dados públicos
 * - ReceitaWS (gratuito) - Consulta CNPJ
 */

export interface Env {
  ENVIRONMENT: string;
  RATE_LIMIT_RPM: string;
}

// ============================================================================
// TIPOS
// ============================================================================

interface ToolAnnotation {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  openWorldHint: boolean;
}

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
  annotations: ToolAnnotation;
}

// ============================================================================
// DADOS FISCAIS BRASILEIROS
// ============================================================================

// Tabela de alíquotas ICMS por estado (simplificada - alíquota interna)
const ICMS_ALIQUOTAS: Record<string, number> = {
  'AC': 19, 'AL': 19, 'AP': 18, 'AM': 20, 'BA': 20.5,
  'CE': 20, 'DF': 20, 'ES': 17, 'GO': 19, 'MA': 22,
  'MT': 17, 'MS': 17, 'MG': 18, 'PA': 19, 'PB': 20,
  'PR': 19.5, 'PE': 20.5, 'PI': 21, 'RJ': 22, 'RN': 20,
  'RS': 17, 'RO': 19.5, 'RR': 20, 'SC': 17, 'SP': 18,
  'SE': 19, 'TO': 20
};

// Tabela ICMS interestadual
const ICMS_INTERESTADUAL: Record<string, Record<string, number>> = {
  // De Sul/Sudeste (exceto ES) para Norte/Nordeste/Centro-Oeste/ES
  'SP': { 'default_norte': 7, 'default_sul': 12 },
  'RJ': { 'default_norte': 7, 'default_sul': 12 },
  'MG': { 'default_norte': 7, 'default_sul': 12 },
  'PR': { 'default_norte': 7, 'default_sul': 12 },
  'SC': { 'default_norte': 7, 'default_sul': 12 },
  'RS': { 'default_norte': 7, 'default_sul': 12 },
};

// Estados do Norte/Nordeste/Centro-Oeste + ES
const ESTADOS_NORTE_NE_CO = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'];

// Alíquotas Simples Nacional por faixa (Anexo I - Comércio)
const SIMPLES_NACIONAL_COMERCIO = [
  { min: 0, max: 180000, aliquota: 4.00, deducao: 0 },
  { min: 180000.01, max: 360000, aliquota: 7.30, deducao: 5940 },
  { min: 360000.01, max: 720000, aliquota: 9.50, deducao: 13860 },
  { min: 720000.01, max: 1800000, aliquota: 10.70, deducao: 22500 },
  { min: 1800000.01, max: 3600000, aliquota: 14.30, deducao: 87300 },
  { min: 3600000.01, max: 4800000, aliquota: 19.00, deducao: 378000 }
];

// Tabela NCM simplificada (exemplos comuns)
const NCM_DATABASE: Record<string, { descricao: string; ipi: number; pis: number; cofins: number }> = {
  '8471.30.19': { descricao: 'Computadores portáteis (notebooks)', ipi: 0, pis: 1.65, cofins: 7.6 },
  '8517.12.31': { descricao: 'Telefones celulares', ipi: 0, pis: 1.65, cofins: 7.6 },
  '8528.72.00': { descricao: 'Televisores LED/LCD', ipi: 5, pis: 1.65, cofins: 7.6 },
  '6403.99.90': { descricao: 'Calçados de couro', ipi: 10, pis: 1.65, cofins: 7.6 },
  '2203.00.00': { descricao: 'Cerveja de malte', ipi: 6, pis: 2.5, cofins: 11.75 },
  '2106.90.10': { descricao: 'Preparações alimentícias (suplementos)', ipi: 0, pis: 1.65, cofins: 7.6 },
  '3304.99.90': { descricao: 'Cosméticos e produtos de beleza', ipi: 7, pis: 1.65, cofins: 7.6 },
  '9403.20.00': { descricao: 'Móveis de metal', ipi: 5, pis: 1.65, cofins: 7.6 },
  '0201.10.00': { descricao: 'Carne bovina fresca (carcaças)', ipi: 0, pis: 0, cofins: 0 },
  '1005.90.10': { descricao: 'Milho em grão', ipi: 0, pis: 0, cofins: 0 }
};

// Tabela CFOP simplificada
const CFOP_DATABASE: Record<string, { descricao: string; tipo: string; natureza: string }> = {
  '5101': { descricao: 'Venda de produção do estabelecimento', tipo: 'Saída', natureza: 'Estadual' },
  '5102': { descricao: 'Venda de mercadoria adquirida', tipo: 'Saída', natureza: 'Estadual' },
  '5405': { descricao: 'Venda de mercadoria sujeita a ST', tipo: 'Saída', natureza: 'Estadual' },
  '5910': { descricao: 'Remessa em bonificação', tipo: 'Saída', natureza: 'Estadual' },
  '5949': { descricao: 'Outra saída não especificada', tipo: 'Saída', natureza: 'Estadual' },
  '6101': { descricao: 'Venda de produção do estabelecimento', tipo: 'Saída', natureza: 'Interestadual' },
  '6102': { descricao: 'Venda de mercadoria adquirida', tipo: 'Saída', natureza: 'Interestadual' },
  '6108': { descricao: 'Venda a consumidor final', tipo: 'Saída', natureza: 'Interestadual' },
  '1101': { descricao: 'Compra para industrialização', tipo: 'Entrada', natureza: 'Estadual' },
  '1102': { descricao: 'Compra para comercialização', tipo: 'Entrada', natureza: 'Estadual' },
  '2101': { descricao: 'Compra para industrialização', tipo: 'Entrada', natureza: 'Interestadual' },
  '2102': { descricao: 'Compra para comercialização', tipo: 'Entrada', natureza: 'Interestadual' }
};

// ============================================================================
// TOOLS FISCAIS
// ============================================================================

const TOOLS: Tool[] = [
  {
    name: "validar_cpf",
    description: "Valida se um CPF brasileiro é válido (verifica dígitos verificadores)",
    parameters: {
      type: "object",
      properties: {
        cpf: { type: "string", description: "CPF a ser validado (apenas números ou formatado)" }
      },
      required: ["cpf"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "validar_cnpj",
    description: "Valida se um CNPJ brasileiro é válido (verifica dígitos verificadores)",
    parameters: {
      type: "object",
      properties: {
        cnpj: { type: "string", description: "CNPJ a ser validado (apenas números ou formatado)" }
      },
      required: ["cnpj"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "consultar_cnpj",
    description: "Consulta dados de uma empresa pelo CNPJ na Receita Federal (razão social, endereço, situação cadastral, atividades)",
    parameters: {
      type: "object",
      properties: {
        cnpj: { type: "string", description: "CNPJ da empresa (apenas números)" }
      },
      required: ["cnpj"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  {
    name: "calcular_icms",
    description: "Calcula o ICMS de uma operação (interna ou interestadual)",
    parameters: {
      type: "object",
      properties: {
        valor: { type: "number", description: "Valor da mercadoria em reais" },
        uf_origem: { type: "string", description: "UF de origem (ex: SP, RJ, MG)" },
        uf_destino: { type: "string", description: "UF de destino (ex: SP, RJ, MG)" },
        consumidor_final: { type: "boolean", description: "Se o destinatário é consumidor final" }
      },
      required: ["valor", "uf_origem", "uf_destino"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "calcular_pis_cofins",
    description: "Calcula PIS e COFINS sobre uma operação (regime cumulativo ou não-cumulativo)",
    parameters: {
      type: "object",
      properties: {
        valor: { type: "number", description: "Valor da operação em reais" },
        regime: {
          type: "string",
          description: "Regime tributário: cumulativo (Lucro Presumido) ou nao_cumulativo (Lucro Real)",
          enum: ["cumulativo", "nao_cumulativo"]
        },
        ncm: { type: "string", description: "Código NCM do produto (opcional, para alíquotas específicas)" }
      },
      required: ["valor", "regime"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "calcular_simples_nacional",
    description: "Calcula o imposto do Simples Nacional baseado no faturamento (Anexo I - Comércio)",
    parameters: {
      type: "object",
      properties: {
        receita_bruta_12m: { type: "number", description: "Receita bruta dos últimos 12 meses em reais" },
        receita_mes: { type: "number", description: "Receita do mês atual em reais" }
      },
      required: ["receita_bruta_12m", "receita_mes"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "calcular_iss",
    description: "Calcula o ISS (Imposto Sobre Serviços) de uma prestação de serviço",
    parameters: {
      type: "object",
      properties: {
        valor: { type: "number", description: "Valor do serviço em reais" },
        aliquota: { type: "number", description: "Alíquota do ISS (entre 2% e 5%, varia por município)" },
        municipio: { type: "string", description: "Município da prestação (para referência)" }
      },
      required: ["valor", "aliquota"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "consultar_ncm",
    description: "Consulta informações sobre um código NCM (Nomenclatura Comum do Mercosul) incluindo descrição e alíquotas",
    parameters: {
      type: "object",
      properties: {
        ncm: { type: "string", description: "Código NCM (8 dígitos, ex: 8471.30.19)" }
      },
      required: ["ncm"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  {
    name: "consultar_cfop",
    description: "Consulta a descrição de um CFOP (Código Fiscal de Operações e Prestações)",
    parameters: {
      type: "object",
      properties: {
        cfop: { type: "string", description: "Código CFOP (4 dígitos, ex: 5102)" }
      },
      required: ["cfop"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "validar_chave_nfe",
    description: "Valida a estrutura de uma chave de acesso de NFe (44 dígitos)",
    parameters: {
      type: "object",
      properties: {
        chave: { type: "string", description: "Chave de acesso da NFe (44 dígitos)" }
      },
      required: ["chave"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  },
  {
    name: "calcular_impostos_nf",
    description: "Calcula todos os impostos de uma nota fiscal de produto (ICMS, PIS, COFINS, IPI)",
    parameters: {
      type: "object",
      properties: {
        valor_produto: { type: "number", description: "Valor total dos produtos" },
        valor_frete: { type: "number", description: "Valor do frete (opcional)" },
        uf_origem: { type: "string", description: "UF de origem" },
        uf_destino: { type: "string", description: "UF de destino" },
        ncm: { type: "string", description: "Código NCM do produto principal" },
        regime: {
          type: "string",
          description: "Regime tributário da empresa",
          enum: ["simples", "lucro_presumido", "lucro_real"]
        }
      },
      required: ["valor_produto", "uf_origem", "uf_destino", "regime"]
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    }
  }
];

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

function limparDocumento(doc: string): string {
  return doc.replace(/[^\d]/g, '');
}

function validarCPF(cpf: string): { valido: boolean; formatado: string; erro?: string } {
  const cpfLimpo = limparDocumento(cpf);

  if (cpfLimpo.length !== 11) {
    return { valido: false, formatado: cpfLimpo, erro: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return { valido: false, formatado: cpfLimpo, erro: 'CPF inválido (dígitos repetidos)' };
  }

  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) {
    return { valido: false, formatado: cpfLimpo, erro: 'Primeiro dígito verificador inválido' };
  }

  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) {
    return { valido: false, formatado: cpfLimpo, erro: 'Segundo dígito verificador inválido' };
  }

  const formatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return { valido: true, formatado };
}

function validarCNPJ(cnpj: string): { valido: boolean; formatado: string; erro?: string } {
  const cnpjLimpo = limparDocumento(cnpj);

  if (cnpjLimpo.length !== 14) {
    return { valido: false, formatado: cnpjLimpo, erro: 'CNPJ deve ter 14 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return { valido: false, formatado: cnpjLimpo, erro: 'CNPJ inválido (dígitos repetidos)' };
  }

  // Calcula primeiro dígito verificador
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return { valido: false, formatado: cnpjLimpo, erro: 'Primeiro dígito verificador inválido' };
  }

  // Calcula segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    return { valido: false, formatado: cnpjLimpo, erro: 'Segundo dígito verificador inválido' };
  }

  const formatado = cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return { valido: true, formatado };
}

function validarChaveNFe(chave: string): {
  valido: boolean;
  detalhes?: {
    uf: string;
    dataEmissao: string;
    cnpjEmitente: string;
    modelo: string;
    serie: string;
    numero: string;
    tipoEmissao: string;
    codigoNumerico: string;
    digitoVerificador: string;
  };
  erro?: string;
} {
  const chaveLimpa = limparDocumento(chave);

  if (chaveLimpa.length !== 44) {
    return { valido: false, erro: 'Chave deve ter 44 dígitos' };
  }

  // Extrai componentes
  const uf = chaveLimpa.substring(0, 2);
  const aamm = chaveLimpa.substring(2, 6);
  const cnpj = chaveLimpa.substring(6, 20);
  const modelo = chaveLimpa.substring(20, 22);
  const serie = chaveLimpa.substring(22, 25);
  const numero = chaveLimpa.substring(25, 34);
  const tipoEmissao = chaveLimpa.substring(34, 35);
  const codigoNumerico = chaveLimpa.substring(35, 43);
  const dv = chaveLimpa.substring(43, 44);

  // Valida dígito verificador (módulo 11)
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let pesoIndex = 0;

  for (let i = 42; i >= 0; i--) {
    soma += parseInt(chaveLimpa.charAt(i)) * pesos[pesoIndex];
    pesoIndex = (pesoIndex + 1) % 8;
  }

  const resto = soma % 11;
  const dvCalculado = resto < 2 ? 0 : 11 - resto;

  if (dvCalculado !== parseInt(dv)) {
    return { valido: false, erro: 'Dígito verificador inválido' };
  }

  // Valida CNPJ
  const cnpjValidacao = validarCNPJ(cnpj);
  if (!cnpjValidacao.valido) {
    return { valido: false, erro: 'CNPJ do emitente inválido na chave' };
  }

  const ano = parseInt(aamm.substring(0, 2)) + 2000;
  const mes = aamm.substring(2, 4);

  return {
    valido: true,
    detalhes: {
      uf,
      dataEmissao: `${mes}/${ano}`,
      cnpjEmitente: cnpjValidacao.formatado,
      modelo: modelo === '55' ? 'NFe' : modelo === '65' ? 'NFCe' : modelo,
      serie,
      numero: parseInt(numero).toString(),
      tipoEmissao,
      codigoNumerico,
      digitoVerificador: dv
    }
  };
}

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

function calcularICMS(
  valor: number,
  ufOrigem: string,
  ufDestino: string,
  consumidorFinal: boolean = false
): {
  aliquota: number;
  valor_icms: number;
  tipo_operacao: string;
  difal?: { aliquota_interestadual: number; aliquota_interna: number; valor_difal: number };
} {
  const ufOrigemUpper = ufOrigem.toUpperCase();
  const ufDestinoUpper = ufDestino.toUpperCase();

  // Operação interna
  if (ufOrigemUpper === ufDestinoUpper) {
    const aliquota = ICMS_ALIQUOTAS[ufOrigemUpper] || 18;
    return {
      aliquota,
      valor_icms: valor * (aliquota / 100),
      tipo_operacao: 'Interna'
    };
  }

  // Operação interestadual
  const isDestinoNorteNeCo = ESTADOS_NORTE_NE_CO.includes(ufDestinoUpper);
  let aliquotaInterestadual = isDestinoNorteNeCo ? 7 : 12;

  // Se origem também for Norte/NE/CO, alíquota é 12%
  if (ESTADOS_NORTE_NE_CO.includes(ufOrigemUpper)) {
    aliquotaInterestadual = 12;
  }

  const valorIcms = valor * (aliquotaInterestadual / 100);

  // DIFAL para consumidor final
  if (consumidorFinal) {
    const aliquotaInterna = ICMS_ALIQUOTAS[ufDestinoUpper] || 18;
    const difal = valor * ((aliquotaInterna - aliquotaInterestadual) / 100);

    return {
      aliquota: aliquotaInterestadual,
      valor_icms: valorIcms,
      tipo_operacao: 'Interestadual (Consumidor Final)',
      difal: {
        aliquota_interestadual: aliquotaInterestadual,
        aliquota_interna: aliquotaInterna,
        valor_difal: difal
      }
    };
  }

  return {
    aliquota: aliquotaInterestadual,
    valor_icms: valorIcms,
    tipo_operacao: 'Interestadual'
  };
}

function calcularPisCofins(
  valor: number,
  regime: 'cumulativo' | 'nao_cumulativo',
  ncm?: string
): {
  pis: { aliquota: number; valor: number };
  cofins: { aliquota: number; valor: number };
  total: number;
  regime: string;
} {
  let aliquotaPis: number;
  let aliquotaCofins: number;

  // Verifica se NCM tem alíquota específica
  if (ncm) {
    const ncmLimpo = ncm.replace(/[^\d]/g, '');
    const ncmFormatado = `${ncmLimpo.substring(0,4)}.${ncmLimpo.substring(4,6)}.${ncmLimpo.substring(6,8)}`;
    const ncmInfo = NCM_DATABASE[ncmFormatado];
    if (ncmInfo) {
      aliquotaPis = ncmInfo.pis;
      aliquotaCofins = ncmInfo.cofins;
    }
  }

  // Alíquotas padrão por regime
  if (!aliquotaPis || !aliquotaCofins) {
    if (regime === 'cumulativo') {
      aliquotaPis = 0.65;
      aliquotaCofins = 3.00;
    } else {
      aliquotaPis = 1.65;
      aliquotaCofins = 7.60;
    }
  }

  const valorPis = valor * (aliquotaPis / 100);
  const valorCofins = valor * (aliquotaCofins / 100);

  return {
    pis: { aliquota: aliquotaPis, valor: valorPis },
    cofins: { aliquota: aliquotaCofins, valor: valorCofins },
    total: valorPis + valorCofins,
    regime: regime === 'cumulativo' ? 'Cumulativo (Lucro Presumido)' : 'Não-Cumulativo (Lucro Real)'
  };
}

function calcularSimplesNacional(
  receitaBruta12m: number,
  receitaMes: number
): {
  faixa: number;
  aliquota_nominal: number;
  aliquota_efetiva: number;
  valor_imposto: number;
  limite_excedido: boolean;
  observacao?: string;
} {
  if (receitaBruta12m > 4800000) {
    return {
      faixa: 0,
      aliquota_nominal: 0,
      aliquota_efetiva: 0,
      valor_imposto: 0,
      limite_excedido: true,
      observacao: 'Receita excede o limite do Simples Nacional (R$ 4.800.000,00). Empresa deve migrar para Lucro Presumido ou Real.'
    };
  }

  // Encontra a faixa
  const faixa = SIMPLES_NACIONAL_COMERCIO.find(f => receitaBruta12m >= f.min && receitaBruta12m <= f.max);

  if (!faixa) {
    return {
      faixa: 1,
      aliquota_nominal: 4.00,
      aliquota_efetiva: 4.00,
      valor_imposto: receitaMes * 0.04,
      limite_excedido: false
    };
  }

  // Calcula alíquota efetiva
  const aliquotaEfetiva = ((receitaBruta12m * (faixa.aliquota / 100)) - faixa.deducao) / receitaBruta12m * 100;
  const valorImposto = receitaMes * (aliquotaEfetiva / 100);

  return {
    faixa: SIMPLES_NACIONAL_COMERCIO.indexOf(faixa) + 1,
    aliquota_nominal: faixa.aliquota,
    aliquota_efetiva: Math.round(aliquotaEfetiva * 100) / 100,
    valor_imposto: Math.round(valorImposto * 100) / 100,
    limite_excedido: false
  };
}

function calcularISS(valor: number, aliquota: number, municipio?: string): {
  aliquota: number;
  valor_iss: number;
  municipio?: string;
  observacao: string;
} {
  // Valida alíquota (ISS varia de 2% a 5%)
  const aliquotaValidada = Math.min(Math.max(aliquota, 2), 5);

  return {
    aliquota: aliquotaValidada,
    valor_iss: valor * (aliquotaValidada / 100),
    municipio,
    observacao: aliquota !== aliquotaValidada
      ? `Alíquota ajustada para ${aliquotaValidada}% (limites legais: 2% a 5%)`
      : 'Cálculo baseado na alíquota informada. Verifique a legislação municipal.'
  };
}

// ============================================================================
// CONSULTAS EXTERNAS
// ============================================================================

async function consultarCNPJ(cnpj: string): Promise<{
  sucesso: boolean;
  dados?: {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    situacao: string;
    data_situacao: string;
    tipo: string;
    porte: string;
    capital_social: number;
    atividade_principal: { codigo: string; descricao: string };
    atividades_secundarias: Array<{ codigo: string; descricao: string }>;
    endereco: {
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      municipio: string;
      uf: string;
      cep: string;
    };
    telefone: string;
    email: string;
    data_abertura: string;
  };
  erro?: string;
}> {
  const cnpjLimpo = limparDocumento(cnpj);

  // Valida antes de consultar
  const validacao = validarCNPJ(cnpjLimpo);
  if (!validacao.valido) {
    return { sucesso: false, erro: validacao.erro };
  }

  try {
    // Usa BrasilAPI
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { sucesso: false, erro: 'CNPJ não encontrado na base da Receita Federal' };
      }
      return { sucesso: false, erro: `Erro na consulta: ${response.status}` };
    }

    const data = await response.json() as any;

    return {
      sucesso: true,
      dados: {
        cnpj: validacao.formatado,
        razao_social: data.razao_social || '',
        nome_fantasia: data.nome_fantasia || '',
        situacao: data.descricao_situacao_cadastral || '',
        data_situacao: data.data_situacao_cadastral || '',
        tipo: data.descricao_tipo_de_sociedade || '',
        porte: data.porte || '',
        capital_social: data.capital_social || 0,
        atividade_principal: {
          codigo: data.cnae_fiscal?.toString() || '',
          descricao: data.cnae_fiscal_descricao || ''
        },
        atividades_secundarias: (data.cnaes_secundarios || []).map((c: any) => ({
          codigo: c.codigo?.toString() || '',
          descricao: c.descricao || ''
        })),
        endereco: {
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          cep: data.cep || ''
        },
        telefone: data.ddd_telefone_1 || '',
        email: data.email || '',
        data_abertura: data.data_inicio_atividade || ''
      }
    };
  } catch (error) {
    return { sucesso: false, erro: `Erro ao consultar API: ${error}` };
  }
}

async function consultarNCM(ncm: string): Promise<{
  sucesso: boolean;
  dados?: {
    codigo: string;
    descricao: string;
    ipi: number;
    pis: number;
    cofins: number;
    origem: string;
  };
  erro?: string;
}> {
  const ncmLimpo = ncm.replace(/[^\d]/g, '');

  if (ncmLimpo.length !== 8) {
    return { sucesso: false, erro: 'NCM deve ter 8 dígitos' };
  }

  const ncmFormatado = `${ncmLimpo.substring(0,4)}.${ncmLimpo.substring(4,6)}.${ncmLimpo.substring(6,8)}`;

  // Primeiro tenta no banco local
  const ncmLocal = NCM_DATABASE[ncmFormatado];
  if (ncmLocal) {
    return {
      sucesso: true,
      dados: {
        codigo: ncmFormatado,
        descricao: ncmLocal.descricao,
        ipi: ncmLocal.ipi,
        pis: ncmLocal.pis,
        cofins: ncmLocal.cofins,
        origem: 'Base local'
      }
    };
  }

  // Tenta BrasilAPI
  try {
    const response = await fetch(`https://brasilapi.com.br/api/ncm/v1/${ncmLimpo}`);

    if (response.ok) {
      const data = await response.json() as any;
      return {
        sucesso: true,
        dados: {
          codigo: ncmFormatado,
          descricao: data.descricao || 'Descrição não disponível',
          ipi: 0, // API não retorna alíquotas
          pis: 1.65,
          cofins: 7.6,
          origem: 'BrasilAPI'
        }
      };
    }
  } catch (e) {
    // Falha silenciosa, retorna erro genérico
  }

  return { sucesso: false, erro: 'NCM não encontrado nas bases disponíveis' };
}

// ============================================================================
// CÁLCULO COMPLETO DE NF
// ============================================================================

function calcularImpostosNF(
  valorProduto: number,
  valorFrete: number = 0,
  ufOrigem: string,
  ufDestino: string,
  ncm: string | undefined,
  regime: 'simples' | 'lucro_presumido' | 'lucro_real'
): {
  base_calculo: number;
  icms: { aliquota: number; valor: number; tipo: string };
  pis: { aliquota: number; valor: number };
  cofins: { aliquota: number; valor: number };
  ipi?: { aliquota: number; valor: number };
  total_impostos: number;
  valor_total_nf: number;
  regime: string;
} {
  const baseCalculo = valorProduto + valorFrete;

  // ICMS
  const icmsCalc = calcularICMS(baseCalculo, ufOrigem, ufDestino);

  // PIS/COFINS conforme regime
  let pisCofiins;
  if (regime === 'simples') {
    // Simples Nacional: PIS/COFINS incluído na alíquota única
    pisCofiins = { pis: { aliquota: 0, valor: 0 }, cofins: { aliquota: 0, valor: 0 }, total: 0, regime: 'Simples Nacional' };
  } else {
    const regimePisCofins = regime === 'lucro_presumido' ? 'cumulativo' : 'nao_cumulativo';
    pisCofiins = calcularPisCofins(baseCalculo, regimePisCofins, ncm);
  }

  // IPI (se NCM informado)
  let ipi = { aliquota: 0, valor: 0 };
  if (ncm) {
    const ncmLimpo = ncm.replace(/[^\d]/g, '');
    const ncmFormatado = `${ncmLimpo.substring(0,4)}.${ncmLimpo.substring(4,6)}.${ncmLimpo.substring(6,8)}`;
    const ncmInfo = NCM_DATABASE[ncmFormatado];
    if (ncmInfo) {
      ipi = { aliquota: ncmInfo.ipi, valor: baseCalculo * (ncmInfo.ipi / 100) };
    }
  }

  const totalImpostos = icmsCalc.valor_icms + pisCofiins.pis.valor + pisCofiins.cofins.valor + ipi.valor;

  return {
    base_calculo: baseCalculo,
    icms: { aliquota: icmsCalc.aliquota, valor: icmsCalc.valor_icms, tipo: icmsCalc.tipo_operacao },
    pis: pisCofiins.pis,
    cofins: pisCofiins.cofins,
    ipi: ipi.valor > 0 ? ipi : undefined,
    total_impostos: Math.round(totalImpostos * 100) / 100,
    valor_total_nf: Math.round((baseCalculo + ipi.valor) * 100) / 100,
    regime: regime === 'simples' ? 'Simples Nacional' :
            regime === 'lucro_presumido' ? 'Lucro Presumido' : 'Lucro Real'
  };
}

// ============================================================================
// TOOL EXECUTION
// ============================================================================

async function executeTool(
  toolName: string,
  parameters: Record<string, unknown>
): Promise<{ success: boolean; result: unknown; error?: string }> {
  switch (toolName) {
    case "validar_cpf":
      return { success: true, result: validarCPF(parameters.cpf as string) };

    case "validar_cnpj":
      return { success: true, result: validarCNPJ(parameters.cnpj as string) };

    case "consultar_cnpj":
      return { success: true, result: await consultarCNPJ(parameters.cnpj as string) };

    case "calcular_icms":
      return {
        success: true,
        result: calcularICMS(
          parameters.valor as number,
          parameters.uf_origem as string,
          parameters.uf_destino as string,
          parameters.consumidor_final as boolean
        )
      };

    case "calcular_pis_cofins":
      return {
        success: true,
        result: calcularPisCofins(
          parameters.valor as number,
          parameters.regime as 'cumulativo' | 'nao_cumulativo',
          parameters.ncm as string
        )
      };

    case "calcular_simples_nacional":
      return {
        success: true,
        result: calcularSimplesNacional(
          parameters.receita_bruta_12m as number,
          parameters.receita_mes as number
        )
      };

    case "calcular_iss":
      return {
        success: true,
        result: calcularISS(
          parameters.valor as number,
          parameters.aliquota as number,
          parameters.municipio as string
        )
      };

    case "consultar_ncm":
      return { success: true, result: await consultarNCM(parameters.ncm as string) };

    case "consultar_cfop": {
      const cfop = parameters.cfop as string;
      const cfopInfo = CFOP_DATABASE[cfop];
      if (cfopInfo) {
        return { success: true, result: { codigo: cfop, ...cfopInfo } };
      }
      return { success: false, result: null, error: `CFOP ${cfop} não encontrado` };
    }

    case "validar_chave_nfe":
      return { success: true, result: validarChaveNFe(parameters.chave as string) };

    case "calcular_impostos_nf":
      return {
        success: true,
        result: calcularImpostosNF(
          parameters.valor_produto as number,
          (parameters.valor_frete as number) || 0,
          parameters.uf_origem as string,
          parameters.uf_destino as string,
          parameters.ncm as string,
          parameters.regime as 'simples' | 'lucro_presumido' | 'lucro_real'
        )
      };

    default:
      return { success: false, result: null, error: `Tool '${toolName}' não encontrada` };
  }
}

// ============================================================================
// MCP HANDLERS
// ============================================================================

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: string | number;
}

interface MCPResponse {
  jsonrpc: string;
  result?: unknown;
  error?: { code: number; message: string };
  id: string | number;
}

const CSP_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://brasilapi.com.br",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  const { method, params, id } = request;

  switch (method) {
    case "tools/list":
      return {
        jsonrpc: "2.0",
        result: {
          tools: TOOLS.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters,
            annotations: t.annotations
          }))
        },
        id
      };

    case "tools/call":
      if (!params?.name || !params?.arguments) {
        return {
          jsonrpc: "2.0",
          error: { code: -32602, message: "Parâmetros inválidos" },
          id
        };
      }

      const toolResult = await executeTool(
        params.name as string,
        params.arguments as Record<string, unknown>
      );

      return {
        jsonrpc: "2.0",
        result: {
          content: [{ type: "text", text: JSON.stringify(toolResult.result, null, 2) }],
          isError: !toolResult.success
        },
        id
      };

    case "server/info":
      return {
        jsonrpc: "2.0",
        result: {
          name: "Fiscal BR",
          version: "1.0.0",
          description: "Assistente fiscal para empresas brasileiras",
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } }
        },
        id
      };

    case "health/check":
      return {
        jsonrpc: "2.0",
        result: { status: "healthy", timestamp: new Date().toISOString() },
        id
      };

    default:
      return {
        jsonrpc: "2.0",
        error: { code: -32601, message: `Método '${method}' não encontrado` },
        id
      };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          ...CSP_HEADERS
        }
      });
    }

    // Health
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        app: "Fiscal BR",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json", ...CSP_HEADERS }
      });
    }

    // Manifest
    if (url.pathname === "/.well-known/mcp.json") {
      return new Response(JSON.stringify({
        name: "Fiscal BR",
        version: "1.0.0",
        description: "Assistente fiscal para empresas brasileiras. Consulta CNPJ, valida documentos, calcula impostos (ICMS, PIS, COFINS, ISS, Simples Nacional).",
        tools: TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.parameters,
          annotations: t.annotations
        }))
      }), {
        headers: { "Content-Type": "application/json", ...CSP_HEADERS }
      });
    }

    // MCP endpoint
    if (request.method === "POST" && (url.pathname === "/" || url.pathname === "/mcp")) {
      try {
        const body = await request.json() as MCPRequest;

        if (body.jsonrpc !== "2.0" || !body.method) {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32600, message: "Requisição JSON-RPC inválida" },
            id: body.id || null
          }), { status: 400, headers: { "Content-Type": "application/json", ...CSP_HEADERS } });
        }

        const response = await handleMCPRequest(body);
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json", ...CSP_HEADERS }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Erro interno" },
          id: null
        }), { status: 500, headers: { "Content-Type": "application/json", ...CSP_HEADERS } });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...CSP_HEADERS }
    });
  }
};
