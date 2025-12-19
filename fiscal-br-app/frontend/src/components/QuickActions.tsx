import { useState } from 'react';
import {
  FileText,
  Calculator,
  Search,
  ChevronRight,
  CheckCircle,
  Building,
  Percent,
  Receipt,
  FileSearch,
  Hash,
} from 'lucide-react';
import { CHATKIT_CONFIG } from '../lib/config';

type TabType = 'validacao' | 'calculo' | 'consulta';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'validacao', label: 'Validação', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'calculo', label: 'Cálculo', icon: <Calculator className="w-4 h-4" /> },
  { id: 'consulta', label: 'Consulta', icon: <Search className="w-4 h-4" /> },
];

const TOOL_ICONS: Record<string, React.ReactNode> = {
  validar_cpf: <FileText className="w-4 h-4" />,
  validar_cnpj: <Building className="w-4 h-4" />,
  consultar_cnpj: <Building className="w-4 h-4" />,
  calcular_icms: <Percent className="w-4 h-4" />,
  calcular_pis_cofins: <Percent className="w-4 h-4" />,
  calcular_simples_nacional: <Receipt className="w-4 h-4" />,
  calcular_iss: <Percent className="w-4 h-4" />,
  consultar_ncm: <Hash className="w-4 h-4" />,
  consultar_cfop: <FileSearch className="w-4 h-4" />,
  validar_chave_nfe: <FileText className="w-4 h-4" />,
  calcular_impostos_nf: <Calculator className="w-4 h-4" />,
};

export function QuickActions() {
  const [activeTab, setActiveTab] = useState<TabType>('validacao');

  const filteredTools = CHATKIT_CONFIG.tools.filter(
    (tool) => tool.category === activeTab
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Ações Rápidas</h3>
        <p className="text-sm text-slate-500 mt-1">
          Selecione uma ferramenta fiscal
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === tab.id
                ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTools.map((tool) => (
          <button
            key={tool.name}
            className="w-full p-3 rounded-lg border border-slate-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center gap-3 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-primary/10 flex items-center justify-center text-slate-600 group-hover:text-brand-primary transition-colors">
              {TOOL_ICONS[tool.name]}
            </div>
            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-brand-primary">
              {tool.label}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" />
          </button>
        ))}
      </div>

      {/* Info Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-600 mb-1">Dica:</p>
          <p>
            Clique em uma ferramenta para inserir um exemplo no chat, ou digite
            sua pergunta diretamente.
          </p>
        </div>
      </div>
    </div>
  );
}
