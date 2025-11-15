import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './ui/button';

export type TagType = 'Local' | 'Pessoa' | 'Projeto' | 'Nota';

interface Tag {
  type: TagType;
  value: string;
}

interface TagSelectorProps {
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

// Placeholders por tipo
const tagTypePlaceholders: Record<TagType, string> = {
  Local: 'Adicionar ou buscar local...',
  Pessoa: 'Adicionar ou buscar pessoa...',
  Projeto: 'Adicionar ou buscar projeto...',
  Nota: 'Adicionar ou buscar nota...',
};

export function TagSelector({
  type,
  value,
  onValueChange,
  onRemove,
  suggestedTags = [],
  allTags = [],
  disabled = false,
}: TagSelectorProps) {
  const emoji = tagTypeEmojis[type];
  const placeholder = tagTypePlaceholders[type];

  // Se já tem valor, mostrar como chip
  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in-0 slide-in-from-top-2 duration-200">
        <span className="text-sm">{emoji}</span>
        <span className="text-sm font-medium flex-1">{value}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
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
        value={value || ''}
        onValueChange={(val) => onValueChange(val || null)}
        options={allTags.map((tag) => ({
          value: tag,
          label: tag,
        }))}
        placeholder={placeholder}
        disabled={disabled}
        searchPlaceholder="Digite para buscar ou criar..."
        allowCreate={true}
      />
    </div>
  );
}


