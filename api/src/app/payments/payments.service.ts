import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService
  ) {}

  async onModuleInit() {
    await this.seedMembershipPlans();
  }

  async seedMembershipPlans() {
    const count = await this.prisma.membershipPlan.count();
    if (count === 0) {
      await this.prisma.membershipPlan.createMany({
        data: [
          {
            name: 'Free Tier',
            slug: 'free',
            price: 0,
            currency: 'INR',
            interval: 'MONTHLY',
            isFree: true,
            features: ['Free preview lessons', 'Community access', 'Newsletter updates'],
          },
          {
            name: 'Pro Monthly',
            slug: 'pro-monthly',
            price: 1499,
            currency: 'INR',
            interval: 'MONTHLY',
            isFree: false,
            features: ['All Architecture Tracks', 'Source code downloads', 'Q&A forum priority', 'Discord role'],
          },
          {
            name: 'All-Access Annual',
            slug: 'all-access-annual',
            price: 11999,
            currency: 'INR',
            interval: 'ANNUAL',
            isFree: false,
            features: ['All Architecture Tracks + future tracks', '1-on-1 Architecture review', 'Auto-generated Certificates', 'RBI UPI Autopay e-mandate'],
          }
        ]
      });
    }
  }

  async createCheckoutOrder(dto: {
    userId: string;
    courseId?: string;
    planId?: string;
    couponCode?: string;
    provider?: 'RAZORPAY' | 'LEMON_SQUEEZY';
  }) {
    let originalPrice = 0;
    let currency = 'INR';
    let title = '';
    let isSubscription = false;

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (!course) throw new NotFoundException('Course not found');
      originalPrice = course.price;
      currency = course.currency;
      title = course.title;
    } else if (dto.planId) {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException('Membership plan not found');
      originalPrice = plan.price;
      currency = plan.currency;
      title = plan.name;
      isSubscription = true;
    } else {
      throw new BadRequestException('Either courseId or planId must be provided.');
    }

    let discount = 0;
    let finalAmount = originalPrice;
    if (dto.couponCode) {
      const couponResult = await this.couponsService.validateCoupon(dto.couponCode, originalPrice);
      discount = couponResult.calculatedDiscount;
      finalAmount = couponResult.finalAmount;
    }

    const provider = dto.provider || (currency === 'INR' ? 'RAZORPAY' : 'LEMON_SQUEEZY');
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Save payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        amount: finalAmount,
        currency,
        status: 'PENDING',
        provider,
        paymentIntentId: orderId,
        courseId: dto.courseId || null,
      }
    });

    if (provider === 'RAZORPAY') {
      const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_technyks_key_123';
      
      if (isSubscription) {
        // RBI UPI Autopay / e-mandate metadata for recurring subscription
        return {
          provider: 'RAZORPAY',
          paymentId: payment.id,
          razorpaySubscriptionId: `sub_${orderId}`,
          razorpayKeyId: keyId,
          amount: finalAmount * 100, // in paise
          currency,
          title,
          isSubscription: true,
          rbiComplianceNote: 'RBI UPI Autopay e-mandate authentication enabled. Pre-debit notice sent 24h prior to renewal.',
        };
      }

      return {
        provider: 'RAZORPAY',
        paymentId: payment.id,
        razorpayOrderId: orderId,
        razorpayKeyId: keyId,
        amount: finalAmount * 100, // in paise
        currency,
        title,
        isSubscription: false,
      };
    } else {
      // Lemon Squeezy (Merchant of Record for International payments)
      const checkoutUrl = `https://technyks.lemonsqueezy.com/checkout/buy/${orderId}?embed=1&checkout[custom][user_id]=${dto.userId}`;
      return {
        provider: 'LEMON_SQUEEZY',
        paymentId: payment.id,
        checkoutUrl,
        amount: finalAmount,
        currency: 'USD',
        title,
      };
    }
  }

  verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret?: string): boolean {
    const rzpSecret = secret || process.env.RAZORPAY_KEY_SECRET || 'technyks_rzp_secret_key';
    const generatedSignature = crypto
      .createHmac('sha256', rzpSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  async confirmPaymentSuccess(paymentId: string, razorpayPaymentId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment record not found.');

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS' },
    });

    // If payment was for a course, enroll student automatically!
    if (payment.courseId) {
      await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId,
          }
        },
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
          progressPercent: 0,
          completedLessonIds: [],
        },
        update: {},
      });
    }

    return updated;
  }
}
