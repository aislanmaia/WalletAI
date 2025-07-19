import { useState } from 'react';
import { Bot, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GlobalAIInputProps {
  onSubmit: (message: string) => void;
  onOpenChat: () => void;
}

export function GlobalAIInput({ onSubmit, onOpenChat }: GlobalAIInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue);
      onOpenChat();
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Bot className="w-5 h-5 text-blue-500" />
            </div>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte algo ou registre uma transação... (Ex: 'Gastei R$ 50 no almoço' ou 'Quanto gastei em supermercado?')"
              className="pl-10 pr-12 py-3 rounded-full text-sm placeholder-gray-500 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
