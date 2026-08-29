import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialCoupons();
  }

  async seedInitialCoupons() {
    // Coupons are intentionally created from the admin panel with an explicit
    // course or membership scope. Never seed a global coupon: a global code
    // could accidentally discount a different course or a membership plan.
    const initialCoupons: any[] = [];

    if (this.prisma.isDbConnected !== false) {
      try {
        const count = await this.prisma.coupon.count();
        if (count === 0 && initialCoupons.length > 0) {
          await this.prisma.coupon.createMany({ data: initialCoupons as any });
        }
        return;
      } catch {
        // Use the local adapter below.
      }
    }

    if (this.prisma.inMemoryCoupons.length === 0) {
      this.prisma.inMemoryCoupons = initialCoupons.map((coupon, index) => ({
        id: `coupon_${index + 1}`,
        ...coupon,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
  }

  async validateCoupon(
    code: string,
    originalAmount: number,
    context: { type: 'COURSE' | 'MEMBERSHIP'; courseId?: string; planId?: string } = {
      type: 'COURSE',
    },
  ) {
    if (!code) {
      throw new BadRequestException('Coupon code is required.');
    }

    let coupon: any = null;
    if (this.prisma.isDbConnected !== false) {
      try {
        coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
      } catch {
        // Use the local adapter below.
      }
    }
    if (!coupon) {
      coupon = (this.prisma.inMemoryCoupons || []).find(item => item.code === code.toUpperCase());
    }

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or expired coupon code.');
    }

    const scope = String(coupon.scope || 'COURSE').toUpperCase();
    const isAllowedScope =
      scope === context.type &&
      (scope !== 'COURSE' && scope !== 'MEMBERSHIP'
        ? false
        : scope === 'MEMBERSHIP'
          ? context.type === 'MEMBERSHIP'
          : Boolean(context.courseId) && coupon.courseId === context.courseId);
    if (!isAllowedScope) {
      throw new BadRequestException(
        context.type === 'MEMBERSHIP'
          ? 'This coupon is locked to a course.'
          : 'This coupon is locked to the membership program or another course.',
      );
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
    if (this.prisma.isDbConnected !== false) {
      try {
        await this.prisma.coupon.update({
          where: { code: code.toUpperCase() },
          data: { timesUsed: { increment: 1 } },
        });
        return;
      } catch {
        // Use the local adapter below.
      }
    }

    const coupon = (this.prisma.inMemoryCoupons || []).find(item => item.code === code.toUpperCase());
    if (coupon) coupon.timesUsed += 1;
  }
}
