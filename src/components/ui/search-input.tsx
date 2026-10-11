'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  showShortcut?: boolean;
  shortcutKey?: string;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSearch,
      debounceMs = 300,
      isLoading = false,
      showShortcut = true,
      shortcutKey = 'K',
      placeholder = 'Tìm kiếm sản phẩm, thương hiệu...',
      onClear,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(
      isControlled ? controlledValue : defaultValue
    );
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const currentValue = isControlled ? controlledValue : internalValue;

    // Debounce callback
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (onChange) {
          onChange(currentValue);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [currentValue, debounceMs, onChange]);

    // Keyboard shortcut handler (Ctrl+K or Cmd+K)
    React.useEffect(() => {
      if (!showShortcut) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showShortcut, shortcutKey]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isControlled) {
        setInternalValue(val);
      } else {
        onChange?.(val);
      }
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      onClear?.();
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(currentValue);
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="search"
          value={currentValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-20 text-sm text-slate-900 transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20',
            '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
          )}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-luxury-gold" />
          )}

          {!isLoading && currentValue && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {showShortcut && !currentValue && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-2xs font-medium text-slate-400 select-none">
              <span className="text-xs">⌘</span>
              <span>{shortcutKey}</span>
            </kbd>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
