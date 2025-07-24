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

  const chatHeight = isExpanded 
    ? (window.innerWidth <= 768 && viewportHeight > 0 ? viewportHeight - 120 : window.innerHeight * 0.6)
    : 0;

  return (
    <>
      {/* Backdrop - only when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Unified Chat Widget - positioned at bottom */}
      <div className="fixed left-0 right-0 bottom-0 z-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Single unified container */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Chat Messages Area - only visible when expanded */}
            {isExpanded && (
              <div 
                className="transition-all duration-300 ease-out"
                style={{ height: `${chatHeight}px` }}
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
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

                {/* Chat Messages */}
                <div 
                  className="overflow-y-auto p-4 space-y-4 bg-gray-50" 
                  style={{ height: `${chatHeight - 80}px` }}
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
                          <div className="bg-white rounded-lg p-4 max-w-md shadow-sm">
                            <p className="text-sm text-gray-900 whitespace-pre-line">{message.content}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
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
              </div>
            )}

            {/* Input Area - always visible at bottom of widget */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Pergunte algo ou registre uma transação... (Ex: 'Gastei R$ 50 no almoço' ou 'Quanto gastei este mês?')"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    className="pr-12 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                
                <Button
                  onClick={handleVoiceInput}
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}