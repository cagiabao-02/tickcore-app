/** Lỗi và kiểm tra nghiệp vụ dùng chung trong mock; không chứa logic backend. */
import { HttpResponse } from 'msw';
import { mockPromotions } from './data';

export function mockError(status: number, code: string, message: string) {
  return HttpResponse.json(
    { status, code, message, details: {}, timestamp: new Date().toISOString() },
    { status },
  );
}

/** Áp dụng cùng một quy tắc mã giảm giá cho kiểm tra mã và tạo đơn. */
export function validatePromotion(code: string, subtotal: number) {
  const promo = mockPromotions.find((p) => p.code === code.trim().toUpperCase());
  if (!promo) return { valid: false, discountAmount: 0, message: 'booking.promoInvalid' };
  const today = new Date().toLocaleDateString('en-CA');
  if (
    !promo.active ||
    promo.endDate < today ||
    promo.startDate > today ||
    promo.usedCount >= promo.usageLimit
  ) {
    return { valid: false, discountAmount: 0, message: 'booking.promoExpired' };
  }
  if (subtotal < promo.minOrderAmount)
    return {
      valid: false,
      discountAmount: 0,
      message: 'booking.promoMinOrder',
      minOrderAmount: promo.minOrderAmount,
    };
  let discountAmount =
    promo.type === 'PERCENTAGE' ? Math.floor((subtotal * promo.value) / 100) : promo.value;
  if (promo.maxDiscount !== null) discountAmount = Math.min(discountAmount, promo.maxDiscount);
  return {
    valid: true,
    discountAmount: Math.min(subtotal, discountAmount),
    message: 'booking.promoSuccess',
  };
}
