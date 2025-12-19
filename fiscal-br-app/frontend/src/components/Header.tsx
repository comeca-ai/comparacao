import { Menu, FileText, HelpCircle, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Fiscal BR</h1>
            <p className="text-xs text-slate-500">Assistente Fiscal Brasileiro</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Ajuda"
        >
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>
        <button
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Configuracoes"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </header>
  );
}
