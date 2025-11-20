import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, parse, isValid, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DateTimeInputProps {
  value: string; // formato: 'yyyy-MM-dd' ou 'yyyy-MM-ddTHH:mm'
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimeInput({
  value,
  onChange,
  disabled = false,
  className,
}: DateTimeInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState({ hours: '', minutes: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  // Converter valor ISO para Date
  const parseISOValue = (isoValue: string): Date | null => {
    if (!isoValue) return null;
    
    try {
      let date: Date;
      if (isoValue.includes('T')) {
        date = parse(isoValue, "yyyy-MM-dd'T'HH:mm", new Date());
      } else {
        date = parse(isoValue, 'yyyy-MM-dd', new Date());
      }
      
      if (!isValid(date)) return null;
      return date;
    } catch {
      return null;
    }
  };

  // Converter valor ISO para formato de exibição brasileiro
  const formatForDisplay = (isoValue: string): string => {
    const date = parseISOValue(isoValue);
    if (!date) return '';
    
    // Formato: "14/07/2025 10:30"
    return format(date, "dd/MM/yyyy HH:mm");
  };

  // Inicializar valores
  useEffect(() => {
    const date = parseISOValue(value);
    if (date) {
      setSelectedDate(date);
      setTimeValue({
        hours: format(date, 'HH'),
        minutes: format(date, 'mm'),
      });
    } else {
      const now = new Date();
      setSelectedDate(now);
      setTimeValue({
        hours: format(now, 'HH'),
        minutes: format(now, 'mm'),
      });
    }
  }, []);

  // Atualizar display quando valor muda (externamente)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value));
      const date = parseISOValue(value);
      if (date) {
        setSelectedDate(date);
        setTimeValue({
          hours: format(date, 'HH'),
          minutes: format(date, 'mm'),
        });
      }
    }
  }, [value, isFocused]);

  // Aplicar máscara automática durante digitação
  const applyMask = (input: string): string => {
    // Remove tudo exceto números
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    let masked = '';
    
    // Dia (2 dígitos)
    if (numbers.length > 0) {
      masked += numbers.substring(0, 2);
      if (numbers.length > 2) masked += '/';
    }
    
    // Mês (2 dígitos)
    if (numbers.length > 2) {
      masked += numbers.substring(2, 4);
      if (numbers.length > 4) masked += '/';
    }
    
    // Ano (4 dígitos)
    if (numbers.length > 4) {
      masked += numbers.substring(4, 8);
      if (numbers.length > 8) masked += ' ';
    }
    
    // Hora (2 dígitos)
    if (numbers.length > 8) {
      masked += numbers.substring(8, 10);
      if (numbers.length > 10) masked += ':';
    }
    
    // Minutos (2 dígitos)
    if (numbers.length > 10) {
      masked += numbers.substring(10, 12);
    }
    
    return masked;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const masked = applyMask(input);
    setDisplayValue(masked);
    
    // Tentar parsear
    const parsed = parseFromDisplay(masked);
    if (parsed) {
      onChange(parsed);
    }
  };

  // Converter valor de exibição para formato ISO
  const parseFromDisplay = (display: string): string | null => {
    if (!display.trim()) return null;
    
    // Extrair números
    const numbers = display.replace(/\D/g, '');
    
    if (numbers.length < 8) return null; // Precisa de pelo menos data completa
    
    try {
      const day = parseInt(numbers.substring(0, 2));
      const month = parseInt(numbers.substring(2, 4)) - 1; // month é 0-indexed
      const year = parseInt(numbers.substring(4, 8));
      
      let hours = 0;
      let minutes = 0;
      
      if (numbers.length >= 10) {
        hours = parseInt(numbers.substring(8, 10)) || 0;
      }
      if (numbers.length >= 12) {
        minutes = parseInt(numbers.substring(10, 12)) || 0;
      }
      
      const date = new Date(year, month, day, hours, minutes);
      
      if (!isValid(date)) return null;
      
      // Validar valores
      if (day < 1 || day > 31) return null;
      if (hours < 0 || hours > 23) return null;
      if (minutes < 0 || minutes > 59) return null;
      
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return null;
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Selecionar todo o texto para facilitar substituição
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validar e formatar ao perder foco
    const parsed = parseFromDisplay(displayValue);
    if (parsed) {
      setDisplayValue(formatForDisplay(parsed));
      onChange(parsed);
      const date = parseISOValue(parsed);
      if (date) {
        setSelectedDate(date);
        setTimeValue({
          hours: format(date, 'HH'),
          minutes: format(date, 'mm'),
        });
      }
    } else if (displayValue.trim()) {
      // Se não conseguir parsear, restaurar valor anterior
      setDisplayValue(formatForDisplay(value));
    } else {
      // Se vazio, usar data/hora atual
      const now = new Date();
      const isoValue = format(now, "yyyy-MM-dd'T'HH:mm");
      setDisplayValue(formatForDisplay(isoValue));
      onChange(isoValue);
      setSelectedDate(now);
      setTimeValue({
        hours: format(now, 'HH'),
        minutes: format(now, 'mm'),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir navegação e edição
    if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
      return;
    }
    
    // Permitir apenas números
    if (!/[\d]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  // Handler para seleção de data no calendário
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Combinar data selecionada com hora atual
    const hours = parseInt(timeValue.hours) || 0;
    const minutes = parseInt(timeValue.minutes) || 0;
    const combinedDate = setMinutes(setHours(date, hours), minutes);
    
    const isoValue = format(combinedDate, "yyyy-MM-dd'T'HH:mm");
    setDisplayValue(formatForDisplay(isoValue));
    onChange(isoValue);
    setIsPopoverOpen(false);
  };

  // Handler para mudança de hora
  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    const numVal = val.replace(/\D/g, '');
    if (numVal.length > 2) return;
    
    const num = parseInt(numVal);
    if (type === 'hours' && numVal && (num > 23 || num < 0)) return;
    if (type === 'minutes' && numVal && (num > 59 || num < 0)) return;
    
    setTimeValue(prev => {
      const newValue = {
        ...prev,
        [type]: numVal,
      };
      
      // Atualizar data completa
      if (selectedDate) {
        const hours = type === 'hours' ? (num || parseInt(prev.hours) || 0) : parseInt(prev.hours) || 0;
        const minutes = type === 'minutes' ? (num || parseInt(prev.minutes) || 0) : parseInt(prev.minutes) || 0;
        const combinedDate = setMinutes(setHours(selectedDate, hours), minutes);
        
        const isoValue = format(combinedDate, "yyyy-MM-dd'T'HH:mm");
        setDisplayValue(formatForDisplay(isoValue));
        onChange(isoValue);
      }
      
      return newValue;
    });
  };

  const handleTimeBlur = (type: 'hours' | 'minutes') => {
    // Garantir que hora e minuto tenham 2 dígitos
    setTimeValue(prev => ({
      ...prev,
      [type]: prev[type].padStart(2, '0'),
    }));
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 pointer-events-none z-10">
            <CalendarIcon className="h-4 w-4" />
            <Clock className="h-4 w-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="14072025 1030"
            className={cn(
              'flex w-full rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3 pl-20 text-base border-0',
              'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white dark:focus:bg-gray-800',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'font-medium',
              className
            )}
            title="Digite: 14072025 1030 ou clique para abrir o calendário"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          
          {/* Seletor de hora */}
          <div className="flex items-center gap-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hora:</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={timeValue.hours}
                onChange={(e) => handleTimeChange('hours', e.target.value)}
                onBlur={() => handleTimeBlur('hours')}
                maxLength={2}
                placeholder="00"
                className="w-12 text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={timeValue.minutes}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
                onBlur={() => handleTimeBlur('minutes')}
                maxLength={2}
                placeholder="00"
                className="w-12 text-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Botão de hoje */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              handleDateSelect(now);
              setTimeValue({
                hours: format(now, 'HH'),
                minutes: format(now, 'mm'),
              });
            }}
            className="w-full"
          >
            Usar data/hora atual
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
