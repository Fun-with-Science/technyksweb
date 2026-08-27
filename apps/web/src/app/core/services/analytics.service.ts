import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  trackEvent(eventName: string, payload: Record<string, any> = {}) {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    if (typeof window !== 'undefined') {
      console.log(`[Analytics Event] ${eventName}:`, eventData);
      // Push to dataLayer for Google Analytics / Tag Manager
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(eventData);
    }
  }

  trackPageView(path: string) {
    this.trackEvent('page_view', { path });
  }

  trackEnrollmentStart(courseId: string, title: string, price: number) {
    this.trackEvent('enrollment_start', { courseId, title, price });
  }

  trackCheckoutCompletion(paymentId: string, amount: number, provider: string) {
    this.trackEvent('checkout_completion', { paymentId, amount, provider });
  }
}
