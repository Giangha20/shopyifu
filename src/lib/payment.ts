import * as crypto from 'crypto';

export interface OrderPaymentInfo {
  orderNumber: string;
  totalAmount: number;
  customerNote?: string | null;
  shippingEmail?: string | null;
  shippingPhone?: string | null;
  shippingName?: string | null;
}

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrCodeUrl: string;
}

// ========================================
// 1. VNPAY INTEGRATION
// ========================================

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || '';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const VNPAY_RETURN_URL =
  process.env.VNPAY_RETURN_URL || `${APP_URL}/api/payment/vnpay/return`;

function sortObject(obj: Record<string, string | number>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
      sorted[encodeURIComponent(key)] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }
  }
  return sorted;
}

export function isVNPayConfigured(): boolean {
  return Boolean(VNPAY_TMN_CODE && VNPAY_HASH_SECRET);
}

/**
 * Creates VNPay payment gateway redirect URL
 */
export function createVNPayPaymentUrl(order: OrderPaymentInfo, clientIp: string = '127.0.0.1'): string {
  if (!isVNPayConfigured()) {
    console.warn('⚠️ VNPay credentials not fully configured in environment. Using demo sandbox mock url.');
    return `${VNPAY_RETURN_URL}?vnp_ResponseCode=00&vnp_TxnRef=${order.orderNumber}&vnp_Amount=${order.totalAmount * 100}&mock=true`;
  }

  const date = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  const vnp_Params: Record<string, string | number> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: order.orderNumber,
    vnp_OrderInfo: `Thanh toan don hang LUXE SHOP #${order.orderNumber}`,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(order.totalAmount * 100),
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: clientIp,
    vnp_CreateDate: createDate,
  };

  const sortedParams = sortObject(vnp_Params);
  const signData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const queryParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sortedParams)) {
    queryParams.append(decodeURIComponent(k), decodeURIComponent(v));
  }
  queryParams.append('vnp_SecureHash', signed);

  return `${VNPAY_URL}?${queryParams.toString()}`;
}

/**
 * Verify VNPay return URL signature
 */
export function verifyVNPayReturnUrl(params: Record<string, string>): {
  isValid: boolean;
  orderNumber: string;
  responseCode: string;
  amount: number;
  transactionNo?: string;
} {
  const secureHash = params['vnp_SecureHash'];
  const orderNumber = params['vnp_TxnRef'] || '';
  const responseCode = params['vnp_ResponseCode'] || '';
  const amount = params['vnp_Amount'] ? parseInt(params['vnp_Amount'], 10) / 100 : 0;
  const transactionNo = params['vnp_TransactionNo'];

  // Handle mock mode
  if (params['mock'] === 'true') {
    return {
      isValid: true,
      orderNumber,
      responseCode: '00',
      amount,
      transactionNo: 'MOCK-VNPAY-999',
    };
  }

  if (!isVNPayConfigured() || !secureHash) {
    return { isValid: false, orderNumber, responseCode, amount };
  }

  const signParams: Record<string, string> = {};
  for (const key of Object.keys(params)) {
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      signParams[key] = params[key];
    }
  }

  const sortedParams = sortObject(signParams);
  const signData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = calculatedHash.toLowerCase() === secureHash.toLowerCase();

  return {
    isValid,
    orderNumber,
    responseCode,
    amount,
    transactionNo,
  };
}

/**
 * Verify VNPay IPN webhook
 */
export function verifyVNPayIPN(params: Record<string, string>): {
  isValid: boolean;
  orderNumber: string;
  responseCode: string;
  amount: number;
} {
  return verifyVNPayReturnUrl(params);
}

// ========================================
// 2. MOMO INTEGRATION
// ========================================

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || '';
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || '';
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || '';
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api';

export function isMoMoConfigured(): boolean {
  return Boolean(MOMO_PARTNER_CODE && MOMO_ACCESS_KEY && MOMO_SECRET_KEY);
}

export interface MoMoPaymentResponse {
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
  resultCode: number;
  message: string;
}

/**
 * Creates MoMo payment gateway transaction request
 */
export async function createMoMoPaymentRequest(order: OrderPaymentInfo): Promise<MoMoPaymentResponse> {
  const redirectUrl = `${APP_URL}/tai-khoan/don-hang/${order.orderNumber}`;
  const ipnUrl = `${APP_URL}/api/payment/momo/callback`;

  if (!isMoMoConfigured()) {
    console.warn('⚠️ MoMo credentials not configured. Returning simulated payment link.');
    return {
      payUrl: `${redirectUrl}?payment_status=success&mock=momo`,
      resultCode: 0,
      message: 'MoMo Simulated Success',
    };
  }

  const requestId = `${order.orderNumber}-${Date.now()}`;
  const orderId = order.orderNumber;
  const orderInfo = `Thanh toán đơn hàng LUXE SHOP #${order.orderNumber}`;
  const amount = Math.round(order.totalAmount).toString();
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode: MOMO_PARTNER_CODE,
    partnerName: 'LUXE SHOP',
    storeId: 'LuxeShopStore',
    requestId,
    amount: parseInt(amount, 10),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData,
    signature,
  };

  try {
    const res = await fetch(`${MOMO_ENDPOINT}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    return {
      payUrl: data.payUrl,
      qrCodeUrl: data.qrCodeUrl,
      deeplink: data.deeplink,
      resultCode: data.resultCode,
      message: data.message,
    };
  } catch (error) {
    console.error('MoMo payment request failed:', error);
    return {
      resultCode: -1,
      message: 'Không thể kết nối đến cổng MoMo',
    };
  }
}

/**
 * Verify MoMo IPN callback signature
 */
export function verifyMoMoCallback(params: Record<string, string | number>): {
  isValid: boolean;
  orderId: string;
  resultCode: number;
  amount: number;
  transId?: string;
} {
  const orderId = String(params.orderId || '');
  const resultCode = parseInt(String(params.resultCode ?? '-1'), 10);
  const amount = parseInt(String(params.amount || '0'), 10);
  const transId = String(params.transId || '');
  const signature = String(params.signature || '');

  if (!isMoMoConfigured()) {
    return { isValid: true, orderId, resultCode: 0, amount, transId: 'MOCK-MOMO' };
  }

  const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${params.amount}&extraData=${params.extraData || ''}&message=${params.message}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&orderType=${params.orderType}&partnerCode=${params.partnerCode}&payType=${params.payType}&requestId=${params.requestId}&responseTime=${params.responseTime}&resultCode=${params.resultCode}&transId=${params.transId}`;

  const calculatedSignature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const isValid = calculatedSignature === signature;

  return {
    isValid,
    orderId,
    resultCode,
    amount,
    transId,
  };
}

// ========================================
// 3. BANK TRANSFER (VIETQR COMPLIANT)
// ========================================

export function generateTransferInfo(order: OrderPaymentInfo): BankTransferInfo {
  const bankName = 'Vietcombank';
  const bankBin = '970436'; // VCB BIN for VietQR
  const accountNumber = '1028888999';
  const accountName = 'LUXE SHOP VIET NAM';
  const transferContent = `LUXE ${order.orderNumber}`;

  // Generate official VietQR dynamic standard image link
  const encodedInfo = encodeURIComponent(transferContent);
  const encodedName = encodeURIComponent(accountName);
  const qrCodeUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?amount=${order.totalAmount}&addInfo=${encodedInfo}&accountName=${encodedName}`;

  return {
    bankName,
    accountNumber,
    accountName,
    amount: order.totalAmount,
    transferContent,
    qrCodeUrl,
  };
}
