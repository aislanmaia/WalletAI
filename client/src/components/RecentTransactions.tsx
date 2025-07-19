import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Building, Car, Heart, Coffee, ShoppingBag } from 'lucide-react';
import { Transaction } from '@/hooks/useFinancialData';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getTransactionIcon = (iconName: string) => {
  const iconMap = {
    'shopping-cart': ShoppingCart,
    'building': Building,
    'car': Car,
    'gas-pump': Car,
    'heart': Heart,
    'coffee': Coffee,
    'shopping-bag': ShoppingBag,
    'dollar-sign': Building
  };
  
  const Icon = iconMap[iconName as keyof typeof iconMap] || ShoppingBag;
  return Icon;
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${diffDays} dias atrás`;
  }
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="p-6 bg-white shadow-sm border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todas
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.slice(0, 3).map((transaction) => {
          const Icon = getTransactionIcon(transaction.icon);
          const isExpense = transaction.amount < 0;
          
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isExpense ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isExpense ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                isExpense ? 'text-red-600' : 'text-green-600'
              }`}>
                {isExpense ? '-' : '+'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
