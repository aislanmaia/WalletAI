import { useState } from 'react';
import { Plus, MapPin, User, FolderOpen, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { TagType } from './TagSelector';

interface AddDetailsButtonProps {
  onSelectTagType: (type: TagType) => void;
  disabled?: boolean;
}

const tagTypes: Array<{ type: TagType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
  { type: 'Local', label: 'Local', icon: MapPin, description: 'Onde a transação ocorreu' },
  { type: 'Pessoa', label: 'Pessoa', icon: User, description: 'Com quem ou para quem' },
  { type: 'Projeto', label: 'Projeto', icon: FolderOpen, description: 'Projeto relacionado' },
  { type: 'Nota', label: 'Nota', icon: StickyNote, description: 'Observação adicional' },
];

export function AddDetailsButton({
  onSelectTagType,
  disabled = false,
}: AddDetailsButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: TagType) => {
    onSelectTagType(type);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Plus className="h-4 w-4" />
          Adicionar Detalhes (Local, Pessoa...)
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          {tagTypes.map(({ type, label, icon: Icon, description }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Icon className="h-5 w-5 text-[#4A56E2] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}


