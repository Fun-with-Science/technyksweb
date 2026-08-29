import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RevenueMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: string;
  totalStudents: number;
  salesByCourse: { title: string; count: number; totalAmount: number }[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { enrollments: number; subscriptions: number };
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  scope: 'COURSE' | 'MEMBERSHIP';
  courseId?: string | null;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
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
  courseAccess: { courseId: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  getMetrics(): Observable<RevenueMetrics> {
    return this.http.get<RevenueMetrics>('/api/admin/metrics');
  }

  searchStudents(query = ''): Observable<Student[]> {
    return this.http.get<Student[]>(`/api/admin/students?search=${encodeURIComponent(query)}`);
  }

  createCourse(payload: any): Observable<any> {
    return this.http.post<any>('/api/admin/courses', payload);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>('/api/admin/coupons');
  }

  getMembershipPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>('/api/admin/membership/plans');
  }

  updateMembershipPlan(id: string, payload: Partial<MembershipPlan> & { featuresText?: string; courseIds?: string[] }): Observable<MembershipPlan> {
    return this.http.patch<MembershipPlan>(`/api/admin/membership/plans/${encodeURIComponent(id)}`, payload);
  }

  createCoupon(payload: any): Observable<Coupon> {
    return this.http.post<Coupon>('/api/admin/coupons', payload);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete<any>(`/api/admin/coupons/${id}`);
  }
}
