'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  name?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'md',
  className,
  name,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) {
      onChange(min);
      return;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const sizeClasses = {
    sm: {
      container: 'h-8',
      button: 'w-7 text-xs',
      input: 'w-10 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'h-10',
      button: 'w-9 text-sm',
      input: 'w-12 text-sm',
      icon: 'h-3.5 w-3.5',
    },
    lg: {
      container: 'h-12',
      button: 'w-11 text-base',
      input: 'w-14 text-base',
      icon: 'h-4 w-4',
    },
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-gray-300 bg-white transition-all overflow-hidden',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'focus-within:border-luxury-gold focus-within:ring-2 focus-within:ring-luxury-gold/20',
        sizeClasses[size].container,
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMin}
        aria-label="Giảm số lượng"
        className={cn(
          'flex h-full items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-luxury-black disabled:pointer-events-none disabled:opacity-30 active:bg-slate-200 select-none',
          sizeClasses[size].button
        )}
      >
        <Minus className={sizeClasses[size].icon} />
      </button>

      <input
        type="number"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        aria-label="Số lượng"
        className={cn(
          'h-full border-0 bg-transparent text-center font-medium text-luxury-black focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          sizeClasses[size].input
        )}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        aria-label="Tăng số lượng"
        className={cn(
          'flex h-full items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-luxury-black disabled:pointer-events-none disabled:opacity-30 active:bg-slate-200 select-none',
          sizeClasses[size].button
        )}
      >
        <Plus className={sizeClasses[size].icon} />
      </button>
    </div>
  );
}
