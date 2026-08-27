import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsService } from './payments.service';
import * as crypto from 'crypto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPrisma: any;
  let mockCoupons: any;

  beforeEach(() => {
    mockPrisma = {
      course: { findUnique: vi.fn() },
      membershipPlan: { findUnique: vi.fn(), count: vi.fn().mockResolvedValue(0), createMany: vi.fn() },
      payment: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
      enrollment: { upsert: vi.fn() },
    };
    mockCoupons = { validateCoupon: vi.fn() };
    service = new PaymentsService(mockPrisma, mockCoupons);
  });

  it('should verify valid Razorpay HMAC signatures', () => {
    const orderId = 'order_98765';
    const paymentId = 'pay_12345';
    const secret = 'technyks_rzp_secret_key';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = service.verifyRazorpaySignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject invalid Razorpay signatures', () => {
    const isValid = service.verifyRazorpaySignature('order_98765', 'pay_12345', 'forged_signature', 'secret');
    expect(isValid).toBe(false);
  });

  it('should enroll user in course automatically on payment success', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_rec_1',
      userId: 'user_1',
      courseId: 'course_1',
      status: 'PENDING',
    });
    mockPrisma.payment.update.mockResolvedValue({ id: 'pay_rec_1', status: 'SUCCESS' });

    await service.confirmPaymentSuccess('pay_rec_1');

    expect(mockPrisma.enrollment.upsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'user_1', courseId: 'course_1' } },
      create: { userId: 'user_1', courseId: 'course_1', progressPercent: 0, completedLessonIds: [] },
      update: {},
    });
  });
});
