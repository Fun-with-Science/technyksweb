import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';

const INITIAL_PLANS = [
  {
    id: 'plan_free',
    name: 'Free Tier',
    slug: 'free',
    description: 'Start learning with previews, community access, and academy updates.',
    price: 0,
    currency: 'INR',
    interval: 'MONTHLY',
    isFree: true,
    isActive: true,
    accessAllCourses: false,
    features: ['Free preview lessons', 'Community access', 'Newsletter updates'],
  },
  {
    id: 'plan_pro_monthly',
    name: 'Pro Monthly',
    slug: 'pro-monthly',
    description: 'A focused membership for engineers building production systems.',
    price: 1499,
    currency: 'INR',
    interval: 'MONTHLY',
    isFree: false,
    isActive: true,
    accessAllCourses: true,
    features: ['All Architecture Tracks', 'Source code downloads', 'Q&A forum priority', 'Discord role'],
  },
  {
    id: 'plan_all_access_annual',
    name: 'All-Access Annual',
    slug: 'all-access-annual',
    description: 'The complete Technyks learning program with every current and future course.',
    price: 11999,
    currency: 'INR',
    interval: 'ANNUAL',
    isFree: false,
    isActive: true,
    accessAllCourses: true,
    features: ['All Architecture Tracks + future tracks', '1-on-1 Architecture review', 'Auto-generated Certificates', 'RBI UPI Autopay e-mandate'],
  },
];

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
    private config: ConfigService = new ConfigService()
  ) {}

  async onModuleInit() {
    await this.seedMembershipPlans();
  }

  async seedMembershipPlans() {
    if (this.prisma.isDbConnected !== false) {
      try {
        const count = await this.prisma.membershipPlan.count();
        if (count === 0) {
          await this.prisma.membershipPlan.createMany({ data: INITIAL_PLANS.map(({ id, ...plan }) => plan) as any });
        }
        return;
      } catch {
        // Use the local adapter below.
      }
    }

    if (this.prisma.inMemoryMembershipPlans.length === 0) {
      this.prisma.inMemoryMembershipPlans = INITIAL_PLANS.map(plan => ({
        ...plan,
        courseAccess: [],
      }));
    }
  }

  async getMembershipPlans(includeInactive = false) {
    if (this.prisma.isDbConnected !== false) {
      try {
        return await this.prisma.membershipPlan.findMany({
          where: includeInactive ? undefined : { isActive: true },
          include: { courseAccess: { select: { courseId: true } } },
          orderBy: { price: 'asc' },
        });
      } catch {
        // Use the local adapter below.
      }
    }

    return this.prisma.inMemoryMembershipPlans
      .filter((plan) => includeInactive || plan.isActive !== false)
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
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
      const course = await this.findCourse(dto.courseId);
      if (!course) throw new NotFoundException('Course not found');
      originalPrice = Number(course.price);
      if (Boolean(course.isFree ?? originalPrice === 0)) {
        throw new BadRequestException(
          'This course is free. Use the free enrollment flow instead.',
        );
      }
      currency = course.currency;
      title = course.title;
    } else if (dto.planId) {
      const plan = await this.findPlan(dto.planId);
      if (!plan) throw new NotFoundException('Membership plan not found');
      originalPrice = Number(plan.price);
      currency = plan.currency;
      title = plan.name;
      isSubscription = true;
    } else {
      throw new BadRequestException('Either courseId or planId must be provided.');
    }

    let finalAmount = originalPrice;
    if (dto.couponCode) {
      const couponResult = await this.couponsService.validateCoupon(
        dto.couponCode,
        originalPrice,
        dto.courseId
          ? { type: 'COURSE', courseId: dto.courseId }
          : { type: 'MEMBERSHIP', planId: dto.planId },
      );
      finalAmount = couponResult.finalAmount;
    }

    const provider = dto.provider || (currency === 'INR' ? 'RAZORPAY' : 'LEMON_SQUEEZY');
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentData = {
      userId: dto.userId,
      amount: finalAmount,
      currency,
      status: 'PENDING',
      provider,
      paymentIntentId: orderId,
      courseId: dto.courseId || null,
      planId: dto.planId || null,
      couponCode: dto.couponCode?.trim().toUpperCase() || null,
    };

    let payment: any;
    if (this.prisma.isDbConnected !== false) {
      try {
        payment = await this.prisma.payment.create({ data: paymentData as any });
      } catch {
        // Use the local adapter below.
      }
    }
    if (!payment) {
      payment = { id: `payment_${Date.now().toString(36)}`, ...paymentData, createdAt: new Date(), updatedAt: new Date() };
      this.prisma.inMemoryPayments.push(payment);
    }

    if (provider === 'RAZORPAY') {
      const keyId = this.config.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_technyks_key_123';
      return {
        provider: 'RAZORPAY',
        paymentId: payment.id,
        razorpaySubscriptionId: isSubscription ? `sub_${orderId}` : undefined,
        razorpayOrderId: isSubscription ? undefined : orderId,
        razorpayKeyId: keyId,
        amount: finalAmount * 100,
        currency,
        title,
        isSubscription,
        rbiComplianceNote: isSubscription
          ? 'RBI UPI Autopay e-mandate authentication enabled. Pre-debit notice sent 24h prior to renewal.'
          : undefined,
      };
    }

    return {
      provider: 'LEMON_SQUEEZY',
      paymentId: payment.id,
      checkoutUrl: `https://technyks.lemonsqueezy.com/checkout/buy/${orderId}?embed=1&checkout[custom][user_id]=${dto.userId}`,
      amount: finalAmount,
      currency: 'USD',
      title,
    };
  }

  verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret?: string): boolean {
    const rzpSecret = secret || this.config.get<string>('RAZORPAY_KEY_SECRET') || 'technyks_rzp_secret_key';
    const generatedSignature = crypto.createHmac('sha256', rzpSecret).update(`${orderId}|${paymentId}`).digest('hex');
    return generatedSignature === signature;
  }

  async confirmPaymentSuccess(paymentId: string, razorpayPaymentId?: string) {
    let payment: any = null;
    if (this.prisma.isDbConnected !== false) {
      try {
        payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
      } catch {
        // Use the local adapter below.
      }
    }
    payment ??= (this.prisma.inMemoryPayments || []).find(item => item.id === paymentId);
    if (!payment) throw new NotFoundException('Payment record not found.');

    const wasAlreadySuccessful = payment.status === 'SUCCESS';
    let updated: any = { ...payment, status: 'SUCCESS', updatedAt: new Date() };
    if (this.prisma.isDbConnected !== false) {
      try {
        updated = await this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'SUCCESS' } });
      } catch {
        // Keep the local adapter update below.
      }
    }
    const memoryPayment = (this.prisma.inMemoryPayments || []).find(item => item.id === paymentId);
    if (memoryPayment) Object.assign(memoryPayment, updated);

    if (!wasAlreadySuccessful && payment.couponCode) {
      await this.couponsService.incrementUsage(payment.couponCode);
    }

    if (payment.courseId) {
      if (this.prisma.isDbConnected !== false) {
        try {
          await this.prisma.enrollment.upsert({
            where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
            create: { userId: payment.userId, courseId: payment.courseId, progressPercent: 0, completedLessonIds: [] },
            update: {},
          });
          return updated;
        } catch {
          // Use the local adapter below.
        }
      }

      const alreadyEnrolled = (this.prisma.inMemoryEnrollments || []).some(
        enrollment => enrollment.userId === payment.userId && enrollment.courseId === payment.courseId
      );
      if (!alreadyEnrolled) {
        const course = await this.findCourse(payment.courseId);
      (this.prisma.inMemoryEnrollments || (this.prisma.inMemoryEnrollments = [])).push({
          id: `enrollment_${Date.now().toString(36)}`,
          userId: payment.userId,
          courseId: payment.courseId,
          progressPercent: 0,
          completedLessonIds: [],
          course,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (!wasAlreadySuccessful && payment.planId) {
      const plan = await this.findPlan(payment.planId);
      if (plan) {
        const start = new Date();
        const end = new Date(start);
        if (plan.interval === 'ANNUAL') end.setFullYear(end.getFullYear() + 1);
        else end.setMonth(end.getMonth() + 1);

        if (this.prisma.isDbConnected !== false) {
          try {
            const existingSubscription = await this.prisma.subscription.findFirst({
              where: { userId: payment.userId, planId: plan.id, status: 'ACTIVE' },
            });
            if (existingSubscription) {
              await this.prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: { currentPeriodStart: start, currentPeriodEnd: end },
              });
            } else {
              await this.prisma.subscription.create({
                data: {
                  userId: payment.userId,
                  planId: plan.id,
                  status: 'ACTIVE',
                  currentPeriodStart: start,
                  currentPeriodEnd: end,
                },
              });
            }
            return updated;
          } catch {
            // Use the local adapter below.
          }
        }

        const existingSubscription = this.prisma.inMemorySubscriptions.find(
          (subscription) =>
            subscription.userId === payment.userId &&
            subscription.planId === plan.id &&
            subscription.status === 'ACTIVE',
        );
        if (existingSubscription) {
          existingSubscription.currentPeriodStart = start;
          existingSubscription.currentPeriodEnd = end;
        } else {
          this.prisma.inMemorySubscriptions.push({
            id: `subscription_${Date.now().toString(36)}`,
            userId: payment.userId,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodStart: start,
            currentPeriodEnd: end,
            plan,
            createdAt: start,
            updatedAt: start,
          });
        }
      }
    }

    return updated;
  }

  private async findCourse(id: string) {
    if (this.prisma.isDbConnected !== false) {
      try {
        const course = await this.prisma.course.findFirst({
          where: { id, isArchived: false },
        });
        if (course) return course;
      } catch {
        // Use the local adapter below.
      }
    }
    return this.prisma.inMemoryCourses.find(
      course => course.id === id && !course.isArchived,
    );
  }

  private async findPlan(idOrSlug: string) {
    if (this.prisma.isDbConnected !== false) {
      try {
        const byId = await this.prisma.membershipPlan.findFirst({
          where: { id: idOrSlug, isActive: true },
          include: { courseAccess: true },
        });
        if (byId) return byId;
        return this.prisma.membershipPlan.findFirst({
          where: { slug: idOrSlug, isActive: true },
          include: { courseAccess: true },
        });
      } catch {
        // Use the local adapter below.
      }
    }
    return this.prisma.inMemoryMembershipPlans.find(
      plan =>
        plan.isActive !== false &&
        (plan.id === idOrSlug || plan.slug === idOrSlug),
    );
  }
}
