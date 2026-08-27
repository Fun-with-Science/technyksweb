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
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
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

  createCoupon(payload: any): Observable<Coupon> {
    return this.http.post<Coupon>('/api/admin/coupons', payload);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete<any>(`/api/admin/coupons/${id}`);
  }
}
