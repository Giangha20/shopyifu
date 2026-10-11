import type { Metadata } from 'next';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản VIP | LUXE SHOP',
  description: 'Gia nhập câu lạc bộ khách hàng thượng lưu LUXE SHOP để nhận ngay ưu đãi độc quyền và dịch vụ đẳng cấp.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
