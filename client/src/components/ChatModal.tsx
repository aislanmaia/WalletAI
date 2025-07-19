import { useEffect, useRef } from 'react';
import { Bot, User, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/hooks/useAIChat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export function ChatModal({ isOpen, onClose, messages, onSendMessage, isProcessing }: ChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    const input = inputRef.current;
    if (input && input.value.trim()) {
      onSendMessage(input.value);
      input.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 modal-backdrop"
        onClick={handleBackdropClick}
      />
      
      {/* Modal content */}
      <div className="relative h-full flex items-end justify-center p-4">
        <div className="bg-white rounded-t-3xl w-full max-w-4xl h-5/6 flex flex-col shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 chat-message ${
                  message.sender === 'user' ? 'justify-end' : ''
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

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem ou comando..."
                  className="px-4 py-3 rounded-full text-sm placeholder-gray-500 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isProcessing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
