import { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  onOpen?: () => void;
  allowCreate?: boolean;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Selecione uma opção',
  disabled = false,
  searchPlaceholder = 'Buscar...',
  onOpen,
  allowCreate = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Campo de input que parece um input normal */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            const willOpen = !isOpen;
            setIsOpen(willOpen);
            if (willOpen && onOpen) {
              // Pequeno delay para garantir que o dropdown esteja renderizado
              setTimeout(() => {
                onOpen();
              }, 100);
            }
          }
        }}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 py-2 text-left bg-background border border-input rounded-md',
          'flex items-center justify-between gap-2',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150'
        )}
      >
        <span className={cn('flex-1 truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {/* Lista expansível */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Campo de busca */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-8 pr-8 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de opções */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && !allowCreate ? (
              <div className="px-3 py-6 text-sm text-center text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            ) : (
              <ul className="p-1">
                {filteredOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onValueChange(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm rounded-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                        'transition-colors duration-150',
                        value === option.value && 'bg-accent text-accent-foreground font-medium'
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
                {/* Opção para criar novo quando allowCreate está ativo */}
                {allowCreate && searchQuery && !filteredOptions.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase()) && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onValueChange(searchQuery);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors duration-150 border-t border-border"
                    >
                      <span className="text-[#4A56E2]">+</span> Criar "{searchQuery}"
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

