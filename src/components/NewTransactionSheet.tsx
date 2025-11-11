import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createTransaction } from '@/api/transactions';
import { getMyOrganizations } from '@/api/organizations';
import { CreateTransactionRequest } from '@/types/api';
import { handleApiError } from '@/api/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, Check, CreditCard, Wallet, Banknote, ChevronsUpDown, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SearchableSelect } from '@/components/SearchableSelect';
import { CategorySelector } from '@/components/CategorySelector';

const transactionSchema = z.object({
  organization_id: z.string().min(1, 'Selecione uma organização'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo de transação',
  }),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  value: z.number().positive('O valor deve ser maior que zero'),
  payment_method: z.string().min(1, 'Selecione o método de pagamento'),
  date: z.string().min(1, 'Selecione uma data'),
  // Campos opcionais para cartão de crédito
  card_last4: z.string().optional().nullable(),
  modality: z.enum(['cash', 'installment']).optional().nullable(),
  installments_count: z.number().positive().optional().nullable(),
}).refine((data) => {
  if (data.payment_method === 'Cartão de Crédito' && !data.card_last4) {
    return false;
  }
  return true;
}, {
  message: 'Informe os últimos 4 dígitos do cartão',
  path: ['card_last4'],
}).refine((data) => {
  if (data.modality === 'installment' && !data.installments_count) {
    return false;
  }
  return true;
}, {
  message: 'Informe o número de parcelas',
  path: ['installments_count'],
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface NewTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Serviços',
  'Outros',
];

const allPaymentMethods = [
  'PIX',
  'Dinheiro',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
];

// Métodos de pagamento mais comuns para chips visuais
const commonPaymentMethods = [
  { value: 'Cartão de Crédito', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'PIX', label: 'PIX', icon: Wallet },
  { value: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'Transferência Bancária', label: 'Transferência Bancária', icon: Building2 },
];

export function NewTransactionSheet({
  open,
  onOpenChange,
  onSuccess,
}: NewTransactionSheetProps) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveAndCreateAnother, setSaveAndCreateAnother] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [cardSectionRef, setCardSectionRef] = useState<HTMLDivElement | null>(null);
  const [categorySectionRef, setCategorySectionRef] = useState<HTMLDivElement | null>(null);
  const [otherPaymentMethodsRef, setOtherPaymentMethodsRef] = useState<HTMLDivElement | null>(null);
  const [valueDisplay, setValueDisplay] = useState<string>('');
  const valueInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      organization_id: '',
      type: 'expense',
      description: '',
      category: '',
      value: 0,
      payment_method: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      card_last4: null,
      modality: null,
      installments_count: null,
    },
  });

  const paymentMethod = form.watch('payment_method');
  const type = form.watch('type');

  // Filtrar métodos de pagamento baseado no tipo de transação
  const paymentMethods = type === 'income'
    ? ['PIX', 'Dinheiro', 'Transferência Bancária']
    : allPaymentMethods;

  // Focar no campo valor quando abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        valueInputRef.current?.focus();
      }, 350); // Aguardar animação do sheet
    }
  }, [open]);

  // Scroll automático quando seção de cartão aparecer
  useEffect(() => {
    if (paymentMethod === 'Cartão de Crédito' && type === 'expense' && cardSectionRef) {
      setTimeout(() => {
        cardSectionRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [paymentMethod, type, cardSectionRef]);

  // Carregar organizações ao abrir o sheet
  useEffect(() => {
    if (open) {
      loadOrganizations();
      form.reset({
        organization_id: '',
        type: 'expense',
        description: '',
        category: '',
        value: 0,
        payment_method: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        card_last4: null,
        modality: null,
        installments_count: null,
      });
      setError(null);
      setSaveAndCreateAnother(false);
      setShowSuccess(false);
      setShowCategory(false);
      setValueDisplay('');
    }
  }, [open]);

  const loadOrganizations = async () => {
    try {
      const data = await getMyOrganizations();
      const orgs = data.organizations.map((org) => ({
        id: org.organization.id,
        name: org.organization.name,
      }));
      setOrganizations(orgs);
      // Selecionar automaticamente a primeira organização
      if (orgs.length > 0 && !form.getValues('organization_id')) {
        form.setValue('organization_id', orgs[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar organizações:', err);
    }
  };

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const transactionData: CreateTransactionRequest = {
        organization_id: values.organization_id,
        type: values.type,
        description: values.description,
        category: values.category,
        value: values.value,
        payment_method: values.payment_method,
        date: values.date,
        ...(values.payment_method === 'Cartão de Crédito' && {
          card_last4: values.card_last4 || null,
          modality: values.modality || null,
          installments_count: values.modality === 'installment' ? values.installments_count || null : null,
        }),
      };

      await createTransaction(transactionData);
      setShowSuccess(true);
      setLoading(false);
      // Não fechar automaticamente - aguardar ação do usuário
    } catch (err) {
      setError(handleApiError(err));
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setValueDisplay('');
    setShowCategory(false);
    form.reset({
      organization_id: form.getValues('organization_id'),
      type: form.getValues('type'),
      description: '',
      category: '',
      value: 0,
      payment_method: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      card_last4: null,
      modality: null,
      installments_count: null,
    });
    setTimeout(() => {
      valueInputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const showCardSection = paymentMethod === 'Cartão de Crédito' && type === 'expense';

  const handleSheetOpenChange = (newOpen: boolean) => {
    // Só permitir fechar se não estiver processando e não estiver em estado de sucesso
    if (!newOpen && !loading && !showSuccess) {
      onOpenChange(false);
    } else if (!newOpen && !loading && showSuccess) {
      // Se estiver em sucesso, permitir fechar clicando fora
      setShowSuccess(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent 
          side="right" 
          className="w-[450px] sm:w-[450px] overflow-hidden p-0 [&>button]:hidden z-50 [&_div[data-radix-dialog-overlay]]:bg-black/40"
        >
        <div className="flex flex-col h-full">
          {/* Header fixo */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle className="text-2xl font-bold">
              Nova Transação
            </SheetTitle>
          </SheetHeader>

          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Estado de Sucesso */}
                {showSuccess && (
                  <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in-0 duration-300 rounded-l-2xl">
                    <div className="text-center space-y-6 px-6">
                      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center animate-in zoom-in-95 duration-500">
                        <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Transação salva com sucesso!</h3>
                        <p className="text-muted-foreground">Sua transação foi registrada.</p>
                      </div>
                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          type="button"
                          onClick={handleCreateAnother}
                          className="w-full bg-gradient-to-r from-[#4A56E2] to-[#00C6B8] hover:from-[#343D9B] hover:to-[#00A89C] text-white"
                        >
                          Criar Nova Transação
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="w-full"
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tipo de Transação - Botões Visuais */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Tipo</FormLabel>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('expense');
                            const validForBothTypes = ['PIX', 'Dinheiro', 'Transferência Bancária'];
                            const currentMethod = form.getValues('payment_method');
                            if (currentMethod && !validForBothTypes.includes(currentMethod)) {
                              form.setValue('payment_method', '');
                              form.setValue('card_last4', null);
                              form.setValue('modality', null);
                              form.setValue('installments_count', null);
                            }
                          }}
                          className={cn(
                            'flex-1 h-14 rounded-xl font-semibold text-base transition-all duration-150',
                            'flex items-center justify-center gap-2',
                            field.value === 'expense'
                              ? 'bg-rose-500 text-white shadow-lg'
                              : 'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-rose-500 dark:text-rose-400 hover:border-rose-300 dark:hover:border-rose-600'
                          )}
                        >
                          <TrendingDown className="h-5 w-5" />
                          Despesa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('income');
                            const validForBothTypes = ['PIX', 'Dinheiro', 'Transferência Bancária'];
                            const currentMethod = form.getValues('payment_method');
                            if (currentMethod && !validForBothTypes.includes(currentMethod)) {
                              form.setValue('payment_method', '');
                              form.setValue('card_last4', null);
                              form.setValue('modality', null);
                              form.setValue('installments_count', null);
                            }
                          }}
                          className={cn(
                            'flex-1 h-14 rounded-xl font-semibold text-base transition-all duration-150',
                            'flex items-center justify-center gap-2',
                            field.value === 'income'
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-emerald-500 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600'
                          )}
                        >
                          <TrendingUp className="h-5 w-5" />
                          Receita
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor - Campo Herói */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Valor (R$)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            ref={valueInputRef}
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            style={{ fontSize: '2.5rem' }}
                            className="h-[72px] font-bold text-right pr-4 pl-[4.5rem] border-2 focus:border-[#4A56E2] focus:ring-2 focus:ring-[#4A56E2]/20"
                            value={valueDisplay}
                            onChange={(e) => {
                              // Remove tudo exceto números e vírgula
                              let inputValue = e.target.value.replace(/[^\d,]/g, '');
                              
                              // Permite apenas uma vírgula
                              const commaCount = (inputValue.match(/,/g) || []).length;
                              if (commaCount > 1) {
                                inputValue = inputValue.replace(/,/g, '').replace(/(\d+)/, '$1,');
                              }
                              
                              // Limita a 2 casas decimais após a vírgula
                              if (inputValue.includes(',')) {
                                const parts = inputValue.split(',');
                                if (parts[1] && parts[1].length > 2) {
                                  inputValue = parts[0] + ',' + parts[1].substring(0, 2);
                                }
                              }
                              
                              setValueDisplay(inputValue);
                              
                              // Converte para número e atualiza o form
                              const numericValue = inputValue.replace(',', '.');
                              const parsed = parseFloat(numericValue) || 0;
                              field.onChange(parsed);
                            }}
                            onFocus={(e) => {
                              // Se o valor for 0, limpa o display para permitir digitação
                              if (field.value === 0) {
                                setValueDisplay('');
                                e.target.select();
                              } else {
                                // Mostra o valor formatado sem vírgula fixa para edição
                                setValueDisplay(field.value.toString().replace('.', ','));
                              }
                            }}
                            onBlur={(e) => {
                              // Ao perder foco, formata com 2 casas decimais
                              if (field.value > 0) {
                                setValueDisplay(field.value.toFixed(2).replace('.', ','));
                              } else {
                                setValueDisplay('');
                              }
                              field.onBlur();
                            }}
                            disabled={loading}
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[2.5rem] font-bold text-foreground pointer-events-none">
                            R$
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organização - Oculto por padrão */}
                <FormField
                  control={form.control}
                  name="organization_id"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          options={organizations.map((org) => ({
                            value: org.id,
                            label: org.name,
                          }))}
                          placeholder="Selecione uma organização"
                          disabled={loading}
                          searchPlaceholder="Buscar organização..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">O que foi?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Almoço no restaurante"
                          {...field}
                          disabled={loading}
                          onBlur={(e) => {
                            field.onBlur();
                            // Revelar categoria quando descrição perder foco
                            if (e.target.value.trim().length > 0 && !showCategory) {
                              setShowCategory(true);
                              // Scroll suave para a seção de categoria
                              setTimeout(() => {
                                categorySectionRef?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }, 100);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoria - Revelada após descrição perder foco */}
                {showCategory && (
                  <div
                    ref={setCategorySectionRef}
                    className="animate-in fade-in-0 slide-in-from-top-2 duration-300"
                  >
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Como classificamos isso?</FormLabel>
                          <FormControl>
                            <CategorySelector
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              options={categories}
                              disabled={loading}
                              mostUsedCategories={[]} // TODO: Implementar estatísticas de categorias mais usadas
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Data */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Método de Pagamento - Chips Visuais */}
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <div className="space-y-3">
                        {/* Chips para métodos mais comuns */}
                        <div className="flex flex-wrap gap-2">
                          {commonPaymentMethods
                            .filter(method => {
                              // Para Receita, mostrar apenas PIX, Dinheiro e Transferência Bancária como chips
                              if (type === 'income') {
                                return ['PIX', 'Dinheiro', 'Transferência Bancária'].includes(method.value);
                              }
                              // Para Despesa, mostrar todos exceto Transferência Bancária (que fica em "Outros métodos")
                              return method.value !== 'Transferência Bancária' && paymentMethods.includes(method.value);
                            })
                            .map((method) => {
                              const Icon = method.icon;
                              const isSelected = field.value === method.value;
                              return (
                                <button
                                  key={method.value}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(method.value);
                                    if (method.value !== 'Cartão de Crédito') {
                                      form.setValue('card_last4', null);
                                      form.setValue('modality', null);
                                      form.setValue('installments_count', null);
                                    }
                                  }}
                                  disabled={loading}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                                    'border-2',
                                    isSelected
                                      ? 'bg-[#4A56E2] text-white border-[#4A56E2] shadow-md scale-105'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700'
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                  {method.label}
                                </button>
                              );
                            })}
                        </div>

                        {/* Campo pesquisável para outros métodos */}
                        {type === 'expense' && paymentMethods.filter(m => {
                          // Para Despesa, incluir métodos que não são chips (exceto Transferência Bancária que está em commonPaymentMethods mas deve aparecer aqui)
                          const isCommonChip = commonPaymentMethods.some(c => c.value === m && c.value !== 'Transferência Bancária');
                          return !isCommonChip;
                        }).length > 0 && (
                          <div ref={setOtherPaymentMethodsRef}>
                            <SearchableSelect
                              value={field.value && !commonPaymentMethods.some(c => c.value === field.value && c.value !== 'Transferência Bancária') ? field.value : ''}
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== 'Cartão de Crédito') {
                                  form.setValue('card_last4', null);
                                  form.setValue('modality', null);
                                  form.setValue('installments_count', null);
                                }
                              }}
                              options={paymentMethods
                                .filter(m => {
                                  // Para Despesa, incluir métodos que não são chips (exceto Transferência Bancária que está em commonPaymentMethods mas deve aparecer aqui)
                                  const isCommonChip = commonPaymentMethods.some(c => c.value === m && c.value !== 'Transferência Bancária');
                                  return !isCommonChip;
                                })
                                .map((method) => ({
                                  value: method,
                                  label: method,
                                }))}
                              placeholder="Outros métodos..."
                              disabled={loading}
                              searchPlaceholder="Buscar método de pagamento..."
                              onOpen={() => {
                                // Scroll automático quando o seletor abrir
                                if (otherPaymentMethodsRef) {
                                  setTimeout(() => {
                                    otherPaymentMethodsRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 150);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campos condicionais para Cartão de Crédito - com animação */}
                {showCardSection && (
                  <div
                    ref={setCardSectionRef}
                    className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border animate-in fade-in-0 slide-in-from-top-2 duration-300"
                  >
                      <h4 className="font-medium text-sm">Informações do Cartão</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="card_last4"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Últimos 4 dígitos</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  maxLength={4}
                                  placeholder="1234"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(value || null);
                                  }}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="modality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modalidade</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value !== 'installment') {
                                    form.setValue('installments_count', null);
                                  }
                                }}
                                value={field.value || ''}
                                disabled={loading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">À vista</SelectItem>
                                  <SelectItem value="installment">Parcelado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch('modality') === 'installment' && (
                        <FormField
                          control={form.control}
                          name="installments_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Parcelas</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="2"
                                  max="24"
                                  placeholder="Ex: 10"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || null;
                                    field.onChange(value);
                                  }}
                                  value={field.value || ''}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormDescription>
                                Informe o número de parcelas (2 a 24)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

              </form>
            </Form>
          </div>

          {/* Rodapé fixo */}
          <div className="border-t bg-background px-6 py-4 shrink-0">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                disabled={loading}
                onClick={() => {
                  setSaveAndCreateAnother(false);
                  form.handleSubmit(onSubmit)();
                }}
                className="w-full h-12 bg-gradient-to-r from-[#4A56E2] to-[#00C6B8] hover:from-[#343D9B] hover:to-[#00A89C] text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => {
                  setSaveAndCreateAnother(true);
                  form.handleSubmit(onSubmit)();
                }}
                variant="secondary"
                className="w-full h-12 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar e criar outra'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full h-12"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

