import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShoppingCart, Building, Car, Heart, Coffee, ShoppingBag } from 'lucide-react';
import { Transaction } from '@/hooks/useFinancialData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-indigo/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h3>
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Ver todas
          </Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Sem transações no período.</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-indigo/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h3>
        <Link href="/transactions">
          <Button asChild variant="ghost" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            <a>Ver todas</a>
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 6).map((transaction, idx) => {
          const Icon = getTransactionIcon(transaction.icon);
          const isExpense = transaction.amount < 0;
          
          return (
            <div
              key={transaction.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl transition-colors',
                idx % 2 === 0
                  ? 'bg-gray-50/60 hover:bg-gray-100/50'
                  : 'bg-gray-100/60 hover:bg-gray-200/50'
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    'p-2 rounded-full ring-1',
                    isExpense ? 'bg-rose-100/80 ring-rose-200' : 'bg-emerald-100/80 ring-emerald-200'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isExpense ? 'text-rose-600' : 'text-emerald-600')} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {transaction.description}
                    <Badge variant="outline" className="rounded-full text-[10px] font-medium px-2 py-0.5 border-gray-200 text-gray-600 dark:border-white/15 dark:text-gray-300">
                      {transaction.category}
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  isExpense ? 'text-rose-600' : 'text-emerald-600'
                )}
              >
                {isExpense ? '-' : '+'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
