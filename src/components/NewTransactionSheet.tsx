import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createTransaction } from '@/api/transactions';
import { getMyOrganizations } from '@/api/organizations';
import { listTags } from '@/api/tags';
import { CreateTransactionRequest } from '@/types/api';
import { handleApiError } from '@/api/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, TrendingUp, TrendingDown, Check, CreditCard, Wallet, Banknote, Building2, Receipt, Plus, Calendar, Tag, DollarSign, FileText, ShoppingBag, Clock, Search, MapPin, User, FolderOpen, StickyNote, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SearchableSelect } from '@/components/SearchableSelect';
import { CategorySelector } from '@/components/CategorySelector';
import { AddDetailsButton } from '@/components/AddDetailsButton';
import { TagSelector, TagType } from '@/components/TagSelector';
import { CardSelector } from '@/components/CardSelector';
import { CategoryChip } from '@/components/CategoryChip';
import { CompactTagChip } from '@/components/CompactTagChip';
import { DateTimeInput } from '@/components/DateTimeInput';

// Emojis e ícones para tipos de tags
const tagTypeConfig: Record<TagType, { emoji: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  Local: { emoji: '📍', icon: MapPin, label: 'Local' },
  Pessoa: { emoji: '👤', icon: User, label: 'Pessoa' },
  Projeto: { emoji: '📁', icon: FolderOpen, label: 'Projeto' },
  Nota: { emoji: '📝', icon: StickyNote, label: 'Nota' },
};

