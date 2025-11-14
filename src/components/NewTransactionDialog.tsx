import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createTransaction } from '@/api/transactions';
import { getMyOrganizations } from '@/api/organizations';
import { CreateTransactionRequest } from '@/types/api';
import { handleApiError } from '@/api/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

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
  // Se payment_method é "Cartão de Crédito", card_last4 é obrigatório
  if (data.payment_method === 'Cartão de Crédito' && !data.card_last4) {
    return false;
  }
  return true;
}, {
  message: 'Informe os últimos 4 dígitos do cartão',
  path: ['card_last4'],
}).refine((data) => {
  // Se modality é "installment", installments_count é obrigatório
  if (data.modality === 'installment' && !data.installments_count) {
    return false;
  }
  return true;
}, {
  message: 'Informe o número de parcelas',
  path: ['installments_count'],
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface NewTransactionDialogProps {
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

export function NewTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewTransactionDialogProps) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveAndCreateAnother, setSaveAndCreateAnother] = useState(false);

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
  // Para Receita: apenas PIX, Dinheiro e Transferência Bancária
  const paymentMethods = type === 'income'
    ? ['PIX', 'Dinheiro', 'Transferência Bancária']
    : allPaymentMethods;


  // Carregar organizações ao abrir o dialog
  useEffect(() => {
    if (open) {
      loadOrganizations();
      // Resetar formulário
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
    }
  }, [open]);

  const loadOrganizations = async () => {
    try {
      const data = await getMyOrganizations();
      setOrganizations(
        data.organizations.map((org) => ({
          id: org.organization.id,
          name: org.organization.name,
        }))
      );
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
        // Campos opcionais para cartão
        ...(values.payment_method === 'Cartão de Crédito' && {
          card_last4: values.card_last4 || null,
          modality: values.modality || null,
          installments_count: values.modality === 'installment' ? values.installments_count || null : null,
        }),
      };

      await createTransaction(transactionData);

      if (saveAndCreateAnother) {
        // Resetar formulário mas manter organização e tipo
        form.reset({
          organization_id: values.organization_id,
          type: values.type,
          description: '',
          category: '',
          value: 0,
          payment_method: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          card_last4: null,
          modality: null,
          installments_count: null,
        });
        // Focar no primeiro campo
        setTimeout(() => {
          form.setFocus('description');
        }, 100);
      } else {
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {type === 'income' ? (
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-rose-600" />
            )}
            Nova Transação
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da transação abaixo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tipo de Transação */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Métodos válidos para ambos os tipos (Receita e Despesa)
                      const validForBothTypes = ['PIX', 'Dinheiro', 'Transferência Bancária'];
                      const currentMethod = form.getValues('payment_method');
                      
                      // Só resetar se o método atual não for válido para ambos os tipos
                      if (currentMethod && !validForBothTypes.includes(currentMethod)) {
                        form.setValue('payment_method', '');
                        form.setValue('card_last4', null);
                        form.setValue('modality', null);
                        form.setValue('installments_count', null);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span>Receita</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="expense">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-rose-600" />
                          <span>Despesa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organização */}
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organização</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma organização" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Compra no supermercado"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoria */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Método de Pagamento */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Resetar campos de cartão se não for cartão de crédito
                        if (value !== 'Cartão de Crédito') {
                          form.setValue('card_last4', null);
                          form.setValue('modality', null);
                          form.setValue('installments_count', null);
                        }
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos condicionais para Cartão de Crédito */}
            {paymentMethod === 'Cartão de Crédito' && type === 'expense' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
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
                          defaultValue={field.value || undefined}
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

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={() => setSaveAndCreateAnother(false)}
                className="flex-1 bg-gradient-to-r from-[#4A56E2] to-[#00C6B8] hover:from-[#343D9B] hover:to-[#00A89C] text-white"
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
                type="submit"
                disabled={loading}
                onClick={() => setSaveAndCreateAnother(true)}
                variant="secondary"
                className="flex-1 text-white"
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

