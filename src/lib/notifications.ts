/**
 * Web Notification & Sound Alert Utility
 * Supports Web Audio synthesis, Desktop Push Notifications, and Permission Management
 */

// Luxury chime audio synthesizer using Web Audio API
export function playLuxuryChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // If context is suspended (browser autoplay policy), resume it
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Pleasant pentatonic luxury chord sequence: C5, E5, G5, C6
    const chords = [523.25, 659.25, 783.99, 1046.5];

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      
      gain.gain.setValueAtTime(0.28, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.9);
    });
  } catch (err) {
    console.warn('Could not play web audio chime:', err);
  }
}

// Request Browser Notification Permission
export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('web_notification_permission', permission);
      localStorage.setItem('web_notification_prompt_answered', 'true');
    }
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Send native browser notification
export function sendWebNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    playSound?: boolean;
  }
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (options?.playSound !== false) {
    playLuxuryChime();
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || '/favicon.ico',
        badge: options?.badge || '/favicon.ico',
        tag: options?.tag || 'yifu-notification',
      });

      if (options?.url) {
        notif.onclick = () => {
          window.focus();
          window.location.href = options.url!;
          notif.close();
        };
      }

      return notif;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  return null;
}

// Check notification support & status
export function getNotificationStatus(): {
  isSupported: boolean;
  permission: NotificationPermission;
} {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { isSupported: false, permission: 'denied' };
  }
  return {
    isSupported: true,
    permission: Notification.permission,
  };
}
