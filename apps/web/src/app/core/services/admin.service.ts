import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

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

export interface CourseStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  enrolledAt: string;
  lastVisited: string;
  progressPercent: number;
  completedLessons: number;
}

export interface MediaUploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
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
  featuresText?: string;
  courseAccess: { courseId: string }[];
}

const MEMBERSHIP_PLANS_STORAGE_KEY = 'technyks_membership_plans_v1';
const COUPONS_STORAGE_KEY = 'technyks_coupons_v1';
const FALLBACK_MEMBERSHIP_PLANS: MembershipPlan[] = [
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
    courseAccess: [],
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
    features: ['All courses', 'Source code downloads', 'Q&A forum priority', 'Cancel anytime'],
    courseAccess: [],
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
    features: ['All courses and future releases', 'Completion certificates', '1-on-1 architecture review', 'RBI UPI Autopay'],
    courseAccess: [],
  },
];

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

  getCourseStudents(courseId: string, query = ''): Observable<CourseStudent[]> {
    return this.http.get<CourseStudent[]>(
      `/api/admin/courses/${encodeURIComponent(courseId)}/students?search=${encodeURIComponent(query)}`,
    );
  }

  uploadCourseMedia(
    kind: 'image' | 'video',
    file: File,
  ): Observable<MediaUploadResult> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<MediaUploadResult>(`/api/admin/media/${kind}`, body);
  }

  removeCourseMedia(url: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `/api/admin/media?url=${encodeURIComponent(url)}`,
    );
  }

  createCourse(payload: any): Observable<any> {
    return this.http.post<any>('/api/admin/courses', payload);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>('/api/admin/coupons').pipe(
      tap((coupons) => this.storeLocal(COUPONS_STORAGE_KEY, coupons)),
      catchError((error) =>
        this.isApiUnavailable(error)
          ? of(this.readLocal<Coupon[]>(COUPONS_STORAGE_KEY, []))
          : throwError(() => error),
      ),
    );
  }

  getMembershipPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>('/api/admin/membership/plans').pipe(
      tap((plans) => this.storeLocal(MEMBERSHIP_PLANS_STORAGE_KEY, plans)),
      catchError((error) =>
        this.isApiUnavailable(error)
          ? of(this.readLocal(MEMBERSHIP_PLANS_STORAGE_KEY, FALLBACK_MEMBERSHIP_PLANS))
          : throwError(() => error),
      ),
    );
  }

  updateMembershipPlan(id: string, payload: Partial<MembershipPlan> & { featuresText?: string; courseIds?: string[] }): Observable<MembershipPlan> {
    const fallback = () => {
      const plans = this.readLocal<MembershipPlan[]>(
        MEMBERSHIP_PLANS_STORAGE_KEY,
        FALLBACK_MEMBERSHIP_PLANS,
      );
      const index = plans.findIndex((plan) => plan.id === id);
      if (index === -1) return throwError(() => new Error('Membership plan not found.'));
      const current = plans[index];
      const updated: MembershipPlan = {
        ...current,
        ...payload,
        features:
          payload.featuresText !== undefined
            ? payload.featuresText.split('\n').map((item) => item.trim()).filter(Boolean)
            : (payload.features || current.features),
        courseAccess: payload.accessAllCourses
          ? []
          : (payload.courseIds || current.courseAccess.map((access) => access.courseId)).map((courseId) => ({ courseId })),
      };
      delete (updated as MembershipPlan & { featuresText?: string }).featuresText;
      plans[index] = updated;
      this.storeLocal(MEMBERSHIP_PLANS_STORAGE_KEY, plans);
      return of(updated);
    };

    return this.http.patch<MembershipPlan>(`/api/admin/membership/plans/${encodeURIComponent(id)}`, payload).pipe(
      tap((saved) => {
        const plans = this.readLocal<MembershipPlan[]>(MEMBERSHIP_PLANS_STORAGE_KEY, FALLBACK_MEMBERSHIP_PLANS);
        this.storeLocal(MEMBERSHIP_PLANS_STORAGE_KEY, plans.map((plan) => plan.id === saved.id ? saved : plan));
      }),
      catchError((error) => this.isApiUnavailable(error) ? fallback() : throwError(() => error)),
    );
  }

  createCoupon(payload: any): Observable<Coupon> {
    const fallback = () => {
      const coupon: Coupon = {
        id: `coupon_${Date.now().toString(36)}`,
        code: String(payload.code || '').trim().toUpperCase(),
        discountPercent: payload.discountPercent,
        discountAmount: payload.discountAmount,
        scope: payload.scope === 'MEMBERSHIP' ? 'MEMBERSHIP' : 'COURSE',
        courseId: payload.courseId || null,
        usageLimit: payload.usageLimit,
        timesUsed: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const coupons = this.readLocal<Coupon[]>(COUPONS_STORAGE_KEY, []);
      this.storeLocal(COUPONS_STORAGE_KEY, [coupon, ...coupons]);
      return of(coupon);
    };
    return this.http.post<Coupon>('/api/admin/coupons', payload).pipe(
      tap((coupon) => {
        const coupons = this.readLocal<Coupon[]>(COUPONS_STORAGE_KEY, []);
        this.storeLocal(COUPONS_STORAGE_KEY, [coupon, ...coupons.filter((item) => item.id !== coupon.id)]);
      }),
      catchError((error) => this.isApiUnavailable(error) ? fallback() : throwError(() => error)),
    );
  }

  deleteCoupon(id: string): Observable<any> {
    const fallback = () => {
      const coupons = this.readLocal<Coupon[]>(COUPONS_STORAGE_KEY, []);
      this.storeLocal(COUPONS_STORAGE_KEY, coupons.filter((coupon) => coupon.id !== id));
      return of({ success: true });
    };
    return this.http.delete<any>(`/api/admin/coupons/${id}`).pipe(
      tap(() => {
        const coupons = this.readLocal<Coupon[]>(COUPONS_STORAGE_KEY, []);
        this.storeLocal(COUPONS_STORAGE_KEY, coupons.filter((coupon) => coupon.id !== id));
      }),
      catchError((error) => this.isApiUnavailable(error) ? fallback() : throwError(() => error)),
    );
  }

  private isApiUnavailable(error: any): boolean {
    return (
      error?.status === 0 ||
      error?.status === 404 ||
      (error?.status === 200 && /parse|json/i.test(String(error?.message || '')))
    );
  }

  private readLocal<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      this.storeLocal(key, fallback);
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.storeLocal(key, fallback);
      return fallback;
    }
  }

  private storeLocal(key: string, value: unknown) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
