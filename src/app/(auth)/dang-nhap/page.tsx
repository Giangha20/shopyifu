import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './login-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đăng nhập | LUXE SHOP',
  description: 'Đăng nhập vào tài khoản LUXE SHOP của bạn để tiếp tục mua sắm và theo dõi đơn hàng.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
