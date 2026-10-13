import { AnnouncementBar } from '@/components/store/announcement-bar';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { MobileBottomNav } from '@/components/store/mobile-bottom-nav';
import { CartDrawer } from '@/components/store/cart-drawer';
import { NotificationPrompt } from '@/components/store/notification-prompt';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Slide-in Cart Drawer */}
      <CartDrawer />

      {/* Mobile Bottom Navigation (fixed at bottom, mobile only) */}
      <MobileBottomNav />

      {/* Interactive Web Notification Prompt */}
      <NotificationPrompt />
    </div>
  );
}