// Componente: Prompt de Classificação Unificado
function ClassificationPrompt({
  category,
  onCategoryChange,
  categories,
  tags,
  onTagAdd,
  onTagRemove,
  onTagValueChange,
  disabled,
}: {
  category: string | null;
  onCategoryChange: (value: string) => void;
  categories: string[];
  tags: Array<{ type: TagType; value: string }>;
  onTagAdd: (type: TagType, value: string) => void;
  onTagRemove: (type: TagType) => void;
  onTagValueChange: (type: TagType, value: string | null) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const searchQueryRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Sincronizar refs com states
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);
  
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Detectar padrão chave:valor
  const parseKeyValue = (query: string): { key: string; value: string } | null => {
    const match = query.match(/^(\w+):(.+)$/);
    if (match) {
      return { key: match[1].toLowerCase(), value: match[2].trim() };
    }
    return null;
  };

  // Verificar se a chave é um tipo válido (incluindo categoria)
  const isValidTagType = (key: string): TagType | 'category' | null => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === 'categoria' || normalizedKey === 'category') {
      return 'category';
    }
    const typeMap: Record<string, TagType> = {
      local: 'Local',
      pessoa: 'Pessoa',
      projeto: 'Projeto',
      nota: 'Nota',
    };
    return typeMap[normalizedKey] || null;
  };

  // Buscar tags existentes (mock - substituir por busca real)
  const searchTags = (query: string): Array<{ type: TagType; value: string }> => {
    // TODO: Implementar busca real de tags
    const mockTags: Array<{ type: TagType; value: string }> = [];
    return mockTags.filter(tag => 
      tag.value.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Obter tags mais usadas (mock - substituir por dados reais)
  const getMostUsedTags = (): Array<{ type: TagType; value: string }> => {
    // TODO: Implementar busca de tags mais usadas
    return [];
  };

  // Processar a busca
  const getSearchResults = () => {
    const kv = parseKeyValue(searchQuery);
    
    if (kv) {
      const tagType = isValidTagType(kv.key);
      if (!tagType) {
        return {
          type: 'error' as const,
          message: `Tipo "${kv.key}" não encontrado. Tipos permitidos: Categoria, ${Object.values(tagTypeConfig).map(t => t.label).join(', ')}`,
        };
      }

      // Se for categoria, tratar de forma especial
      if (tagType === 'category') {
        return {
          type: 'set_category' as const,
          value: kv.value,
        };
      }

      // Verificar se a tag já existe
      const existingTag = tags.find(t => t.type === tagType && t.value.toLowerCase() === kv.value.toLowerCase());
      if (existingTag) {
        return {
          type: 'assign' as const,
          tagType,
          value: kv.value,
          existing: true,
        };
      }

      return {
        type: 'create' as const,
        tagType,
        value: kv.value,
      };
    }

    // Busca normal
    if (searchQuery.trim()) {
      const results: Array<{ type: TagType | 'category'; value: string; category: string }> = [];
      
      // Buscar em categorias
      categories
        .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
        .forEach(cat => {
          results.push({ type: 'category' as const, value: cat, category: 'Categoria' });
        });

      // Buscar em tags
      const foundTags = searchTags(searchQuery);
      foundTags.forEach(tag => {
        results.push({ type: tag.type, value: tag.value, category: tagTypeConfig[tag.type].label });
      });

      // Se não encontrou resultados, oferecer criar nova tag
      if (results.length === 0) {
        return {
          type: 'create_new' as const,
          query: searchQuery.trim(),
        };
      }

      return {
        type: 'search' as const,
        results: results.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, Array<{ type: TagType | 'category'; value: string }>>),
      };
    }

    // Sugestões imediatas
    return {
      type: 'suggestions' as const,
      tags: getMostUsedTags(),
    };
  };

  const handleSelect = useCallback((result: any, item?: any) => {
    if (result.type === 'assign' || result.type === 'create') {
      onTagAdd(result.tagType, result.value);
      setSearchQuery('');
      setOpen(false);
    } else if (result.type === 'search' && item) {
      if (item.type === 'category') {
        onCategoryChange(item.value);
      } else {
        onTagAdd(item.type as TagType, item.value);
      }
      setSearchQuery('');
      setOpen(false);
    } else if (result.type === 'create_new') {
      // Este caso não deve ser usado diretamente - as opções são tratadas individualmente
      // Por padrão, não fazer nada aqui - deixar o usuário escolher
    }
  }, [onTagAdd, onCategoryChange]);

  // Resetar índice selecionado quando a busca muda ou quando o tipo de resultado muda
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);
  
  // Resetar índice quando o tipo de resultado muda para create_new
  useEffect(() => {
    const currentResults = getSearchResults();
    if (currentResults.type === 'create_new' || currentResults.type === 'search' || currentResults.type === 'suggestions') {
      setSelectedIndex(0);
    }
  }, [searchQuery, tags, categories]);

  // Navegação por teclado
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentResults = getSearchResults();
      const isInputFocused = e.target === inputRef.current;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          if (currentResults.type === 'search') {
            const allItems = Object.values(currentResults.results).flat();
            return Math.min(prev + 1, allItems.length - 1);
          }
          return prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        
        // Caso 1: Padrão chave:valor (assign ou create)
        if (currentResults.type === 'assign' || currentResults.type === 'create') {
          handleSelect(currentResults);
          return;
        }
        
        // Caso 2: Resultados de busca
        if (currentResults.type === 'search') {
          const allItems = Object.values(currentResults.results).flat();
          const itemToSelect = allItems[selectedIndex] || allItems[0];
          if (itemToSelect) {
            handleSelect(currentResults, itemToSelect);
          }
          return;
        }
        
        // Caso 3: Criar nova (quando não há resultados)
        // Este caso é tratado pelo popover com opções individuais
        // Não fazer nada aqui - deixar o usuário escolher
        if (currentResults.type === 'create_new') {
          // Não fazer nada - o popover mostra as opções
          return;
        }
        
        // Caso 4: Sugestões - selecionar primeira sugestão
        if (currentResults.type === 'suggestions' && currentResults.tags.length > 0) {
          const firstTag = currentResults.tags[0];
          onTagAdd(firstTag.type, firstTag.value);
          setSearchQuery('');
          setOpen(false);
          return;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };

    // Adicionar listener no input também
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [open, searchQuery, selectedIndex, tags, categories, handleSelect, onTagAdd]);

  const results = getSearchResults();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="+ Adicionar Categoria ou Tag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!open) setOpen(true);
            }}
            onKeyDown={(e) => {
              // Usar o valor atual do input para garantir que está sincronizado
              const currentQuery = (e.target as HTMLInputElement).value;
              
              if (e.key === 'Enter') {
                e.preventDefault();
                
                // Criar uma função temporária para obter resultados com o query atual
                const getCurrentResults = () => {
                  const kv = parseKeyValue(currentQuery);
                  
                  if (kv) {
                    const tagType = isValidTagType(kv.key);
                    if (!tagType) {
                      return {
                        type: 'error' as const,
                        message: `Tipo "${kv.key}" não encontrado. Tipos permitidos: Categoria, ${Object.values(tagTypeConfig).map(t => t.label).join(', ')}`,
                      };
                    }

                    // Se for categoria, tratar de forma especial
                    if (tagType === 'category') {
                      return {
                        type: 'set_category' as const,
                        value: kv.value,
                      };
                    }

                    const existingTag = tags.find(t => t.type === tagType && t.value.toLowerCase() === kv.value.toLowerCase());
                    if (existingTag) {
                      return {
                        type: 'assign' as const,
                        tagType,
                        value: kv.value,
                        existing: true,
                      };
                    }

                    return {
                      type: 'create' as const,
                      tagType,
                      value: kv.value,
                    };
                  }

                  if (currentQuery.trim()) {
                    const results: Array<{ type: TagType | 'category'; value: string; category: string }> = [];
                    
                    categories
                      .filter(cat => cat.toLowerCase().includes(currentQuery.toLowerCase()))
                      .forEach(cat => {
                        results.push({ type: 'category' as const, value: cat, category: 'Categoria' });
                      });

                    const foundTags = searchTags(currentQuery);
                    foundTags.forEach(tag => {
                      results.push({ type: tag.type, value: tag.value, category: tagTypeConfig[tag.type].label });
                    });

                    if (results.length === 0) {
                      return {
                        type: 'create_new' as const,
                        query: currentQuery.trim(),
                      };
                    }

                    return {
                      type: 'search' as const,
                      results: results.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, Array<{ type: TagType | 'category'; value: string }>>),
                    };
                  }

                  return {
                    type: 'suggestions' as const,
                    tags: getMostUsedTags(),
                  };
                };
                
                const currentResults = getCurrentResults();
                
                // Caso 1: Definir categoria
                if (currentResults.type === 'set_category') {
                  onCategoryChange(currentResults.value);
                  setSearchQuery('');
                  setOpen(false);
                  return;
                }
                
                // Caso 2: Padrão chave:valor (assign ou create)
                if (currentResults.type === 'assign' || currentResults.type === 'create') {
                  // Chamar diretamente para garantir que funciona
                  onTagAdd(currentResults.tagType, currentResults.value);
                  setSearchQuery('');
                  setOpen(false);
                  return;
                }
                
                // Caso 3: Resultados de busca
                if (currentResults.type === 'search') {
                  const allItems = Object.values(currentResults.results).flat();
                  const itemToSelect = allItems[selectedIndexRef.current] || allItems[0];
                  if (itemToSelect) {
                    handleSelect(currentResults, itemToSelect);
                  }
                  return;
                }
                
                // Caso 4: Criar nova (quando não há resultados)
                if (currentResults.type === 'create_new') {
                  // Total de opções: 1 categoria + 4 tipos de tag = 5 opções
                  const createNewOptions = [
                    { type: 'category' as const, value: currentResults.query },
                    ...Object.keys(tagTypeConfig).map(type => ({ 
                      type: type as TagType, 
                      value: currentResults.query 
                    }))
                  ];
                  
                  const selectedOption = createNewOptions[selectedIndexRef.current] || createNewOptions[0];
                  
                  if (selectedOption.type === 'category') {
                    onCategoryChange(selectedOption.value);
                  } else {
                    onTagAdd(selectedOption.type, selectedOption.value);
                  }
                  setSearchQuery('');
                  setOpen(false);
                  return;
                }
                
                // Caso 5: Sugestões - selecionar primeira sugestão
                if (currentResults.type === 'suggestions' && currentResults.tags.length > 0) {
                  const firstTag = currentResults.tags[0];
                  onTagAdd(firstTag.type, firstTag.value);
                  setSearchQuery('');
                  setOpen(false);
                  return;
                }
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const results = getSearchResults();
                if (results.type === 'search') {
                  const allItems = Object.values(results.results).flat();
                  setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
                } else if (results.type === 'create_new') {
                  // Total: 1 categoria + 4 tipos de tag = 5 opções (índices 0-4)
                  setSelectedIndex((prev) => Math.min(prev + 1, 4));
                } else if (results.type === 'suggestions') {
                  setSelectedIndex((prev) => Math.min(prev + 1, results.tags.length - 1));
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
              }
            }}
            disabled={disabled}
            className="w-full rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-2.5 pr-10 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-80 p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Não fechar se o clique foi no input ou dentro do popover
          const target = e.target as HTMLElement;
          if (inputRef.current?.contains(target) || popoverRef.current?.contains(target)) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Permitir fechar com ESC, mas não fechar o popover automaticamente
          // O handler de teclado já cuida disso
        }}
        onPointerDownOutside={(e) => {
          // Não fechar se o clique foi no input
          const target = e.target as HTMLElement;
          if (inputRef.current?.contains(target)) {
            e.preventDefault();
          }
        }}
      >
        <div className="max-h-[400px] overflow-y-auto">
          {results.type === 'error' && (
            <div className="p-4 text-sm text-red-600 dark:text-red-400">
              {results.message}
            </div>
          )}

          {results.type === 'set_category' && (
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  onCategoryChange(results.value);
                  setSearchQuery('');
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="text-sm font-medium">
                    Definir categoria como "{results.value}"
                  </span>
                </div>
              </button>
            </div>
          )}

          {results.type === 'assign' && (
            <div className="p-2">
              <button
                type="button"
                onClick={() => handleSelect(results)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Adicionar a tag "{results.value}" ao tipo "{tagTypeConfig[results.tagType].label}"
                  </span>
                </div>
              </button>
            </div>
          )}

          {results.type === 'create' && (
            <div className="p-2">
              <button
                type="button"
                onClick={() => handleSelect(results)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    Criar e adicionar a tag "{results.value}" ao tipo "{tagTypeConfig[results.tagType].label}"
                  </span>
                </div>
              </button>
            </div>
          )}

          {results.type === 'suggestions' && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Tags Mais Usadas
              </div>
              <div className="flex flex-wrap gap-2">
                {results.tags.length > 0 ? (
                  results.tags.map((tag, idx) => {
                    const config = tagTypeConfig[tag.type];
                    return (
                      <button
                        key={`${tag.type}-${tag.value}-${idx}`}
                        type="button"
                        onClick={() => {
                          onTagAdd(tag.type, tag.value);
                          setSearchQuery('');
                          setOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span>{config.emoji}</span>
                        <span>{tag.value}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    Nenhuma tag usada recentemente
                  </div>
                )}
              </div>
            </div>
          )}

          {results.type === 'search' && (
            <div className="p-3 space-y-3">
              {Object.entries(results.results).map(([category, items]) => {
                const categoryStartIndex = Object.entries(results.results)
                  .slice(0, Object.keys(results.results).indexOf(category))
                  .reduce((acc, [, items]) => acc + items.length, 0);
                
                return (
                  <div key={category}>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((item, idx) => {
                        const globalIndex = categoryStartIndex + idx;
                        const isSelected = selectedIndex === globalIndex;
                        const isCategory = item.type === 'category';
                        const config = isCategory
                          ? { emoji: '🏷️', label: 'Categoria' }
                          : tagTypeConfig[item.type as TagType];
                        
                        return (
                          <button
                            key={`${item.type}-${item.value}-${idx}`}
                            type="button"
                            onClick={() => {
                              if (isCategory) {
                                onCategoryChange(item.value);
                              } else {
                                onTagAdd(item.type as TagType, item.value);
                              }
                              setSearchQuery('');
                              setOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2",
                              isSelected && "bg-gray-100 dark:bg-gray-800"
                            )}
                          >
                            <span>{config.emoji}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {results.type === 'create_new' && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Criar Nova
              </div>
              <div className="space-y-2">
                {/* Opção para criar como categoria (índice 0) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCategoryChange(results.query);
                    setSearchQuery('');
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                    selectedIndex === 0 
                      ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <span>🏷️</span>
                  <span className="text-sm font-medium">
                    Criar "{results.query}" como Categoria
                  </span>
                </button>
                {/* Opções para criar como tags (índices 1-4) */}
                {Object.entries(tagTypeConfig).map(([type, config], idx) => {
                  const tagType = type as TagType;
                  const optionIndex = idx + 1; // +1 porque categoria é índice 0
                  const isSelected = selectedIndex === optionIndex;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onTagAdd(tagType, results.query);
                        setSearchQuery('');
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                        isSelected
                          ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <span>{config.emoji}</span>
                      <span className="text-sm font-medium">
                        Criar "{results.query}" como {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente para área de gerenciamento de cartão (Cena 1)
function CardManagementArea({
  organizationId,
  selectedCardId,
  onCardSelect,
  onShowCreateForm,
  form,
  loading,
}: {
  organizationId: string;
  selectedCardId: number | null;
  onCardSelect: (cardId: number | null, card?: { last4: string }) => void;
  onShowCreateForm: () => void;
  form: ReturnType<typeof useForm<TransactionFormValues>>;
  loading: boolean;
}) {
  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
      <CardSelector
        organizationId={organizationId}
        selectedCardId={selectedCardId}
        onCardSelect={onCardSelect}
        disabled={loading}
        hideAddButton={true}
      />
      <Button
        type="button"
        variant="outline"
        onClick={onShowCreateForm}
        disabled={loading}
        className="w-full justify-start gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Plus className="h-4 w-4 text-blue-500" />
        <span className="text-blue-600 dark:text-blue-400">Adicionar Novo Cartão</span>
      </Button>

      {/* Modalidade - só aparece após cartão selecionado */}
      <AnimatePresence>
        {selectedCardId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <FormField
              control={form.control}
              name="modality"
              render={({ field }) => (
                <FormItem>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Modalidade</h4>
                    
                    <ToggleGroup
                      type="single"
                      value={field.value || ''}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                          if (value !== 'installment') {
                            form.setValue('installments_count', null);
                          }
                        }
                      }}
                      disabled={loading}
                      className="flex gap-2"
                    >
                      <ToggleGroupItem
                        value="cash"
                        aria-label="À Vista"
                        className={cn(
                          'flex-1 h-10 rounded-lg font-medium text-sm transition-all duration-200',
                          'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-blue-500 data-[state=on]:text-white data-[state=on]:shadow-md',
                          'data-[state=off]:bg-gray-100 dark:data-[state=off]:bg-gray-700 data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300',
                          'data-[state=off]:hover:bg-gray-200 dark:data-[state=off]:hover:bg-gray-600'
                        )}
                      >
                        À Vista
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="installment"
                        aria-label="Parcelado"
                        className={cn(
                          'flex-1 h-10 rounded-lg font-medium text-sm transition-all duration-200',
                          'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-blue-500 data-[state=on]:text-white data-[state=on]:shadow-md',
                          'data-[state=off]:bg-gray-100 dark:data-[state=off]:bg-gray-700 data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300',
                          'data-[state=off]:hover:bg-gray-200 dark:data-[state=off]:hover:bg-gray-600'
                        )}
                      >
                        Parcelado
                      </ToggleGroupItem>
                    </ToggleGroup>

                    {/* Campo de parcelas - aparece quando Parcelado está selecionado */}
                    <AnimatePresence>
                      {field.value === 'installment' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <InstallmentsField form={form} loading={loading} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente para formulário de criação de cartão (Cena 2)
function CardCreateForm({
  organizationId,
  onCardCreated,
  onCancel,
  disabled,
}: {
  organizationId: string;
  onCardCreated: (cardId: number, last4?: string) => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    last4: '',
    brand: '',
    description: '',
  });

  const cardBrands = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro'];

  const handleCreate = async () => {
    if (!formData.last4 || !formData.brand) return;

    try {
      setCreating(true);
      const { createCreditCard } = await import('@/api/creditCards');
      const last4 = formData.last4.replace(/\D/g, '').slice(0, 4);
      const newCard = await createCreditCard({
        organization_id: organizationId,
        last4: last4,
        brand: formData.brand,
        due_day: 10,
        description: formData.description || null,
      });
      onCardCreated(newCard.id, newCard.last4);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 p-5 space-y-4 h-full overflow-y-auto"
    >
      <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Adicionar Novo Cartão</h4>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Nome do Cartão</label>
          <Input
            type="text"
            placeholder="Nome do Cartão"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            value={formData.last4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setFormData({ ...formData, last4: value });
            }}
            disabled={creating || disabled}
            className="border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Bandeira</label>
          <div className="flex flex-wrap gap-2">
            {cardBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setFormData({ ...formData, brand })}
                disabled={creating || disabled}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  formData.brand === brand
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
            onClick={handleCreate}
            disabled={creating || disabled || !formData.last4 || !formData.brand}
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
            onClick={onCancel}
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

// Componente separado para o campo de parcelas com legenda dinâmica
function InstallmentsField({ form, loading }: { form: ReturnType<typeof useForm<TransactionFormValues>>; loading: boolean }) {
  const transactionValue = useWatch({ control: form.control, name: 'value' }) || 0;
  const installmentsCount = useWatch({ control: form.control, name: 'installments_count' });
  const modality = useWatch({ control: form.control, name: 'modality' });
  const installmentsInputRef = useRef<HTMLInputElement>(null);
  const numInstallments = installmentsCount ? Number(installmentsCount) : 0;
  const installmentValue = numInstallments > 0 && transactionValue > 0
    ? transactionValue / numInstallments
    : 0;
  const showLegend = numInstallments > 0 && transactionValue > 0;

  // Focar o input quando a modalidade mudar para 'installment'
  useEffect(() => {
    if (modality === 'installment') {
      // Aguardar a animação do campo aparecer e garantir que o DOM está pronto
      const timeoutId = setTimeout(() => {
        if (installmentsInputRef.current) {
          // Verificar se o elemento está visível
          const rect = installmentsInputRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            installmentsInputRef.current.focus();
            installmentsInputRef.current.select();
          }
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [modality]);


  return (
    <FormField
      control={form.control}
      name="installments_count"
      render={({ field: installmentsField }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantidade de Parcelas
          </FormLabel>
          <div className="flex items-center gap-2 flex-wrap">
            <FormControl>
              <input
                ref={(e) => {
                  installmentsField.ref(e);
                  // Atribuir ao ref manualmente usando type assertion
                  if (e) {
                    (installmentsInputRef as any).current = e;
                  } else {
                    (installmentsInputRef as any).current = null;
                  }
                }}
                type="text"
                inputMode="numeric"
                placeholder="Ex: 10"
                name={installmentsField.name}
                onBlur={installmentsField.onBlur}
                onChange={(e) => {
                  // Permite apenas números
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '') {
                    installmentsField.onChange(null);
                  } else {
                    const numValue = parseInt(value);
                    // Mínimo de 2 parcelas, sem limite máximo
                    if (numValue >= 2) {
                      installmentsField.onChange(numValue);
                    } else if (numValue > 0) {
                      // Permite digitar 1, mas não aceita até ter pelo menos 2
                      installmentsField.onChange(numValue);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Permite apenas números, backspace, delete, arrow keys, tab
                  if (!/[\d\b\Delete\ArrowLeft\ArrowRight\Tab]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                value={installmentsField.value || ''}
                disabled={loading}
                className="flex w-14 rounded-lg bg-gray-50 dark:bg-gray-900 px-2 py-2.5 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-center shrink-0"
              />
            </FormControl>
            {showLegend && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-0 flex-shrink">
                <span className="truncate block">parcelas de R$ {installmentValue.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

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
  { value: 'Cartão de Débito', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'Boleto', label: 'Boleto', icon: Receipt },
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
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [valueDisplay, setValueDisplay] = useState<string>('');
  const valueInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para tags e cartão
  const [tags, setTags] = useState<Array<{ type: TagType; value: string }>>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showCardCreateForm, setShowCardCreateForm] = useState(false);
  
  // Estados para categorias do backend
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      organization_id: '',
      type: 'expense',
      description: '',
      category: '',
      value: 0,
      payment_method: '',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      card_last4: null,
      modality: null,
      installments_count: null,
    },
  });

  const paymentMethod = form.watch('payment_method');
  const type = form.watch('type');
  const currentOrganizationId = form.watch('organization_id');

  // Filtrar métodos de pagamento baseado no tipo de transação
  const paymentMethods = type === 'income'
    ? ['PIX', 'Dinheiro', 'Transferência Bancária']
    : allPaymentMethods;
  
  // Buscar categorias quando a organização for selecionada
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentOrganizationId) {
        setAvailableCategories([]);
        return;
      }
      
      try {
        setLoadingCategories(true);
        const response = await listTags(currentOrganizationId, 'categoria');
        // Pegar apenas os nomes das tags e limitar a 5
        const categoryNames = response.tags
          .filter((tag: { is_active: boolean }) => tag.is_active)
          .map((tag: { name: string }) => tag.name)
          .slice(0, 5);
        setAvailableCategories(categoryNames);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setAvailableCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [currentOrganizationId]);

  // Focar no campo valor quando abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        valueInputRef.current?.focus();
      }, 350); // Aguardar animação do sheet
    }
  }, [open]);


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
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        card_last4: null,
        modality: null,
        installments_count: null,
      });
      setError(null);
      setSaveAndCreateAnother(false);
      setShowSuccess(false);
      setValueDisplay('');
      setTags([]);
      setSelectedCardId(null);
      setShowCardCreateForm(false);
      setShowConfirmationDialog(false);
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

  const onSubmit = useCallback(async (values: TransactionFormValues) => {
    try {
      setLoading(true);
      setError(null);
      setShowConfirmationDialog(false);

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
      const errorMessage = handleApiError(err);
      setError(typeof errorMessage === 'string' ? errorMessage : String(errorMessage));
      setLoading(false);
    }
  }, []);

  // Função para confirmar transação (usada no botão e no Enter)
  const handleConfirm = useCallback(() => {
    setSaveAndCreateAnother(false);
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  // Capturar eventos de teclado quando o modal de confirmação estiver aberto
  useEffect(() => {
    if (!showConfirmationDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!loading) {
          handleConfirm();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowConfirmationDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConfirmationDialog, loading, handleConfirm]);

  // Função para gerar texto dinâmico do botão de salvar
  const getSaveButtonText = () => {
    const type = form.watch('type');
    const value = form.watch('value');
    const typeLabel = type === 'expense' ? 'Despesa' : 'Receita';
    const valueFormatted = value > 0 ? value.toFixed(2).replace('.', ',') : '0,00';
    return `Salvar ${typeLabel} de R$ ${valueFormatted}`;
  };

  // Função para lidar com o clique no botão de salvar (abre modal de confirmação)
  const handleSaveClick = () => {
    // Validar formulário antes de abrir o modal
    form.trigger().then((isValid) => {
      if (isValid) {
        setShowConfirmationDialog(true);
      }
    });
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setValueDisplay('');
    setTags([]);
    setSelectedCardId(null);
    setShowCardCreateForm(false);
    form.reset({
      organization_id: form.getValues('organization_id'),
      type: form.getValues('type'),
      description: '',
      category: '',
      value: 0,
      payment_method: '',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      card_last4: null,
      modality: null,
      installments_count: null,
    });
    setTimeout(() => {
      valueInputRef.current?.focus();
    }, 100);
  };

  // Funções para gerenciar tags
  const handleAddTag = (tagType: TagType, value?: string) => {
    // Verificar se já existe uma tag deste tipo
    const existingTagIndex = tags.findIndex(t => t.type === tagType);
    if (existingTagIndex === -1) {
      setTags([...tags, { type: tagType, value: value || '' }]);
    } else if (value) {
      // Se já existe e foi passado um valor, atualizar
      setTags(tags.map(t => t.type === tagType ? { ...t, value } : t));
    }
  };

  const handleTagValueChange = (tagType: TagType, value: string | null) => {
    setTags(tags.map(t => t.type === tagType ? { ...t, value: value || '' } : t));
  };

  const handleRemoveTag = (tagType: TagType) => {
    setTags(tags.filter(t => t.type !== tagType));
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const showCardManagement = paymentMethod === 'Cartão de Crédito' && type === 'expense';
  const organizationId = form.watch('organization_id');
  
  // Função para gerar resumo da transação para o modal de confirmação
  const getTransactionSummary = () => {
    const values = form.getValues();
    const typeLabel = values.type === 'expense' ? 'Despesa' : 'Receita';
    const valueFormatted = values.value > 0 ? values.value.toFixed(2).replace('.', ',') : '0,00';
    const dateFormatted = values.date ? format(new Date(values.date), "dd/MM/yyyy 'às' HH:mm") : 'Não informado';
    
    return {
      type: typeLabel,
      value: valueFormatted,
      description: values.description || 'Não informado',
      category: values.category || 'Não informado',
      paymentMethod: values.payment_method || 'Não informado',
      date: dateFormatted,
      modality: values.modality === 'cash' ? 'À Vista' : values.modality === 'installment' ? 'Parcelado' : null,
      installments: values.installments_count || null,
      tags: tags.filter(t => t.value).map(t => `${t.type}: ${t.value}`),
    };
  };

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
          className="!w-[1000px] !max-w-[1000px] overflow-hidden p-8 [&>button]:hidden z-50 [&_div[data-radix-dialog-overlay]]:bg-black/40 bg-white dark:bg-gray-950"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full relative"
          >
            <div className="flex flex-col h-full">
              {/* Estado de Sucesso */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm flex items-center justify-center rounded-l-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center space-y-6 px-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                      >
                        <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Transação salva com sucesso!</h3>
                        <p className="text-muted-foreground">Sua transação foi registrada.</p>
                      </div>
                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          type="button"
                          onClick={handleCreateAnother}
                          variant="primary"
                          className="w-full"
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
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="shrink-0 mb-6">
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold">
                        Nova Transação
                      </SheetTitle>
                    </SheetHeader>
                    
                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{typeof error === 'string' ? error : String(error)}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Layout de Duas Colunas com CSS Grid - 50/50 */}
                  <div className="flex-1 grid grid-cols-2 gap-8 min-h-0 overflow-hidden pr-1">
                    {/* Coluna Esquerda: O Palco (Fluxo Principal) */}
                    <div className="flex flex-col min-h-0 overflow-hidden">
                      <div className="flex-1 space-y-3 min-h-0 pr-1 overflow-y-auto pl-2">

                        {/* Tipo de Transação - ToggleGroup */}
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                                Tipo
                              </FormLabel>
                              <FormControl>
                                <ToggleGroup
                                  type="single"
                                  value={field.value}
                                  onValueChange={(value) => {
                                    if (value) {
                                      field.onChange(value as 'income' | 'expense');
                                      const validForBothTypes = ['PIX', 'Dinheiro', 'Transferência Bancária'];
                                      const currentMethod = form.getValues('payment_method');
                                      if (currentMethod && !validForBothTypes.includes(currentMethod)) {
                                        form.setValue('payment_method', '');
                                        form.setValue('card_last4', null);
                                        form.setValue('modality', null);
                                        form.setValue('installments_count', null);
                                        setSelectedCardId(null);
                                      }
                                    }
                                  }}
                                  className="w-full"
                                >
                                  <ToggleGroupItem
                                    value="expense"
                                    aria-label="Despesa"
                                    className={cn(
                                      'flex-1 h-12 rounded-lg font-semibold text-sm',
                                      'data-[state=on]:bg-rose-500 data-[state=on]:text-white',
                                      'data-[state=off]:bg-transparent data-[state=off]:text-rose-500 data-[state=off]:border-2 data-[state=off]:border-rose-200'
                                    )}
                                  >
                                    <TrendingDown className="h-4 w-4" />
                                    Despesa
                                  </ToggleGroupItem>
                                  <ToggleGroupItem
                                    value="income"
                                    aria-label="Receita"
                                    className={cn(
                                      'flex-1 h-12 rounded-lg font-semibold text-sm',
                                      'data-[state=on]:bg-emerald-500 data-[state=on]:text-white',
                                      'data-[state=off]:bg-transparent data-[state=off]:text-emerald-500 data-[state=off]:border-2 data-[state=off]:border-emerald-200'
                                    )}
                                  >
                                    <TrendingUp className="h-4 w-4" />
                                    Receita
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Valor - Campo Herói */}
                        <FormField
                          control={form.control}
                          name="value"
                          render={({ field }) => {
                            // Observar valores para calcular legenda de parcelas
                            const paymentMethod = useWatch({ control: form.control, name: 'payment_method' });
                            const modality = useWatch({ control: form.control, name: 'modality' });
                            const installmentsCount = useWatch({ control: form.control, name: 'installments_count' });
                            const transactionValue = field.value || 0;
                            
                            // Calcular se deve mostrar a legenda
                            const showInstallmentLegend = 
                              paymentMethod === 'Cartão de Crédito' && 
                              modality === 'installment' && 
                              installmentsCount && 
                              installmentsCount > 0 && 
                              transactionValue > 0;
                            
                            const installmentValue = showInstallmentLegend 
                              ? transactionValue / installmentsCount 
                              : 0;
                            
                            return (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                                  Valor (R$)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <input
                                      ref={valueInputRef}
                                      type="text"
                                      inputMode="decimal"
                                      placeholder="0,00"
                                      className={cn(
                                        "flex w-full rounded-lg bg-gray-50 dark:bg-gray-900 text-3xl font-bold text-right border-0 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-4 pl-14",
                                        showInstallmentLegend ? "pb-8 pt-3" : "py-3"
                                      )}
                                      style={{ fontSize: '2rem', lineHeight: '1.2' }}
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
                                    <span 
                                      className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground pointer-events-none font-bold"
                                      style={{ fontSize: '2rem', lineHeight: '1.2' }}
                                    >
                                      R$
                                    </span>
                                    
                                    {/* Legenda de parcelas dentro do input, abaixo do valor */}
                                    {showInstallmentLegend && (
                                      <span 
                                        className="absolute right-4 bottom-2 text-xs font-medium text-gray-500 dark:text-gray-500 pointer-events-none"
                                      >
                                        em {installmentsCount}x de R$ {installmentValue.toFixed(2).replace('.', ',')}
                                      </span>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
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
                              <FormLabel className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                                O que foi?
                              </FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  placeholder="Ex: Almoço no restaurante"
                                  {...field}
                                  disabled={loading}
                                  className="flex w-full rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3 text-base border-0 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  onBlur={field.onBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Seção de Pagamento */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                            Pagamento
                          </h3>

                          <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <ToggleGroup
                                    type="single"
                                    value={field.value}
                                    onValueChange={(value) => {
                                      if (value) {
                                        field.onChange(value);
                                        if (value !== 'Cartão de Crédito') {
                                          form.setValue('card_last4', null);
                                          form.setValue('modality', null);
                                          form.setValue('installments_count', null);
                                          setSelectedCardId(null);
                                        }
                                      }
                                    }}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {commonPaymentMethods
                                      .filter(method => {
                                        // Para Receita, mostrar apenas PIX, Dinheiro e Transferência Bancária
                                        if (type === 'income') {
                                          return ['PIX', 'Dinheiro', 'Transferência Bancária'].includes(method.value);
                                        }
                                        // Para Despesa, mostrar todos os métodos exceto Transferência Bancária (que só aparece para Receita)
                                        return method.value !== 'Transferência Bancária';
                                      })
                                      .map((method) => {
                                        const Icon = method.icon;
                                        return (
                                          <ToggleGroupItem
                                            key={method.value}
                                            value={method.value}
                                            aria-label={method.label}
                                            disabled={loading}
                                            className={cn(
                                              'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200',
                                              'shadow-sm',
                                              // Estado ativo - gradientes vibrantes por método
                                              method.value === 'PIX' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-purple-500/30',
                                              method.value === 'Dinheiro' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-emerald-500/30',
                                              method.value === 'Cartão de Crédito' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-cyan-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-blue-500/30',
                                              method.value === 'Cartão de Débito' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-indigo-500 data-[state=on]:to-purple-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-indigo-500/30',
                                              method.value === 'Boleto' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-orange-500 data-[state=on]:to-red-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-orange-500/30',
                                              method.value === 'Transferência Bancária' && 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-slate-500 data-[state=on]:to-gray-500 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-slate-500/30',
                                              // Estado inativo - fundo branco com borda sutil
                                              'data-[state=off]:bg-white dark:data-[state=off]:bg-gray-800',
                                              'data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300',
                                              'data-[state=off]:border data-[state=off]:border-gray-200 dark:data-[state=off]:border-gray-700',
                                              'data-[state=off]:hover:border-purple-300 dark:data-[state=off]:hover:border-purple-600',
                                              'data-[state=off]:hover:bg-gray-50 dark:data-[state=off]:hover:bg-gray-700',
                                              'data-[state=off]:hover:shadow-md'
                                            )}
                                          >
                                            <Icon className="h-4 w-4" />
                                            {method.label}
                                          </ToggleGroupItem>
                                        );
                                      })}
                                  </ToggleGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                                Data e Hora
                              </FormLabel>
                              <FormControl>
                                <DateTimeInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Rodapé Fixo da Coluna Esquerda */}
                      <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={handleSaveClick}
                            disabled={loading}
                            variant="primary"
                            className="w-full h-11"
                          >
                            {getSaveButtonText()}
                          </Button>
                          <Button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              form.trigger().then((isValid) => {
                                if (isValid) {
                                  setSaveAndCreateAnother(true);
                                  setShowConfirmationDialog(true);
                                }
                              });
                            }}
                            variant="secondary"
                            className="w-full h-11"
                          >
                            Salvar e criar outra
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="w-full h-10"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Coluna Direita: Os Bastidores (50% do espaço) */}
                    <div className="flex flex-col min-h-0">
                      {/* Zona 1: Área de Classificação "Viva" (Com Layout Inteligente e Scroll Contido) */}
                      <div className="shrink-0 space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700 max-h-[280px] overflow-y-auto pr-2">
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                          Classificação
                        </h3>

                        {/* Categorias Sugeridas - Chips clicáveis */}
                        {currentOrganizationId && (
                          <div className="space-y-2">
                            {loadingCategories ? (
                              <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div
                                    key={i}
                                    className="h-7 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
                                  />
                                ))}
                              </div>
                            ) : availableCategories.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {availableCategories.map((categoryName) => (
                                  <button
                                    key={categoryName}
                                    type="button"
                                    onClick={() => {
                                      form.setValue('category', categoryName);
                                    }}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors",
                                      form.watch('category') === categoryName
                                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                  >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    {categoryName}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Prompt de Classificação Unificado */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ClassificationPrompt
                                  category={field.value || null}
                                  onCategoryChange={field.onChange}
                                  categories={categories}
                                  tags={tags}
                                  onTagAdd={handleAddTag}
                                  onTagRemove={handleRemoveTag}
                                  onTagValueChange={handleTagValueChange}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Área de Tags Adicionadas - Chips com flex-wrap */}
                        <div className="space-y-2">
                          {/* Categoria selecionada */}
                          {form.watch('category') && (
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {form.watch('category')}
                              </span>
                            </div>
                          )}

                          {/* Tags adicionadas */}
                          {tags.filter(t => t.value).length > 0 && (
                            <motion.div
                              className="flex flex-wrap gap-2"
                              variants={{
                                hidden: { opacity: 0 },
                                show: {
                                  opacity: 1,
                                  transition: {
                                    staggerChildren: 0.1,
                                  },
                                },
                              }}
                              initial="hidden"
                              animate="show"
                            >
                              {tags.filter(t => t.value).map((tag) => {
                                const config = tagTypeConfig[tag.type];
                                return (
                                  <motion.div
                                    key={tag.type}
                                    variants={{
                                      hidden: { opacity: 0, scale: 0.8 },
                                      show: { opacity: 1, scale: 1 },
                                    }}
                                  >
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-700">
                                      <span>{config.emoji}</span>
                                      <span>{tag.value}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag.type)}
                                        disabled={loading}
                                        className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Zona 2: Área de Conteúdo Dinâmico (Base - "O Slot de Ferramentas") */}
                      <div className="flex-1 min-h-0 overflow-hidden mt-4">
                        <AnimatePresence mode="wait">
                          {showCardManagement && !showCardCreateForm && organizationId && (
                            <motion.div
                              key="card-management"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="h-full flex flex-col"
                            >
                              {/* Header Informativo */}
                              <div className="shrink-0 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase mb-1">
                                  Cartão de Crédito
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  Selecione um cartão ou adicione um novo para configurar a modalidade de pagamento
                                </p>
                              </div>
                              
                              {/* Cena 1: Gerenciamento de Cartão */}
                              <div className="flex-1 min-h-0 overflow-hidden">
                                <CardManagementArea
                                organizationId={organizationId}
                                selectedCardId={selectedCardId}
                                onCardSelect={(cardId, card) => {
                                  setSelectedCardId(cardId);
                                  // Preencher card_last4 quando um cartão é selecionado
                                  if (card && card.last4) {
                                    form.setValue('card_last4', card.last4);
                                  } else if (!cardId) {
                                    form.setValue('card_last4', null);
                                  }
                                }}
                                onShowCreateForm={() => setShowCardCreateForm(true)}
                                form={form}
                                loading={loading}
                              />
                              </div>
                            </motion.div>
                          )}
                          {showCardManagement && showCardCreateForm && organizationId && (
                            <motion.div
                              key="card-create"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="h-full"
                            >
                              {/* Cena 2: Formulário de Novo Cartão */}
                              <CardCreateForm
                                organizationId={organizationId}
                                onCardCreated={(cardId, last4) => {
                                  setSelectedCardId(cardId);
                                  // Preencher card_last4 quando um novo cartão é criado
                                  if (last4) {
                                    form.setValue('card_last4', last4);
                                  }
                                  setShowCardCreateForm(false);
                                }}
                                onCancel={() => setShowCardCreateForm(false)}
                                disabled={loading}
                              />
                            </motion.div>
                          )}
                          {!showCardManagement && (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="h-full flex items-top justify-center text-sm text-gray-400 dark:text-gray-500"
                            >
                              <p>Selecione um método de pagamento para ver opções adicionais</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </div>

            {/* Modal de Confirmação com Overlay sobre o painel */}
            <AnimatePresence>
              {showConfirmationDialog && (
                <>
                  {/* Overlay sobre o painel */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md rounded-l-2xl"
                    onClick={() => setShowConfirmationDialog(false)}
                  />
                  
                  {/* Modal centralizado dentro do Drawer */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none"
                  >
                <div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 max-w-[500px] w-full pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Por favor, confirme sua transação
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Revise os dados abaixo antes de confirmar
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {(() => {
                        const summary = getTransactionSummary();
                        const isIncome = form.getValues('type') === 'income';
                        return (
                          <>
                            {/* Tipo e Valor - Destaque Principal */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-1">
                                  {isIncome ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                  )}
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipo</span>
                                </div>
                                <p className={cn(
                                  "text-base font-bold",
                                  isIncome 
                                    ? "text-emerald-600 dark:text-emerald-400" 
                                    : "text-rose-600 dark:text-rose-400"
                                )}>
                                  {summary.type}
                                </p>
                              </div>
                              
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor</span>
                                </div>
                                <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                                  R$ {summary.value}
                                </p>
                              </div>
                            </div>

                            {/* Descrição */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descrição</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {summary.description}
                              </p>
                            </div>

                            {/* Categoria e Método de Pagamento */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Categoria</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {summary.category}
                                </p>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pagamento</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {summary.paymentMethod}
                                </p>
                              </div>
                            </div>

                            {/* Data e Hora */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data e Hora</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {summary.date}
                              </p>
                            </div>

                            {/* Modalidade e Parcelas (se aplicável) */}
                            {(summary.modality || summary.installments) && (
                              <div className="grid grid-cols-2 gap-3">
                                {summary.modality && (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modalidade</span>
                                    </div>
                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                      {summary.modality}
                                    </p>
                                  </div>
                                )}
                                {summary.installments && (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Parcelas</span>
                                    </div>
                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                      {summary.installments}x
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tags (se houver) */}
                            {summary.tags.length > 0 && (
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {summary.tags.map((tag, idx) => (
                                    <span 
                                      key={idx} 
                                      className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium border border-purple-200 dark:border-purple-800"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowConfirmationDialog(false)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        Editar Dados
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Confirmar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
          </motion.div>
        </SheetContent>
    </Sheet>
  );
}

