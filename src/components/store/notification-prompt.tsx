'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, CheckCircle2, ShieldCheck, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  requestWebNotificationPermission,
  sendWebNotification,
  playLuxuryChime,
} from '@/lib/notifications';

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      setIsGranted(true);
      return;
    }

    if (Notification.permission === 'denied') {
      return;
    }

    // Check if user previously dismissed in last 5 days
    const dismissedAt = localStorage.getItem('yifu_notif_prompt_dismissed');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < 5 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show prompt smoothly after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      const permission = await requestWebNotificationPermission();
      if (permission === 'granted') {
        setIsGranted(true);
        setIsVisible(false);
        playLuxuryChime();
        toast.success('Đã kích hoạt thông báo trên web thành công! 🔔');

        // Send confirmation push notification
        sendWebNotification('🔔 YIFU SHOP: Bật thông báo thành công!', {
          body: 'Cảm ơn quý khách! Bạn sẽ nhận được cập nhật đơn hàng & ưu đãi độc quyền tức thì.',
          playSound: false, // Already played chime
        });
      } else if (permission === 'denied') {
        setIsVisible(false);
        toast.error('Trình duyệt đang chặn thông báo. Bấm vào biểu tượng ổ khóa 🔒 ở đầu thanh địa chỉ web để Cho phép (Allow) nhé.');
      } else {
        setIsVisible(false);
      }
    } catch (err) {
      console.warn('Failed to enable notifications:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yifu_notif_prompt_dismissed', Date.now().toString());
    }
  };

  if (!isVisible || isGranted) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-luxury-gold/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-luxury-gold/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-luxury-gold text-slate-950 shadow-md">
            <Bell className="h-6 w-6 animate-bounce" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 text-luxury-gold text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bật Thông Báo Web</span>
            </div>
            <p className="text-sm font-semibold text-white leading-snug">
              Nhận thông báo đơn hàng & ưu đãi độc quyền tức thì!
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Cập nhật ngay khi đơn hàng được gửi đi, mã giảm giá Flash Sale và hàng mới về trên màn hình của bạn.
            </p>

            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-luxury-gold to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>{isProcessing ? 'Đang kích hoạt...' : 'Bật thông báo ngay'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-white px-3 py-2.5 rounded-xl transition-colors hover:bg-white/10"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
