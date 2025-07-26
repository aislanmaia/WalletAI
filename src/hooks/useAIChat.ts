import { useState } from 'react';
import { apiService } from '../services/api';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Tipos para resposta da API de IA
interface AIResponse {
  response: string;
  transaction?: any;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Olá! Sou seu assistente financeiro. Posso ajudar você a:

📊 Registrar despesas e receitas
📈 Consultar relatórios e métricas  
💡 Dar insights sobre seus gastos
🎯 Acompanhar suas metas`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = (content: string, sender: 'user' | 'ai') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const processUserMessage = async (message: string, onTransaction?: (transaction: any) => void) => {
    addMessage(message, 'user');
    setIsProcessing(true);

    try {
      // Enviar mensagem para a API de IA
      const response = await apiService.sendChatMessage(message);
      
      if (response.success && response.data) {
        const aiData = response.data as AIResponse;
        const aiResponse = aiData.response || 'Desculpe, não consegui processar sua mensagem.';
        addMessage(aiResponse, 'ai');
        
        // Se a IA processou uma transação, chamar o callback
        if (aiData.transaction && onTransaction) {
          onTransaction(aiData.transaction);
        }
      } else {
        addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.', 'ai');
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      addMessage('Desculpe, ocorreu um erro de conexão. Verifique sua internet e tente novamente.', 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        content: `Olá! Sou seu assistente financeiro. Posso ajudar você a:

📊 Registrar despesas e receitas
📈 Consultar relatórios e métricas  
💡 Dar insights sobre seus gastos
🎯 Acompanhar suas metas`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  return {
    messages,
    isProcessing,
    processUserMessage,
    clearMessages
  };
}
