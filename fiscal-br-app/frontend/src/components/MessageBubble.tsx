import { User, Bot, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { ToolResultDisplay } from './ToolResultDisplay';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-brand-primary text-white'
            : 'bg-gradient-to-br from-brand-primary to-brand-accent text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-brand-primary text-white rounded-tr-md'
              : 'bg-slate-100 text-slate-900 rounded-tl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Tool Results */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-2 w-full">
            {message.toolCalls.map((toolCall, index) => (
              <ToolResultDisplay key={index} toolCall={toolCall} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-slate-400 mt-1">
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
