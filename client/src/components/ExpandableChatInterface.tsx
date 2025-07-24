import { useState, useRef, useEffect } from 'react';
import { Bot, User, X, Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/hooks/useAIChat';
import { useViewportHeight } from '@/hooks/useViewportHeight';

interface ExpandableChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export function ExpandableChatInterface({ messages, onSendMessage, isProcessing }: ExpandableChatInterfaceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { viewportHeight } = useViewportHeight(isExpanded);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    // Mock voice recognition
    if (!isListening) {
      setTimeout(() => {
        setInputValue('Gastei R$ 50 no almoço hoje');
        setIsListening(false);
      }, 2000);
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop - only when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Expandable Chat Interface */}
      <div 
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'bottom-0 top-0' 
            : 'bottom-0'
        }`}
      >
        <div 
          className={`bg-white transition-all duration-300 ease-in-out ${
            isExpanded 
              ? 'h-full flex flex-col md:mx-auto md:max-w-3xl md:h-4/5 md:my-auto md:rounded-2xl shadow-2xl' 
              : 'h-auto border-t border-gray-200 shadow-lg'
          }`}
          style={{
            height: isExpanded && window.innerWidth <= 768 && viewportHeight > 0 
              ? `${viewportHeight}px` 
              : undefined
          }}
        >
          {/* Chat Header - only when expanded */}
          {isExpanded && (
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assistente FinanceAI</h3>
                  <p className="text-sm text-gray-500">Online - Pronto para ajudar</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Chat Messages - only when expanded */}
          {isExpanded && (
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
              style={{
                height: window.innerWidth <= 768 && viewportHeight > 0 
                  ? `${viewportHeight - 200}px` 
                  : undefined,
                maxHeight: window.innerWidth <= 768 && viewportHeight > 0 
                  ? `${viewportHeight - 200}px` 
                  : undefined
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 chat-message ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {message.sender === 'user' ? (
                    <>
                      <div className="bg-blue-500 rounded-lg p-4 max-w-md text-white">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                      <div className="bg-gray-300 p-2 rounded-full flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{message.content}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-start space-x-3 chat-message">
                  <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area - always present */}
          <div className={`p-4 bg-white flex-shrink-0 ${isExpanded ? 'border-t border-gray-200' : ''}`}>
            <div className="flex items-center space-x-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder="Pergunte algo ou registre uma transação... (Ex: 'Gastei R$ 50 no almoço' ou 'Quanto gastei em supermercado?')"
                  className="pl-10 pr-12 py-3 rounded-full text-sm placeholder-gray-500 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`text-gray-400 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors duration-200 ${
                      isListening ? 'text-red-500 animate-pulse' : ''
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}