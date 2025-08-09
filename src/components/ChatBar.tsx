import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, X, ArrowDown, RefreshCcw, Copy, Check, Bot as BotIcon, User as UserIcon } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const userInitials = "JS"; // TODO: pegar do perfil quando disponível

  // O input não cresce; mantemos altura constante. (removido auto-resize)

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setLastUserMessage(text);
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
    setShowScrollToBottom(!atBottom);
  };

  const handleChipClick = (text: string) => {
    setIsExpanded(true);
    setAutoStick(true);
    onSend(text);
    setLastUserMessage(text);
    // foca o input após expandir
    setTimeout(() => ref.current?.focus(), 0);
  };

  const getDayLabel = (d: Date) => {
    if (isToday(d)) return "Hoje";
    if (isYesterday(d)) return "Ontem";
    return format(d, "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 md:ml-[var(--sidebar-width)] px-4 pb-4 pt-2 bg-transparent">
      {/* Painel de mensagens quando expandido (sem dock; inserido na coluna do conteúdo) */}
      {isExpanded && (
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mb-3">
          <div className="rounded-2xl border border-gray-200 supports-[backdrop-filter]:bg-white/90 backdrop-blur shadow-lg shadow-black/10 dark:border-white/10 dark:bg-neutral-900/70 overflow-hidden flex flex-col min-h-[min(50vh,440px)] xl:min-h-[min(60vh,520px)] 2xl:min-h-[min(70vh,640px)] max-h-[min(75vh,700px)]">
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
              className="relative flex-1 min-h-0 overflow-y-auto bg-white/60 dark:bg-neutral-900/40"
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
                {/* Separadores por dia */}
                {messages.map((m, idx) => {
                  const isUser = m.sender === 'user';
                  const isError = m.sender === 'ai' && m.content.toLowerCase().startsWith('desculpe');
                  const prev = messages[idx - 1];
                  const showDaySeparator = !prev || getDayLabel(prev.timestamp) !== getDayLabel(m.timestamp);
                  return (
                    <div key={m.id}>
                      {showDaySeparator && (
                        <div className="relative my-3 flex items-center justify-center">
                          <span className="z-10 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wide text-gray-500 dark:border-white/10 dark:bg-neutral-900/80">
                            {getDayLabel(m.timestamp)}
                          </span>
                          <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-gray-200 dark:bg-white/10" />
                        </div>
                      )}

                      <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar à esquerda para IA */}
                        {!isUser && (
                          <Avatar className="h-7 w-7 ring-1 ring-gray-300 dark:ring-white/15">
                            <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                              <BotIcon className="h-3.5 w-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className="group relative max-w-[75%]">
                          <div
                            className={
                              `${isUser
                                ? 'bg-blue-500 text-white'
                                : isError
                                  ? 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-900/40 dark:border-rose-800/60 dark:text-rose-100'
                                  : 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-gray-100'
                              } rounded-2xl px-3 py-2 shadow-sm`}
                          >
                            <div className="text-sm whitespace-pre-line leading-relaxed">{m.content}</div>

                            {/* Rodapé: timestamp + copiar + status */}
                            <div className={`mt-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'} opacity-90`}> 
                              <span className={`text-[10px] ${isUser ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                                {format(m.timestamp, 'HH:mm', { locale: ptBR })}
                              </span>
                              <button
                                className={`inline-flex items-center gap-1 text-[10px] ${isUser ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'}`}
                                onClick={() => {
                                  navigator.clipboard.writeText(m.content);
                                  setCopiedId(m.id);
                                  setTimeout(() => setCopiedId(null), 1200);
                                }}
                                aria-label="Copiar mensagem"
                              >
                                {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copiedId === m.id ? 'Copiado' : 'Copiar'}
                              </button>
                              {isUser && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-white/90">
                                  <Check className="w-3 h-3" />
                                  enviado
                                </span>
                              )}
                            </div>

                            {isError && lastUserMessage && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-white/70 ring-1 ring-red-200 text-red-700 hover:bg-white"
                                  onClick={() => onSend(lastUserMessage)}
                                >
                                  <RefreshCcw className="w-3 h-3" /> Tentar novamente
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Ações on-hover (desktop) */}
                          <div className="pointer-events-none absolute -top-6 right-0 hidden gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] text-gray-600 ring-1 ring-gray-200 shadow-sm group-hover:flex dark:bg-neutral-900/80 dark:text-gray-300 dark:ring-white/10">
                            <span>Mensagem</span>
                          </div>
                        </div>

                        {/* Avatar à direita para usuário */}
                        {isUser && (
                          <Avatar className="h-7 w-7 ring-1 ring-gray-300 dark:ring-white/15">
                            <AvatarFallback className="bg-gray-200 text-gray-800 text-[10px] dark:bg-white/20 dark:text-white">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showScrollToBottom && (
                <button
                  className="absolute right-4 bottom-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200 shadow-sm hover:bg-white dark:bg-neutral-800/80 dark:text-gray-200 dark:ring-white/10"
                  onClick={() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    setShowScrollToBottom(false);
                  }}
                  aria-label="Voltar ao fim"
                >
                  <ArrowDown className="w-3 h-3" /> Ao fim
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sugestões */}
      {!isExpanded && suggestions.length > 0 && (
        <div className={`max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto flex flex-wrap gap-2 transition-all ${isExpanded ? 'mb-3' : 'mb-2'}`}>
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

      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto">
        <div className={`group flex items-end gap-2 rounded-2xl border border-gray-200 ring-1 ring-gray-300/70 dark:ring-white/15 supports-[backdrop-filter]:bg-white/90 backdrop-blur px-2 shadow-md shadow-black/10 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-white/10 dark:bg-neutral-900/70 transition-all duration-300 ${isExpanded ? 'py-2' : 'py-1.5'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10"
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
            className={`flex-1 resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 p-2 h-[44px] min-h-[44px] max-h-[44px]`}
            disabled={isProcessing}
            aria-label="Mensagem para o assistente"
          />
          <Button
            onClick={() => setIsListening((p) => !p)}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full transition-colors ${
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
            className="h-8 w-8 rounded-full bg-blue-500 text-white hover:bg-blue-600"
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


