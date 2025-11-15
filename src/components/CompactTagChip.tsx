import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { SearchableSelect } from './SearchableSelect';
import { TagType } from './TagSelector';

interface CompactTagChipProps {
  type: TagType;
  value: string | null;
  onValueChange: (value: string | null) => void;
  onRemove: () => void;
  suggestedTags?: string[];
  allTags?: string[];
  disabled?: boolean;
}

// Emojis para tipos de tags
const tagTypeEmojis: Record<TagType, string> = {
  Local: '📍',
  Pessoa: '👤',
  Projeto: '📁',
  Nota: '📝',
};

// Labels para tipos de tags
const tagTypeLabels: Record<TagType, string> = {
  Local: 'Local',
  Pessoa: 'Pessoa',
  Projeto: 'Projeto',
  Nota: 'Nota',
};

export function CompactTagChip({
  type,
  value,
  onValueChange,
  onRemove,
  suggestedTags = [],
  allTags = [],
  disabled = false,
}: CompactTagChipProps) {
  const emoji = tagTypeEmojis[type];
  const label = tagTypeLabels[type];

  // Se não tem valor, mostrar chip vazio "Adicionar ⊕"
  if (!value) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
              'border border-gray-200 dark:border-gray-700',
              'hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span>{emoji}</span>
            <span>{label}:</span>
            <span className="text-[#4A56E2]">Adicionar</span>
            <Plus className="h-3 w-3 text-[#4A56E2]" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-3 bg-white shadow-lg rounded-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
          align="start"
        >
          <div className="space-y-3">
            {/* Chips de sugestão */}
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onValueChange(tag)}
                    disabled={disabled}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200',
                      'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                      'border border-gray-200 dark:border-gray-700',
                      'hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{tag}</span>
                    <span className="text-[#4A56E2]">⊕</span>
                  </button>
                ))}
              </div>
            )}

            {/* Campo de busca/adição */}
            <SearchableSelect
              value=""
              onValueChange={(val) => onValueChange(val || null)}
              options={allTags.map((tag) => ({
                value: tag,
                label: tag,
              }))}
              placeholder={`Buscar ou criar ${label.toLowerCase()}...`}
              disabled={disabled}
              searchPlaceholder="Digite para buscar ou criar..."
              allowCreate={true}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Se tem valor, mostrar chip com valor e opção de remover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200',
            'bg-[#4A56E2] text-white border border-[#4A56E2]',
            'hover:bg-[#343D9B] hover:border-[#343D9B]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>{emoji}</span>
          <span>{label}:</span>
          <span>{value}</span>
          <X className="h-3 w-3 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="font-medium text-sm mb-2">Alterar {label.toLowerCase()}</div>
          
          {/* Chips de sugestão */}
          {suggestedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onValueChange(tag)}
                  disabled={disabled}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200',
                    'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                    'border border-gray-200 dark:border-gray-700',
                    'hover:border-[#4A56E2] hover:bg-gray-50 dark:hover:bg-gray-700',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span>{emoji}</span>
                  <span>{tag}</span>
                  <span className="text-[#4A56E2]">⊕</span>
                </button>
              ))}
            </div>
          )}

          {/* Campo de busca/adição */}
          <SearchableSelect
            value={value}
            onValueChange={(val) => onValueChange(val || null)}
            options={allTags.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            placeholder={`Buscar ou criar ${label.toLowerCase()}...`}
            disabled={disabled}
            searchPlaceholder="Digite para buscar ou criar..."
            allowCreate={true}
          />
          
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            Remover {label.toLowerCase()}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

