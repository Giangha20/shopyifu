import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResetPasswordForm from './reset-password-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu | LUXE SHOP',
  description: 'Thiết lập mật khẩu bảo mật mới cho tài khoản LUXE SHOP của bạn.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
