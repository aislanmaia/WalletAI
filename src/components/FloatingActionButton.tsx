import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-32 right-6 z-40',
        'h-12 px-4 rounded-full shadow-lg',
        'bg-gradient-to-r from-[#4A56E2] to-[#00C6B8]',
        'hover:from-[#343D9B] hover:to-[#00A89C]',
        'text-white font-medium',
        'flex items-center gap-2',
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'sm:right-8 lg:right-10 xl:right-12',
        'md:bottom-36',
        className
      )}
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">Nova transação</span>
    </Button>
  );
}

