import { X, MessageSquare, Clock, Star, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  starred?: boolean;
}

// Mock data - em produção viria do backend
const chatHistory: ChatHistory[] = [
  { id: '1', title: 'Cálculo ICMS SP-RJ', timestamp: 'Hoje', starred: true },
  { id: '2', title: 'Validação CNPJ empresa', timestamp: 'Hoje' },
  { id: '3', title: 'Simples Nacional - Faixa 3', timestamp: 'Ontem' },
  { id: '4', title: 'Consulta NCM notebooks', timestamp: 'Ontem' },
  { id: '5', title: 'ISS São Paulo 5%', timestamp: '3 dias atrás' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Histórico
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded lg:hidden"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button className="w-full btn-primary flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Nova Conversa
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="group p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{chat.timestamp}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className={`p-1 rounded hover:bg-slate-200 ${
                      chat.starred ? 'text-yellow-500' : 'text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={chat.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            <p>Fiscal BR v1.0.0</p>
            <p className="mt-1">Powered by OpenAI ChatKit</p>
          </div>
        </div>
      </aside>
    </>
  );
}
