import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, X, ArrowDown, RefreshCcw, Copy, Check, Share2, MoreHorizontal, Star, Bot as BotIcon, User as UserIcon, Receipt, PlusCircle, BarChart3, PiggyBank, TrendingUp } from "lucide-react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoStick, setAutoStick] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const userInitials = "JS"; // TODO: pegar do perfil quando disponível

  type QuickAction = {
    id: string;
    title: string;
    description: string;
    prompt: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  };

  const quickActions: QuickAction[] = [
    { id: 'expense', title: 'Registrar despesa', description: 'Lance uma saída com categoria e valor.', prompt: 'Registrar despesa de R$ 45,90 em Alimentação hoje', icon: Receipt },
    { id: 'income', title: 'Registrar receita', description: 'Adicione salário, bônus ou outra entrada.', prompt: 'Registrar receita de R$ 3.200,00 como Salário', icon: PlusCircle },
    { id: 'report', title: 'Relatório mensal', description: 'Resumo de gastos, receitas e saldo do mês.', prompt: 'Gerar relatório financeiro do mês atual', icon: BarChart3 },
    { id: 'goal', title: 'Definir meta', description: 'Crie ou ajuste metas de economia.', prompt: 'Definir meta de economia de R$ 5.000 em 3 meses', icon: PiggyBank },
    { id: 'insight', title: 'Insights', description: 'Descubra padrões e oportunidades de economia.', prompt: 'Quais insights você tem sobre meus gastos deste mês?', icon: TrendingUp },
  ];

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

  // Foco automático no input visível ao expandir
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [isExpanded]);

  // Fechar ao clicar fora do painel do chat
  useEffect(() => {
    if (!isExpanded) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, [isExpanded]);

  const handleShare = async (text: string) => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopiedId('share');
        setTimeout(() => setCopiedId(null), 1200);
      }
    } catch {}
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-30 md:ml-[var(--sidebar-width)] px-4 pb-4 pt-2 bg-transparent">
      {/* Painel completo (chat + quick actions) quando expandido */}
      {isExpanded && (
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mb-3" ref={panelRef}>
          <div className="rounded-2xl border border-gray-200 supports-[backdrop-filter]:bg-white/90 backdrop-blur shadow-lg shadow-black/10 dark:border-white/10 dark:bg-neutral-900/70 overflow-hidden flex flex-col min-h-[min(50vh,520px)] xl:min-h-[min(60vh,560px)] 2xl:min-h-[min(70vh,640px)] max-h-[min(80vh,760px)]">
            <div className="sticky top-0 z-20 h-14 px-5 flex items-center justify-between border-b border-gray-200 dark:border-white/10 supports-[backdrop-filter]:bg-white/90 backdrop-blur dark:supports-[backdrop-filter]:bg-neutral-900/70">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Assistente FinanceAI</div>
              <button
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Minimizar"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
              {/* Coluna principal do chat */}
              <div className="relative md:col-span-8 lg:col-span-9 flex flex-col min-h-0 border-r border-gray-100 dark:border-white/10">
                <div
                  className="relative flex-1 min-h-0 overflow-y-auto bg-transparent pr-2 overscroll-contain"
                  onScroll={onMessagesScroll}
                >
                  {/* Chips no topo removidos no modo expandido (cards já estão na lateral) */}
                  {false && suggestions.length > 0 && (
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
                  <div className="px-4 py-3 space-y-5 pb-24">
                {/* Separadores por dia */}
                {messages.map((m, idx) => {
                  const isUser = m.sender === 'user';
                  const isError = m.sender === 'ai' && m.content.toLowerCase().startsWith('desculpe');
                  const prev = messages[idx - 1];
                  const showDaySeparator = !prev || getDayLabel(prev.timestamp) !== getDayLabel(m.timestamp);
                  const showActionsAi = m.sender === 'ai' && idx !== 0; // não mostrar na primeira mensagem de boas-vindas
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

                      {/* Meta linha */}
                      <div className={`mb-1 text-[11px] text-gray-500 dark:text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
                        <span className="font-medium">{isUser ? 'Você' : 'FinanceAI'}</span>
                        <span className="mx-1">•</span>
                        <span>{format(m.timestamp, 'HH:mm', { locale: ptBR })}</span>
                      </div>

                      {/* Conteúdo com avatares alinhados e cartões limpos */}
                      {isUser ? (
                        <div className="ml-auto max-w-[75%] flex items-start gap-3 justify-end">
                          <div className="text-right">
                            <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-line">
                              {m.content}
                            </p>
                          </div>
                          <Avatar className="h-6 w-6 ring-1 ring-gray-200 dark:ring-white/10">
                            <AvatarFallback className="bg-gray-200 text-gray-800 text-[10px] dark:bg-white/20 dark:text-white">{userInitials}</AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <div className="max-w-[85%] flex items-start gap-3">
                          <Avatar className="h-6 w-6 ring-1 ring-gray-200 dark:ring-white/10">
                            <AvatarFallback className="bg-indigo-600 text-white text-[10px]">AI</AvatarFallback>
                          </Avatar>
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-neutral-900">
                            <div className="p-4">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-line m-0">{m.content}</p>
                              </div>
                            </div>
                            {/* Toolbar de ações dentro do card (exceto mensagem de boas-vindas) */}
                            {showActionsAi && (
                              <div className="px-3 pt-2 pb-3 flex items-center gap-3 text-gray-500 dark:text-gray-300">
                                {isError && (
                                  <button className="hover:text-gray-900 dark:hover:text-white" title="Tentar novamente" onClick={() => onSend(lastUserMessage || '')}>
                                    <RefreshCcw className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="hover:text-gray-900 dark:hover:text-white" title="Copiar" onClick={() => { navigator.clipboard.writeText(m.content); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 1200); }}>
                                  {copiedId === m.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button className="hover:text-gray-900 dark:hover:text-white" title="Compartilhar" onClick={() => handleShare(m.content)}>
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button className="hover:text-gray-900 dark:hover:text-white" title="Favoritar">
                                  <Star className="w-4 h-4" />
                                </button>
                                <button className="hover:text-gray-900 dark:hover:text-white" title="Mais">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                </div>

                {/* Input integrado no painel */}
                <div className="sticky bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-3 bg-gradient-to-t from-white/90 to-white/30 dark:from-neutral-900/90 dark:to-transparent backdrop-blur">
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
                    <span>Enter para enviar • Shift+Enter para quebrar linha</span>
                    <button
                      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 bg-white ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 hover:text-gray-800 dark:bg-neutral-900/70 dark:text-gray-200 dark:ring-white/10"
                      onClick={() => {
                        const ev = new CustomEvent('walletai:clear-chat');
                        window.dispatchEvent(ev);
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Limpar conversa
                    </button>
                  </div>
                  <div className={`group flex items-end gap-3 rounded-2xl border border-gray-200 ring-1 ring-gray-300/70 dark:ring-white/15 supports-[backdrop-filter]:bg-white/90 backdrop-blur px-3 shadow-md shadow-black/10 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-white/10 dark:bg-neutral-900/70 transition-all duration-300 py-3`}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Anexar arquivo">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Textarea ref={ref} placeholder={placeholder || "Digite um prompt… (Shift+Enter para nova linha, Enter para enviar)"} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown} rows={1} className={`flex-1 resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 p-2 h-[52px] min-h-[52px] max-h-[52px]`} disabled={isProcessing} aria-label="Mensagem para o assistente" />
                    <Button onClick={() => setIsListening((p) => !p)} variant="ghost" size="icon" className={`h-10 w-10 rounded-full transition-colors ${isListening ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10"}`} aria-pressed={isListening} aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}>
                      <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                    </Button>
                    <Button onClick={handleSubmit} disabled={!value.trim() || isProcessing} className="h-10 w-10 rounded-full bg-blue-500 text-white hover:bg-blue-600" aria-label="Enviar mensagem">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {showScrollToBottom && (
                  <button className="absolute right-4 bottom-40 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200 shadow-sm hover:bg-white dark:bg-neutral-800/80 dark:text-gray-200 dark:ring-white/10" onClick={() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowScrollToBottom(false); }} aria-label="Voltar ao fim">
                    <ArrowDown className="w-3 h-3" /> Ao fim
                  </button>
                )}
              </div>

              {/* Coluna lateral: Quick Actions */}
              <aside className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col min-h-0 bg-white/80 dark:bg-neutral-900/50">
                <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-200 supports-[backdrop-filter]:bg-white/90 backdrop-blur dark:supports-[backdrop-filter]:bg-neutral-900/70">Ações rápidas</div>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                  {quickActions.map((a) => (
                    <button key={a.id} className="w-full text-left rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900/60 p-3 shadow-sm" onClick={() => handleChipClick(a.prompt)}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900/50">
                          <a.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{a.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{a.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>
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

      { !isExpanded && (
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
      )}
    </div>
  );
}

export default ChatBar;


