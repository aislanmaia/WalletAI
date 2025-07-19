import { useState } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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

  const processUserMessage = (message: string, onTransaction?: (transaction: any) => void) => {
    addMessage(message, 'user');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(message, onTransaction);
      addMessage(response, 'ai');
      setIsProcessing(false);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string, onTransaction?: (transaction: any) => void): string => {
    const message = userMessage.toLowerCase();
    
    // Extract monetary values
    const moneyRegex = /r?\$?\s*(\d+(?:[\.,]\d{2})?)/i;
    const moneyMatch = message.match(moneyRegex);
    const amount = moneyMatch ? parseFloat(moneyMatch[1].replace(',', '.')) : 0;

    if (message.includes('gastei') || message.includes('comprei') || message.includes('paguei')) {
      // Determine category
      let category = 'Outros';
      let icon = 'shopping-bag';
      
      if (message.includes('supermercado') || message.includes('comida') || message.includes('almoço') || message.includes('jantar')) {
        category = 'Alimentação';
        icon = 'shopping-cart';
      } else if (message.includes('combustível') || message.includes('uber') || message.includes('transporte')) {
        category = 'Transporte';
        icon = 'car';
      } else if (message.includes('farmácia') || message.includes('médico') || message.includes('saúde')) {
        category = 'Saúde';
        icon = 'heart';
      }

      if (onTransaction && amount > 0) {
        onTransaction({
          description: extractDescription(message) || category,
          amount: -amount,
          category,
          type: 'expense',
          icon
        });
      }

      return `✅ Despesa registrada com sucesso!

**Detalhes:**
💰 Valor: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🏪 Categoria: ${category}
📅 Data: Hoje

Seus gastos em ${category} este mês estão dentro da meta esperada.`;
    } 
    
    else if (message.includes('recebi') || message.includes('salário') || message.includes('renda')) {
      if (onTransaction && amount > 0) {
        onTransaction({
          description: extractDescription(message) || 'Receita',
          amount: amount,
          category: 'Trabalho',
          type: 'income',
          icon: 'dollar-sign'
        });
      }

      return `💰 Receita registrada! Que ótima notícia!

**Detalhes:**
💵 Valor: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
📈 Sua situação financeira foi atualizada
📅 Data: Hoje

Continue assim! Sua meta de economia está mais próxima.`;
    } 
    
    else if (message.includes('quanto') || message.includes('gastos') || message.includes('relatório')) {
      return `📊 **Resumo dos seus gastos:**

💳 Total gasto este mês: R$ 5.750,00
📈 Isso representa 70% do seu orçamento
🎯 Você está R$ 750,00 abaixo da meta

**Por categoria:**
🍽️ Alimentação: R$ 1.250,00 (22%)
🚗 Transporte: R$ 800,00 (14%)
🏠 Moradia: R$ 2.100,00 (37%)

Quer ver mais detalhes de alguma categoria específica?`;
    } 
    
    else if (message.includes('meta') || message.includes('objetivo')) {
      return `🎯 **Suas metas financeiras:**

💰 Meta de economia mensal: R$ 2.500,00
📊 Progresso atual: 78% (R$ 1.950,00)
🏆 Faltam apenas R$ 550,00 para atingir sua meta!

📈 **Dicas para alcançar:**
• Reduza 10% nos gastos com lazer
• Considere economizar no transporte
• Continue no mesmo ritmo de economia

Você está indo muito bem! 🚀`;
    } 
    
    else {
      return `🤖 Entendi! Estou aqui para ajudar você com:

💸 **Registrar transações**: "Gastei R$ 50 no almoço"
📊 **Consultar gastos**: "Quanto gastei este mês?"
🎯 **Acompanhar metas**: "Como está minha meta?"
📈 **Relatórios**: "Relatório de gastos por categoria"

O que você gostaria de fazer agora?`;
    }
  };

  const extractDescription = (message: string): string => {
    // Simple extraction logic - in real app would be more sophisticated
    if (message.includes('supermercado')) return 'Supermercado';
    if (message.includes('almoço')) return 'Almoço';
    if (message.includes('jantar')) return 'Jantar';
    if (message.includes('combustível')) return 'Combustível';
    if (message.includes('uber')) return 'Uber';
    return '';
  };

  return {
    messages,
    isProcessing,
    processUserMessage
  };
}
