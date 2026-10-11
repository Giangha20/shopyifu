import type { Metadata } from 'next';
import ForgotPasswordForm from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Quên mật khẩu | LUXE SHOP',
  description: 'Khôi phục mật khẩu tài khoản LUXE SHOP của bạn một cách nhanh chóng và an toàn.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
