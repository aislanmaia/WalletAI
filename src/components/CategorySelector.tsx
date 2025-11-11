import { cn } from '@/lib/utils';
import { SearchableSelect } from './SearchableSelect';

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  mostUsedCategories?: string[];
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

export function CategorySelector({
  value,
  onValueChange,
  options,
  disabled = false,
  mostUsedCategories = [],
}: CategorySelectorProps) {
  // Se não houver categorias mais usadas, usar as primeiras 5 como padrão
  const quickCategories = mostUsedCategories.length > 0
    ? mostUsedCategories.slice(0, 5)
    : options.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Chips de seleção rápida */}
      {quickCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((category) => {
            const emoji = categoryEmojis[category] || '📦';
            const isSelected = value === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onValueChange(category);
                }}
                disabled={disabled}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                  'border-2',
                  isSelected
                    ? 'bg-[#4A56E2] text-white border-[#4A56E2] shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <span className="text-base">{emoji}</span>
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Campo de busca completa */}
      <SearchableSelect
        value={value}
        onValueChange={onValueChange}
        options={options.map((opt) => ({
          value: opt,
          label: opt,
        }))}
        placeholder="Ou busque uma categoria..."
        disabled={disabled}
        searchPlaceholder="Digite para buscar..."
      />
    </div>
  );
}

