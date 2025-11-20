import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { CategorySelector } from './CategorySelector';

interface CategoryChipProps {
  value: string | null;
  onValueChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

// Emojis para categorias comuns
const categoryEmojis: Record<string, string> = {
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Moradia': '🏠',
  'Saúde': '🏥',
  'Educação': '📚',
  'Lazer': '🎮',
  'Compras': '🛍️',
  'Serviços': '🔧',
  'Outros': '📦',
};

export function CategoryChip({
  value,
  onValueChange,
  options,
  disabled = false,
}: CategoryChipProps) {
  const emoji = value ? (categoryEmojis[value] || '📦') : null;

  // Se não tem categoria selecionada, mostrar botão para adicionar
  if (!value) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
              'border-2 border-dashed border-gray-300 dark:border-gray-600',
              'hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span>+</span>
            <span>Definir Categoria</span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-white shadow-lg rounded-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
          align="start"
        >
          <div className="space-y-3">
            <div className="font-medium text-sm mb-2">Selecione uma categoria</div>
            <CategorySelector
              value=""
              onValueChange={onValueChange}
              options={options}
              disabled={disabled}
              mostUsedCategories={[]}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Se tem categoria, mostrar como chip com opção de remover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
            'bg-[#4A56E2] text-white border-2 border-[#4A56E2] shadow-md',
            'hover:bg-[#343D9B] hover:border-[#343D9B]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>{emoji}</span>
          <span>{value}</span>
          <X className="h-3 w-3 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="font-medium text-sm mb-2">Alterar categoria</div>
          <CategorySelector
            value={value}
            onValueChange={onValueChange}
            options={options}
            disabled={disabled}
            mostUsedCategories={[]}
          />
          <button
            type="button"
            onClick={() => onValueChange('')}
            disabled={disabled}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            Remover categoria
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

