import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  calculatedDiscount: number;
  finalAmount: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'ANNUAL';
  isFree: boolean;
  isActive: boolean;
  accessAllCourses: boolean;
  features: string[];
  courseAccess?: { courseId: string }[];
}

export interface OrderResponse {
  provider: 'RAZORPAY' | 'LEMON_SQUEEZY';
  paymentId: string;
  razorpayOrderId?: string;
  razorpaySubscriptionId?: string;
  razorpayKeyId?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  title: string;
  isSubscription?: boolean;
  rbiComplianceNote?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private http = inject(HttpClient);

  validateCoupon(code: string, originalAmount: number, context: { type: 'COURSE' | 'MEMBERSHIP'; courseId?: string; planId?: string }): Observable<CouponValidationResult> {
    return this.http.post<CouponValidationResult>('/api/payments/coupon/validate', { code, originalAmount, ...context });
  }

  createOrder(payload: { courseId?: string; planId?: string; couponCode?: string; provider?: string }): Observable<OrderResponse> {
    return this.http.post<OrderResponse>('/api/payments/create-order', payload);
  }

  verifyRazorpay(payload: { paymentId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }): Observable<any> {
    return this.http.post<any>('/api/payments/verify-razorpay', payload);
  }
}
