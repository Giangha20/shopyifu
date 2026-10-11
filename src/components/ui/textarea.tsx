'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      onChange,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // Track internal length if controlled or uncontrolled
    const [currentLength, setCurrentLength] = React.useState<number>(() => {
      if (typeof value === 'string') return value.length;
      if (typeof defaultValue === 'string') return defaultValue.length;
      return 0;
    });

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCurrentLength(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              {label}
              {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
          )}

          {showCount && (
            <span
              className={cn(
                'text-xs text-slate-400 select-none ml-auto',
                maxLength && currentLength >= maxLength && 'text-rose-500 font-semibold'
              )}
            >
              {currentLength}
              {maxLength ? `/${maxLength}` : ''}
            </span>
          )}
        </div>

        <div className="relative rounded-lg shadow-sm">
          <textarea
            id={textareaId}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 resize-y',
              'placeholder:text-gray-400',
              'focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className="text-xs text-rose-500">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
