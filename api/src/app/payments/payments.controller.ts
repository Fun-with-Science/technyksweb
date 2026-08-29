import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CouponsService } from '../coupons/coupons.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private couponsService: CouponsService
  ) {}

  @Get('plans')
  async getPlans() {
    return this.paymentsService.getMembershipPlans();
  }

  @Post('coupon/validate')
  async validateCoupon(@Body() dto: {
    code: string;
    originalAmount: number;
    type?: 'COURSE' | 'MEMBERSHIP';
    courseId?: string;
    planId?: string;
  }) {
    return this.couponsService.validateCoupon(dto.code, dto.originalAmount, {
      type: dto.type || (dto.courseId ? 'COURSE' : 'MEMBERSHIP'),
      courseId: dto.courseId,
      planId: dto.planId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  async createOrder(
    @Request() req: any,
    @Body() dto: { courseId?: string; planId?: string; couponCode?: string; provider?: 'RAZORPAY' | 'LEMON_SQUEEZY' }
  ) {
    return this.paymentsService.createCheckoutOrder({
      userId: req.user.id,
      ...dto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-razorpay')
  async verifyRazorpay(
    @Body() dto: { paymentId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  ) {
    const isValid = this.paymentsService.verifyRazorpaySignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature
    );

    if (!isValid) {
      throw new BadRequestException('Razorpay payment signature verification failed.');
    }

    return this.paymentsService.confirmPaymentSuccess(dto.paymentId, dto.razorpayPaymentId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // Process Razorpay and Lemon Squeezy incoming webhooks for subscription renewals
    return { status: 'received' };
  }
}
