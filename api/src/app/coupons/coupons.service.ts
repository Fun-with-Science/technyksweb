import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialCoupons();
  }

  async seedInitialCoupons() {
    const count = await this.prisma.coupon.count();
    if (count === 0) {
      await this.prisma.coupon.createMany({
        data: [
          {
            code: 'TECHNYKS50',
            discountPercent: 50,
            usageLimit: 100,
            timesUsed: 0,
            isActive: true,
          },
          {
            code: 'ARCH20',
            discountPercent: 20,
            usageLimit: 500,
            timesUsed: 0,
            isActive: true,
          },
          {
            code: 'FLAT1000',
            discountAmount: 1000,
            currency: 'INR',
            usageLimit: 50,
            timesUsed: 0,
            isActive: true,
          }
        ]
      });
    }
  }

  async validateCoupon(code: string, originalAmount: number) {
    if (!code) {
      throw new BadRequestException('Coupon code is required.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or expired coupon code.');
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new BadRequestException('This coupon code has expired.');
    }

    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      throw new BadRequestException('This coupon usage limit has been reached.');
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = (originalAmount * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discount = coupon.discountAmount;
    }

    // Ensure discount doesn't exceed original amount
    discount = Math.min(discount, originalAmount);
    const finalAmount = Math.max(0, originalAmount - discount);

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: coupon.discountAmount,
      calculatedDiscount: Math.round(discount),
      finalAmount: Math.round(finalAmount),
    };
  }

  async incrementUsage(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { timesUsed: { increment: 1 } },
    });
  }
}
