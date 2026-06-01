'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import { SEARCH } from '@/constants/app';

interface SearchBoxProps {
  /** Called with debounced query — empty string when cleared */
  onSearch: (query: string) => void;
  /** Controlled value */
  value?: string;
  /** Loading state (show spinner) */
  isLoading?: boolean;
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inputClassName?: string;
}

const SIZE_MAP = {
  sm: { wrap: 'h-9 text-sm', icon: 14, clear: 14 },
  md: { wrap: 'h-11 text-base', icon: 16, clear: 16 },
  lg: { wrap: 'h-14 text-lg', icon: 20, clear: 18 },
};

export default function SearchBox({
  onSearch,
  value: controlledValue,
  isLoading = false,
  placeholder = 'Search titles, people, genres…',
  autoFocus = false,
  size = 'md',
  className,
  inputClassName,
}: SearchBoxProps) {
  const isControlled = controlledValue !== undefined;
  const [localValue, setLocalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const value = isControlled ? controlledValue : localValue;

  // Debounced search call
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q: string) => onSearch(q), SEARCH.DEBOUNCE_MS),
    [onSearch]
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    if (!isControlled) setLocalValue(q);
    debouncedSearch(q);
  };

  const handleClear = () => {
    if (!isControlled) setLocalValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length >= SEARCH.MIN_QUERY_LENGTH) {
      onSearch(value.trim());
    }
  };

  const sizes = SIZE_MAP[size];
  const hasValue = value.length > 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative w-full', className)}
      role="search"
    >
      <div
        className={cn(
          'relative flex items-center rounded-sm bg-zinc-900 border transition-colors duration-200',
          'border-zinc-700 focus-within:border-zinc-500',
          sizes.wrap
        )}
      >
        {/* Leading Icon */}
        <div className="pl-4 flex-shrink-0 pointer-events-none">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2
                  size={sizes.icon}
                  className="text-zinc-400 animate-spin"
                />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Search size={sizes.icon} className="text-zinc-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={SEARCH.MAX_QUERY_LENGTH}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            'flex-1 h-full bg-transparent text-white outline-none px-3',
            'placeholder:text-zinc-600',
            '[&::-webkit-search-cancel-button]:hidden',
            inputClassName
          )}
          aria-label="Search"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {hasValue && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="pr-4 flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={sizes.clear} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
