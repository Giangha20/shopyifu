import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'default' | 'emerald' | 'blue';
  description?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  trendLabel = 'so với kỳ trước',
  icon: Icon,
  variant = 'default',
  description,
  className,
}) => {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend !== undefined && trend === 0;

  const iconStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    gold: 'bg-amber-50 text-luxury-gold border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  }[variant];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105',
            iconStyles
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend !== undefined || description) && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {trend !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold text-2xs',
                isPositive && 'bg-emerald-50 text-emerald-700',
                isNegative && 'bg-rose-50 text-rose-700',
                isNeutral && 'bg-slate-100 text-slate-600'
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isNeutral && <Minus className="h-3 w-3" />}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className="text-slate-500 truncate">
            {description || trendLabel}
          </span>
        </div>
      )}
    </div>
  );
};
