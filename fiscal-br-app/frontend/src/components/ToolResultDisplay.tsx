import {
  CheckCircle,
  XCircle,
  Building,
  Calculator,
  FileText,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

interface ToolResultDisplayProps {
  toolCall: ToolCall;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  validar_cpf: <FileText className="w-4 h-4" />,
  validar_cnpj: <FileText className="w-4 h-4" />,
  consultar_cnpj: <Building className="w-4 h-4" />,
  calcular_icms: <Calculator className="w-4 h-4" />,
  calcular_pis_cofins: <Calculator className="w-4 h-4" />,
  calcular_simples_nacional: <Calculator className="w-4 h-4" />,
  calcular_iss: <Calculator className="w-4 h-4" />,
  consultar_ncm: <Search className="w-4 h-4" />,
  consultar_cfop: <Search className="w-4 h-4" />,
  validar_chave_nfe: <FileText className="w-4 h-4" />,
  calcular_impostos_nf: <Calculator className="w-4 h-4" />,
};

const TOOL_LABELS: Record<string, string> = {
  validar_cpf: 'Validação de CPF',
  validar_cnpj: 'Validação de CNPJ',
  consultar_cnpj: 'Consulta de Empresa',
  calcular_icms: 'Cálculo de ICMS',
  calcular_pis_cofins: 'Cálculo PIS/COFINS',
  calcular_simples_nacional: 'Simples Nacional',
  calcular_iss: 'Cálculo de ISS',
  consultar_ncm: 'Consulta NCM',
  consultar_cfop: 'Consulta CFOP',
  validar_chave_nfe: 'Validação Chave NFe',
  calcular_impostos_nf: 'Cálculo Impostos NF',
};

export function ToolResultDisplay({ toolCall }: ToolResultDisplayProps) {
  const result = toolCall.result as Record<string, unknown> | null;
  const icon = TOOL_ICONS[toolCall.name] || <FileText className="w-4 h-4" />;
  const label = TOOL_LABELS[toolCall.name] || toolCall.name;

  // Determine result type for styling
  const getResultType = (): 'valid' | 'invalid' | 'info' | 'warning' => {
    if (!result) return 'info';

    // Validation results
    if ('valido' in result) {
      return result.valido ? 'valid' : 'invalid';
    }

    // Query results
    if ('sucesso' in result) {
      return result.sucesso ? 'info' : 'invalid';
    }

    // Tax calculations with limits
    if ('limite_excedido' in result && result.limite_excedido) {
      return 'warning';
    }

    return 'info';
  };

  const resultType = getResultType();

  const resultStyles: Record<string, string> = {
    valid: 'border-l-green-500 bg-green-50',
    invalid: 'border-l-red-500 bg-red-50',
    info: 'border-l-blue-500 bg-blue-50',
    warning: 'border-l-yellow-500 bg-yellow-50',
  };

  const StatusIcon = () => {
    switch (resultType) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === 'number') {
      // Format as currency if it looks like money
      if (value >= 1 && value < 1000000) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      }
      // Format as percentage if small
      if (value > 0 && value < 100) {
        return `${value.toFixed(2)}%`;
      }
      return value.toLocaleString('pt-BR');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    if (value === null || value === undefined) {
      return '-';
    }
    return String(value);
  };

  const renderResult = () => {
    if (!result) return <p className="text-sm text-slate-500">Sem resultado</p>;

    // Special rendering for different tool types
    switch (toolCall.name) {
      case 'validar_cpf':
      case 'validar_cnpj':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon />
              <span className={`font-medium ${result.valido ? 'text-green-700' : 'text-red-700'}`}>
                {result.valido ? 'Documento Válido' : 'Documento Inválido'}
              </span>
            </div>
            {result.formatado && (
              <p className="text-sm font-mono bg-white/50 px-2 py-1 rounded">
                {result.formatado as string}
              </p>
            )}
            {result.erro && (
              <p className="text-sm text-red-600">{result.erro as string}</p>
            )}
          </div>
        );

      case 'consultar_cnpj':
        if (result.sucesso && result.dados) {
          const dados = result.dados as Record<string, unknown>;
          return (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Razão Social</p>
                <p className="font-medium">{dados.razao_social as string}</p>
              </div>
              {dados.nome_fantasia && (
                <div>
                  <p className="text-xs text-slate-500">Nome Fantasia</p>
                  <p className="font-medium">{dados.nome_fantasia as string}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Situação</p>
                  <p className="font-medium">{dados.situacao as string}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Porte</p>
                  <p className="font-medium">{dados.porte as string || '-'}</p>
                </div>
              </div>
              {dados.atividade_principal && (
                <div>
                  <p className="text-xs text-slate-500">Atividade Principal</p>
                  <p className="text-sm">
                    {(dados.atividade_principal as Record<string, string>).descricao}
                  </p>
                </div>
              )}
            </div>
          );
        }
        return <p className="text-red-600">{result.erro as string}</p>;

      case 'calcular_icms':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">Tipo de Operação</p>
                <p className="font-medium">{result.tipo_operacao as string}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Alíquota</p>
                <p className="font-medium">{result.aliquota}%</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">Valor do ICMS</p>
              <p className="text-lg font-bold text-brand-primary">
                {formatValue(result.valor_icms)}
              </p>
            </div>
            {result.difal && (
              <div className="bg-yellow-50 rounded p-2 mt-2">
                <p className="text-xs font-medium text-yellow-800">DIFAL (Consumidor Final)</p>
                <p className="text-sm text-yellow-700">
                  Valor: {formatValue((result.difal as Record<string, number>).valor_difal)}
                </p>
              </div>
            )}
          </div>
        );

      case 'calcular_simples_nacional':
        return (
          <div className="space-y-2">
            {result.limite_excedido ? (
              <div className="flex items-start gap-2 text-yellow-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{result.observacao as string}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Faixa</p>
                    <p className="font-medium">{result.faixa as number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alíq. Nominal</p>
                    <p className="font-medium">{result.aliquota_nominal}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alíq. Efetiva</p>
                    <p className="font-medium text-brand-primary">
                      {result.aliquota_efetiva}%
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">Imposto do Mês</p>
                  <p className="text-lg font-bold text-brand-primary">
                    {formatValue(result.valor_imposto)}
                  </p>
                </div>
              </>
            )}
          </div>
        );

      case 'calcular_impostos_nf':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Regime Tributário</p>
              <p className="font-medium">{result.regime as string}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Base de Cálculo:</span>
                <span className="font-medium">{formatValue(result.base_calculo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ICMS ({(result.icms as Record<string, number>).aliquota}%):</span>
                <span className="font-medium">{formatValue((result.icms as Record<string, number>).valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">PIS ({(result.pis as Record<string, number>).aliquota}%):</span>
                <span className="font-medium">{formatValue((result.pis as Record<string, number>).valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">COFINS ({(result.cofins as Record<string, number>).aliquota}%):</span>
                <span className="font-medium">{formatValue((result.cofins as Record<string, number>).valor)}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-medium">Total de Impostos:</span>
              <span className="text-lg font-bold text-brand-primary">
                {formatValue(result.total_impostos)}
              </span>
            </div>
          </div>
        );

      default:
        // Generic JSON display
        return (
          <pre className="text-xs bg-white/50 p-2 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className={`tool-result border-l-4 ${resultStyles[resultType]}`}>
      <div className="tool-result-header">
        {icon}
        <span>{label}</span>
      </div>
      <div className="tool-result-content">{renderResult()}</div>
    </div>
  );
}
