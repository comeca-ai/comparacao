import { Building, Calculator, Receipt, Search } from 'lucide-react';
import { CHATKIT_CONFIG } from '../lib/config';

interface SuggestionCardsProps {
  onSelect: (prompt: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  building: <Building className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
  receipt: <Receipt className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
};

export function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
      {CHATKIT_CONFIG.suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion.prompt)}
          className="card-hover text-left flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
            {ICONS[suggestion.icon]}
          </div>
          <div>
            <p className="font-medium text-slate-900 group-hover:text-brand-primary transition-colors">
              {suggestion.title}
            </p>
            <p className="text-sm text-slate-500 line-clamp-2">
              {suggestion.prompt}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
