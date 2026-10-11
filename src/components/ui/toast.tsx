'use client';

import * as React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors={false}
      toastOptions={{
        duration: 4000,
        className:
          'group flex items-center gap-3 w-full p-4 rounded-xl shadow-luxury-lg border font-sans text-sm transition-all',
        classNames: {
          toast: 'bg-white border-gray-100 text-slate-800',
          title: 'font-medium text-slate-900',
          description: 'text-slate-500 text-xs mt-0.5',
          actionButton:
            'bg-luxury-black text-white hover:bg-luxury-black-light text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
          cancelButton:
            'bg-gray-100 text-slate-600 hover:bg-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
          closeButton:
            'bg-white text-slate-400 hover:text-slate-700 border-gray-200',
        },
      }}
      {...props}
    />
  );
}

export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
      className: 'border-emerald-100 bg-emerald-50/50',
      description: options?.description,
      duration: options?.duration,
    });
  },
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
      className: 'border-rose-100 bg-rose-50/50',
      description: options?.description,
      duration: options?.duration,
    });
  },
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
      className: 'border-amber-100 bg-amber-50/50',
      description: options?.description,
      duration: options?.duration,
    });
  },
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      icon: <Info className="h-5 w-5 text-luxury-gold shrink-0" />,
      className: 'border-amber-100 bg-brand-50/50',
      description: options?.description,
      duration: options?.duration,
    });
  },
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      icon: <Loader2 className="h-5 w-5 text-luxury-gold animate-spin shrink-0" />,
      className: 'border-gray-200 bg-white',
      description: options?.description,
    });
  },
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
  promise: sonnerToast.promise,
};
