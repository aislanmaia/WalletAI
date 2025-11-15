import { useState, useEffect } from 'react';
import { Plus, CreditCard as CreditCardIcon, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { CreditCard } from '@/types/api';
import { listCreditCards, createCreditCard } from '@/api/creditCards';
import { cn } from '@/lib/utils';

interface CardSelectorProps {
  organizationId: string;
  selectedCardId: number | null;
  onCardSelect: (cardId: number | null, card?: CreditCard) => void;
  disabled?: boolean;
  hideAddButton?: boolean;
}

// Bandeiras de cartão comuns
const cardBrands = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro'];

export function CardSelector({
  organizationId,
  selectedCardId,
  onCardSelect,
  disabled = false,
  hideAddButton = false,
}: CardSelectorProps) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    last4: '',
    brand: '',
    description: '',
  });

  // Carregar cartões ao montar
  useEffect(() => {
    if (organizationId && !showCreateForm) {
      loadCards();
    }
  }, [organizationId, showCreateForm]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await listCreditCards(organizationId);
      setCards(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!createFormData.last4 || !createFormData.brand) {
      return;
    }

    try {
      setCreating(true);
      const newCard = await createCreditCard({
        organization_id: organizationId,
        last4: createFormData.last4.replace(/\D/g, '').slice(0, 4),
        brand: createFormData.brand,
        due_day: 10, // Default, pode ser ajustado depois
        description: createFormData.description || null,
      });

      // Adicionar o novo cartão à lista
      setCards([...cards, newCard]);
      
      // Selecionar automaticamente o novo cartão
      onCardSelect(newCard.id, newCard);
      
      // Resetar formulário e voltar para a lista
      setCreateFormData({ last4: '', brand: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateFormData({ last4: '', brand: '', description: '' });
    setShowCreateForm(false);
  };

  // Se estiver mostrando o formulário de criação
  if (showCreateForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 p-5 space-y-4"
      >
        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Adicionar Novo Cartão</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Nome do Cartão</label>
            <Input
              type="text"
              placeholder="Nome do Cartão"
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              disabled={creating || disabled}
              className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Últimos 4 dígitos</label>
            <Input
              type="text"
              maxLength={4}
              placeholder="••••"
              value={createFormData.last4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setCreateFormData({ ...createFormData, last4: value });
              }}
              disabled={creating || disabled}
              className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Bandeira</label>
            <div className="flex flex-wrap gap-2">
              {cardBrands.slice(0, 6).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, brand })}
                  disabled={creating || disabled}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    createFormData.brand === brand
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleCreateCard}
              disabled={creating || disabled || !createFormData.last4 || !createFormData.brand}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {creating ? (
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
              variant="ghost"
              onClick={handleCancelCreate}
              disabled={creating || disabled}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Lista de cartões
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Card com lista de cartões - estilo inspirado no mockup */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            {cards.length > 0 ? (
              <div className="space-y-1">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onCardSelect(card.id, card)}
                    disabled={disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left',
                      'border-0',
                      selectedCardId === card.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                  {/* Ícone/Logo do cartão */}
                  <div className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                    selectedCardId === card.id
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}>
                    <CreditCardIcon className={cn(
                      'h-5 w-5',
                      selectedCardId === card.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                    )} />
                  </div>
                  
                  {/* Informações do cartão */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-semibold text-sm',
                      selectedCardId === card.id ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    )}>
                      {card.description || `Cartão ${card.brand}`}
                    </div>
                    <div className={cn(
                      'text-xs mt-0.5 font-medium',
                      selectedCardId === card.id ? 'text-blue-50' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {card.brand} •••• {card.last4}
                    </div>
                  </div>
                  
                  {/* Indicador de seleção */}
                  <div className="flex-shrink-0">
                    {selectedCardId === card.id ? (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 dark:border-blue-400" />
                    )}
                  </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum cartão cadastrado
                </p>
              </div>
            )}

            {/* Botão para adicionar novo cartão dentro do card */}
            {!hideAddButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(true)}
                disabled={disabled}
                className="w-full justify-start gap-2 mt-3 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Novo Cartão</span>
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

