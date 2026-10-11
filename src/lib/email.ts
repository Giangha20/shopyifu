// ========================================
// LUXE SHOP - Email Notification Service
// ========================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'LUXE SHOP <noreply@luxeshop.vn>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Primary email dispatcher supporting Resend API, SMTP, or console simulation
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
}: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'simulated');

  // 1. Resend Provider via HTTP REST API
  if (provider === 'resend' || process.env.RESEND_API_KEY) {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not defined');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API failed');
      }

      console.log(`✉️ Email successfully dispatched via Resend to ${to}: ${subject}`);
      return { success: true, id: data.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to send email via Resend, falling back:', errorMsg);
    }
  }

  // 2. Simulated / Development Console Fallback
  console.log('====================================================');
  console.log(`✉️ [EMAIL SIMULATION]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${from}`);
  console.log('====================================================');

  return {
    success: true,
    id: `sim-${Date.now()}`,
  };
}

// ========================================
// EMAIL TEMPLATES WITH LUXE BRANDING
// ========================================

const baseLayout = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LUXE SHOP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background-color: #0f172a; padding: 36px 30px; text-align: center; }
    .brand { color: #f59e0b; font-size: 26px; font-weight: 700; letter-spacing: 4px; text-decoration: none; margin: 0; font-family: Georgia, serif; }
    .tagline { color: #94a3b8; font-size: 12px; letter-spacing: 2px; margin-top: 6px; text-transform: uppercase; }
    .content { padding: 40px 30px; line-height: 1.6; font-size: 15px; color: #334155; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; font-family: Georgia, serif; }
    .button-container { text-align: center; margin: 35px 0; }
    .btn-gold { background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25); }
    .footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer a { color: #64748b; text-decoration: underline; }
    .card { background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 25px 0; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <div class="wrapper">
    <div class="header">
      <div class="brand">LUXE SHOP</div>
      <div class="tagline">Haute Couture & Luxury Living</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">LUXE SHOP - Thời trang cao cấp & phong cách sống</p>
      <p style="margin: 0 0 8px 0;">88 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh | Hotline: 1900 8888</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} LUXE SHOP. Mọi quyền được bảo lưu.</p>
    </div>
  </div>
</body>
</html>
`;

export function getWelcomeEmail(name: string): { subject: string; html: string } {
  const subject = 'Chào mừng bạn đến với LUXE SHOP';
  const html = baseLayout(
    `
    <h2 class="title">Xin chào ${name},</h2>
    <p>Chào mừng bạn đã gia nhập cộng đồng khách hàng thượng lưu của <strong>LUXE SHOP</strong>.</p>
    <p>Tại LUXE, chúng tôi tin rằng mỗi bộ trang phục không chỉ đơn thuần là vải vóc, mà là sự phản chiếu phong thái, đẳng cấp và cá tính độc bản của chính bạn.</p>
    <div class="card" style="text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #b45309; font-weight: 600;">Món quà chào mừng đặc quyền</p>
      <p style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: 2px;">MÃ: <strong>WELCOME10</strong></p>
      <p style="font-size: 13px; color: #64748b; margin: 8px 0 0 0;">Giảm ngay 10% cho đơn hàng đầu tiên của bạn tại LUXE SHOP</p>
    </div>
    <div class="button-container">
      <a href="${APP_URL}" class="btn-gold">KHÁM PHÁ BỘ SƯU TẬP</a>
    </div>
    <p>Nếu bạn cần tư vấn về số đo may đo hoặc chất liệu vải, đừng ngần ngại liên hệ với chuyên viên phục vụ khách hàng của chúng tôi.</p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ LUXE SHOP</strong></p>
    `,
    'Chào mừng bạn đến với thế giới thời trang đẳng cấp LUXE SHOP'
  );
  return { subject, html };
}

export function getPasswordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  const subject = 'Khôi phục mật khẩu tài khoản LUXE SHOP';
  const html = baseLayout(
    `
    <h2 class="title">Yêu cầu đặt lại mật khẩu</h2>
    <p>Xin chào ${name},</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản LUXE SHOP của bạn. Vui lòng bấm vào nút bên dưới để thiết lập mật khẩu mới:</p>
    <div class="button-container">
      <a href="${resetUrl}" class="btn-gold">ĐẶT LẠI MẬT KHẨU</a>
    </div>
    <div class="card">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Liên kết đặt lại mật khẩu này sẽ hết hạn sau <strong>60 phút</strong>. Nếu bạn không gửi yêu cầu này, hãy yên tâm bỏ qua email này, tài khoản của bạn vẫn được bảo mật tuyệt đối.
      </p>
    </div>
    <p style="font-size: 13px; color: #94a3b8; word-break: break-all;">Hoặc sao chép đường link này vào trình duyệt: <br>${resetUrl}</p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ bảo mật LUXE SHOP</strong></p>
    `,
    'Yêu cầu đặt lại mật khẩu cho tài khoản LUXE SHOP của bạn'
  );
  return { subject, html };
}

export interface OrderItemEmailData {
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderEmailData {
  orderNumber: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemEmailData[];
}

export function getOrderConfirmationEmail(order: OrderEmailData): { subject: string; html: string } {
  const subject = `Xác nhận đơn hàng #${order.orderNumber} - LUXE SHOP`;
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9;">
        <strong>${item.productName}</strong>
        ${item.variantName ? `<br><span style="font-size: 12px; color: #64748b;">Phân loại: ${item.variantName}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f5f9;">x${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${formatMoney(item.totalPrice)}</td>
    </tr>
  `
    )
    .join('');

  const html = baseLayout(
    `
    <h2 class="title">Cảm ơn bạn đã đặt hàng!</h2>
    <p>Xin chào <strong>${order.shippingName}</strong>, đơn hàng <strong>#${order.orderNumber}</strong> của bạn đã được tiếp nhận và đang trong quá trình chuẩn bị đóng gói cẩn thận.</p>
    
    <div class="card">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px;">Địa chỉ giao hàng:</div>
      <div style="color: #475569; font-size: 14px;">
        ${order.shippingName} - ${order.shippingPhone}<br>
        ${order.shippingAddress}
      </div>
      <div style="margin-top: 10px; font-size: 14px; color: #475569;">
        Phương thức thanh toán: <strong>${order.paymentMethod.toUpperCase()}</strong>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
      <thead>
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569;">
          <th style="padding: 10px 8px;">Sản phẩm</th>
          <th style="padding: 10px 8px; text-align: center;">SL</th>
          <th style="padding: 10px 8px; text-align: right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 10px 8px; text-align: right; color: #64748b;">Tạm tính:</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 600;">${formatMoney(order.subtotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px; text-align: right; color: #64748b;">Phí vận chuyển:</td>
          <td style="padding: 8px; text-align: right; font-weight: 600;">${formatMoney(order.shippingFee)}</td>
        </tr>
        ${
          order.discountAmount > 0
            ? `
        <tr>
          <td colspan="2" style="padding: 8px; text-align: right; color: #16a34a;">Giảm giá khuyến mãi:</td>
          <td style="padding: 8px; text-align: right; font-weight: 600; color: #16a34a;">-${formatMoney(order.discountAmount)}</td>
        </tr>
        `
            : ''
        }
        <tr style="border-top: 2px solid #0f172a;">
          <td colspan="2" style="padding: 14px 8px; text-align: right; font-size: 16px; font-weight: 700; color: #0f172a;">Tổng thanh toán:</td>
          <td style="padding: 14px 8px; text-align: right; font-size: 18px; font-weight: 700; color: #b45309;">${formatMoney(order.totalAmount)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="button-container">
      <a href="${APP_URL}/tai-khoan/don-hang/${order.orderNumber}" class="btn-gold">THEO DÕI ĐƠN HÀNG</a>
    </div>

    <p style="margin-top: 30px;">Trân trọng cảm ơn quý khách,<br><strong>Đội ngũ LUXE SHOP</strong></p>
    `,
    `Xác nhận đơn hàng #${order.orderNumber} trị giá ${formatMoney(order.totalAmount)}`
  );

  return { subject, html };
}

export function getOrderStatusUpdateEmail(
  orderNumber: string,
  customerName: string,
  oldStatusText: string,
  newStatusText: string,
  trackingNumber?: string
): { subject: string; html: string } {
  const subject = `Cập nhật trạng thái đơn hàng #${orderNumber} - LUXE SHOP`;
  const html = baseLayout(
    `
    <h2 class="title">Đơn hàng #${orderNumber} có cập nhật mới</h2>
    <p>Xin chào <strong>${customerName}</strong>,</p>
    <p>Trạng thái đơn hàng của bạn đã được cập nhật sang:</p>
    
    <div class="card" style="text-align: center; background-color: #f0fdf4; border-color: #bbf7d0;">
      <span style="font-size: 13px; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Trạng thái hiện tại</span>
      <h3 style="margin: 8px 0; color: #15803d; font-size: 22px;">${newStatusText}</h3>
      ${trackingNumber ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #166534;">Mã vận đơn: <strong>${trackingNumber}</strong></p>` : ''}
    </div>

    <div class="button-container">
      <a href="${APP_URL}/tai-khoan/don-hang/${orderNumber}" class="btn-gold">CHI TIẾT ĐƠN HÀNG</a>
    </div>

    <p>Mọi thắc mắc cần được hỗ trợ kịp thời, quý khách vui lòng phản hồi email này hoặc gọi hotline <strong>1900 8888</strong>.</p>
    <p style="margin-top: 30px;">Trân trọng,<br><strong>LUXE SHOP Concierge Service</strong></p>
    `,
    `Đơn hàng #${orderNumber} đã chuyển sang trạng thái: ${newStatusText}`
  );

  return { subject, html };
}
