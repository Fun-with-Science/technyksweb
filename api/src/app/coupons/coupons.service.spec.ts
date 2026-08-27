import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CouponsService } from './coupons.service';

describe('CouponsService', () => {
  let service: CouponsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      coupon: {
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        createMany: vi.fn(),
      },
    };
    service = new CouponsService(mockPrisma);
  });

  it('should apply percentage discount correctly', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: 'TECHNYKS50',
      discountPercent: 50,
      isActive: true,
      timesUsed: 0,
      usageLimit: 100,
    });

    const result = await service.validateCoupon('TECHNYKS50', 4000);
    expect(result.calculatedDiscount).toBe(2000);
    expect(result.finalAmount).toBe(2000);
  });

  it('should apply flat amount discount correctly', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: 'FLAT1000',
      discountAmount: 1000,
      isActive: true,
      timesUsed: 0,
      usageLimit: 100,
    });

    const result = await service.validateCoupon('FLAT1000', 4000);
    expect(result.calculatedDiscount).toBe(1000);
    expect(result.finalAmount).toBe(3000);
  });

  it('should throw error for expired or overused coupons', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: 'EXPIRED',
      discountPercent: 20,
      isActive: true,
      timesUsed: 50,
      usageLimit: 50,
    });

    await expect(service.validateCoupon('EXPIRED', 4000)).rejects.toThrow(
      'This coupon usage limit has been reached.'
    );
  });
});
