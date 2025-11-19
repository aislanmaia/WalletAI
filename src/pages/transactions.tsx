import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTransactions } from '@/api/transactions';
import { Transaction } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TransactionsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'todas' | 'receitas' | 'despesas'>('todas');
  const [period, setPeriod] = useState<'tudo' | '7d' | '30d' | '90d'>('tudo');
  const [category, setCategory] = useState<string>('todas');

  const queryClient = useQueryClient();
  const [location] = useLocation();
  const { activeOrgId } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      return await listTransactions({ organization_id: activeOrgId });
    },
    enabled: !!activeOrgId,
  });

  // Expor função para invalidar queries quando estiver nesta rota
  useEffect(() => {
    if (location === '/transactions') {
      // Armazenar função de invalidação no window para acesso global
      (window as any).__invalidateTransactions = () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      };
    }
    return () => {
      delete (window as any).__invalidateTransactions;
    };
  }, [location, queryClient]);

  // Converter Transaction da API para o formato esperado (amount positivo/negativo)
  const transactionsWithAmount = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    return list
      .map((t) => ({
        ...t,
        id: t.id.toString(),
        amount: t.type === 'income' ? t.value : -t.value,
        date: new Date(t.date),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (transactionsWithAmount || []).forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactionsWithAmount]);

  const filtered = useMemo(() => {
    let list = [...transactionsWithAmount];
    // Tipo
    if (type === 'receitas') list = list.filter((t) => t.amount > 0);
    if (type === 'despesas') list = list.filter((t) => t.amount < 0);
    // Período
    if (period !== 'tudo') {
      const now = new Date().getTime();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      list = list.filter((t) => new Date(t.date).getTime() >= cutoff);
    }
    // Categoria
    if (category !== 'todas') list = list.filter((t) => t.category === category);
    // Busca
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactionsWithAmount, type, period, category, query]);

  const downloadCsv = () => {
    const header = ['Descrição', 'Categoria', 'Data', 'Valor'];
    const rows = filtered.map((t) => [
      t.description,
      t.category,
      formatDate(t.date as any),
      `${t.amount < 0 ? '-' : ''}R$ ${formatCurrency(Math.abs(t.amount))}`,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace('"', '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacoes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 max-w-7xl xl:max-w-[90rem] 2xl:max-w-[96rem]">
      <div className="mt-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <a className="inline-flex items-center text-sm text-[#4A56E2] hover:text-[#343D9B]">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </a>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Todas as Transações</h1>
        </div>
      </div>

      {/* Toolbar: filtros à esquerda, ações à direita */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">
          <div className="md:col-span-2">
            <label htmlFor="tx-search" className="mb-1 block text-xs font-medium text-gray-600">Buscar</label>
            <Input
              id="tx-search"
              placeholder="por descrição ou categoria"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl h-10 border-[#D1D5DB] bg-white placeholder-[#9CA3AF] shadow-sm focus-visible:ring-2 focus-visible:ring-[#4A56E2] focus-visible:ring-offset-1"
            />
          </div>
          <div>
            <label id="tx-type-label" className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger id="tx-type" aria-labelledby="tx-type-label" className="rounded-xl h-10 border-[#D1D5DB] bg-white text-[#111827] shadow-sm focus-visible:ring-2 focus-visible:ring-[#4A56E2] focus-visible:ring-offset-1">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="receitas">Receitas</SelectItem>
                <SelectItem value="despesas">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label id="tx-period-label" className="mb-1 block text-xs font-medium text-gray-600">Período</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger id="tx-period" aria-labelledby="tx-period-label" className="rounded-xl h-10 border-[#D1D5DB] bg-white text-[#111827] shadow-sm focus-visible:ring-2 focus-visible:ring-[#4A56E2] focus-visible:ring-offset-1">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tudo">Tudo</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label id="tx-category-label" className="mb-1 block text-xs font-medium text-gray-600">Categoria</label>
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger id="tx-category" aria-labelledby="tx-category-label" className="rounded-xl h-10 border-[#D1D5DB] bg-white text-[#111827] shadow-sm focus-visible:ring-2 focus-visible:ring-[#4A56E2] focus-visible:ring-offset-1">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex md:justify-end">
          <Button onClick={downloadCsv} variant="outline" className="rounded-xl gap-2 border-[#D1D5DB] text-[#4A56E2] hover:bg-[#EEF2FF]">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="p-0 rounded-2xl shadow-flat border-0 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
              <TableRow className="bg-gray-50">
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={`sk-${idx}`} className={idx % 2 === 0 ? 'bg-gray-50' : undefined}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && filtered.map((t, idx) => {
                const isExpense = t.amount < 0;
                return (
                  <TableRow key={t.id} className={idx % 2 === 0 ? 'bg-gray-50' : undefined}>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{t.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-[10px] font-medium px-2 py-0.5 border-gray-200 text-gray-600 dark:border-white/15 dark:text-gray-300">
                        {t.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{formatDate(t.date as any)}</TableCell>
                    <TableCell className={isExpense ? 'text-[#F87171] text-right tabular-nums font-semibold' : 'text-[#10B981] text-right tabular-nums font-semibold'}>
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


