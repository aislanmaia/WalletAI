import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/hooks/useFinancialData';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions-all'],
    queryFn: async () => {
      const res = await apiService.getTransactions();
      return (res.data || []) as Transaction[];
    },
  });

  const transactions = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <a className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </a>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Todas as Transações</h1>
        </div>
      </div>

      <Card className="p-6 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70 dark:bg-white/5">
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={`sk-${idx}`} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-white/5' : undefined}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && transactions.map((t, idx) => {
                const isExpense = t.amount < 0;
                return (
                  <TableRow key={t.id} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-white/5' : undefined}>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{t.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-[10px] font-medium px-2 py-0.5 border-gray-200 text-gray-600 dark:border-white/15 dark:text-gray-300">
                        {t.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(t.date as any)}</TableCell>
                    <TableCell className={isExpense ? 'text-rose-600 text-right tabular-nums font-semibold' : 'text-emerald-600 text-right tabular-nums font-semibold'}>
                      {isExpense ? '-' : '+'}R$ {formatCurrency(Math.abs(t.amount))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}


