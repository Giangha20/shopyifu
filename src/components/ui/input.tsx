'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center rounded-lg shadow-sm">
          {prefixText && (
            <span className="inline-flex h-11 items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-slate-500 select-none">
              {prefixText}
            </span>
          )}

          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200',
              'placeholder:text-gray-400',
              'focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              prefixText && 'rounded-l-none',
              suffixText && 'rounded-r-none',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}

          {suffixText && (
            <span className="inline-flex h-11 items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-slate-500 select-none">
              {suffixText}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-rose-500 transition-opacity">
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

Input.displayName = 'Input';
