import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, X } from "lucide-react";
import { ChatMessage } from "@/hooks/useAIChat";

type ChatBarProps = {
  placeholder?: string;
  isProcessing?: boolean;
  onSend: (text: string) => void;
  suggestions?: string[];
  messages?: ChatMessage[];
};

export function ChatBar({ placeholder, isProcessing, onSend, suggestions = [], messages = [] }: ChatBarProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoStick, setAutoStick] = useState(true);

  // O input não cresce; mantemos altura constante. (removido auto-resize)

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
    setAutoStick(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsExpanded(false);
    }
  };

  // Auto-scroll quando expandido e chegarem novas mensagens
  useEffect(() => {
    if (!isExpanded || !autoStick) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded, autoStick]);

  const onMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
    setAutoStick(atBottom);
  };

  const handleChipClick = (text: string) => {
    setIsExpanded(true);
    setAutoStick(true);
    onSend(text);
    // foca o input após expandir
    setTimeout(() => ref.current?.focus(), 0);
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 md:ml-[var(--sidebar-width)] px-4 pb-4 pt-2 bg-transparent">
      {/* Painel de mensagens quando expandido (sem dock; inserido na coluna do conteúdo) */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto mb-3">
          <div className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm dark:border-white/10 dark:bg-neutral-900/70 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-white/10">
              <div className="text-sm text-gray-600">Assistente FinanceAI</div>
              <button
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Minimizar"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="max-h-[min(55vh,520px)] overflow-y-auto bg-gray-50/60 dark:bg-neutral-900/50"
              onScroll={onMessagesScroll}
            >
              {/* Chips fixos no topo, dentro do chat */}
              {suggestions.length > 0 && (
                <div className="sticky top-0 z-10 px-4 py-2 bg-white/90 dark:bg-neutral-900/70 backdrop-blur border-b border-gray-200/80 dark:border-white/10 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={`chip-${s}`}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white/80 hover:bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
                      onClick={() => handleChipClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-gray-100'} rounded-lg px-3 py-2 max-w-[75%] shadow-sm`}>
                      <div className="text-sm whitespace-pre-line">{m.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sugestões */}
      {!isExpanded && suggestions.length > 0 && (
        <div className={`max-w-4xl mx-auto flex flex-wrap gap-2 transition-all ${isExpanded ? 'mb-3' : 'mb-2'}`}>
          {suggestions.map((s) => (
            <button
              key={s}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white/80 hover:bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
              onClick={() => handleChipClick(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className={`group flex items-end gap-2 rounded-2xl border border-gray-200 bg-white/95 px-3 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 dark:border-white/10 dark:bg-neutral-900/70 transition-all duration-300 ${isExpanded ? 'py-3 ring-1 ring-indigo-200' : 'py-2'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10"
            aria-label="Anexar arquivo"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Textarea
            ref={ref}
            placeholder={
              placeholder ||
              "Digite um prompt… (Shift+Enter para nova linha, Enter para enviar)"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            rows={1}
            className={`flex-1 resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 p-2 h-[64px] min-h-[64px] max-h-[64px]`}
            disabled={isProcessing}
            aria-label="Mensagem para o assistente"
          />
          <Button
            onClick={() => setIsListening((p) => !p)}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full transition-colors ${
              isListening
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
            aria-pressed={isListening}
            aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
          >
            <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            className="h-9 w-9 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-end gap-3 text-xs text-gray-500">
          <span>Enter para enviar • Shift+Enter para quebrar linha</span>
        </div>
      </div>
    </div>
  );
}

export default ChatBar;


