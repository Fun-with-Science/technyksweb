import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoAssetRef?: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail?: string;
  price: number;
  currency: string;
  level: string;
  status?: 'LIVE' | 'DRAFT' | 'BANNED';
  isPublished: boolean;
  earnedThisMonth?: number;
  enrollmentsThisMonth?: number;
  rating?: number;
  modules: Module[];
}

const STORAGE_KEY = 'technyks_courses_store';

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    slug: 'mastering-agentic-ai',
    title: 'Mastering Agentic AI & Autonomous Workflows',
    subtitle: 'Build enterprise-grade multi-agent systems, tool-calling pipelines, and autonomous AI agents.',
    description: 'Deep dive into the architecture of modern AI agents using NestJS and Python.',
    thumbnail: '/assets/agentic-ai.jpg',
    price: 4999,
    currency: 'INR',
    level: 'Advanced',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 149970,
    enrollmentsThisMonth: 30,
    rating: 4.85,
    modules: [
      {
        id: 'mod-1',
        title: 'Section 1: Course Overview & What You Will Build',
        order: 1,
        lessons: [
          { id: 'les-1', title: 'Lecture 1: Welcome to the Course & Architecture Map', duration: 900, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_1' },
          { id: 'les-2', title: 'Lecture 2: Paradigm Shift: Chains vs Autonomous Agents', duration: 1200, order: 2, isFreePreview: true, videoAssetRef: 'demo_video_2' },
          { id: 'les-3', title: 'Lecture 3: Join our Private Discord & GitHub Community', duration: 600, order: 3, isFreePreview: false, videoAssetRef: 'demo_video_3' },
          { id: 'les-4', title: 'Lecture 4: Explore More Premium Architecture Tracks', duration: 800, order: 4, isFreePreview: true, videoAssetRef: 'demo_video_4' }
        ]
      },
      {
        id: 'mod-2',
        title: 'Section 2: Multi-Agent Orchestration & ReAct Loops',
        order: 2,
        lessons: [
          { id: 'les-5', title: 'Lecture 5: ReAct Framework & Thought-Action Loops', duration: 1500, order: 1, isFreePreview: false, videoAssetRef: 'demo_video_5' },
          { id: 'les-6', title: 'Lecture 6: Tool Calling & Secure Function Execution', duration: 1800, order: 2, isFreePreview: false, videoAssetRef: 'demo_video_6' }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    slug: 'architectural-intelligence',
    title: 'Architectural Intelligence & Nx Monorepos',
    subtitle: 'Master enterprise software architecture, domain-driven design, and Nx monorepo patterns.',
    description: 'Learn how to structure complex enterprise applications for years of solo or team maintenance.',
    thumbnail: '/assets/architectural-intelligence.jpg',
    price: 3999,
    currency: 'INR',
    level: 'Intermediate',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 95976,
    enrollmentsThisMonth: 24,
    rating: 4.75,
    modules: [
      {
        id: 'mod-3',
        title: 'Section 1: Domain-Driven Design in Monorepos',
        order: 1,
        lessons: [
          { id: 'les-7', title: 'Lecture 1: Monorepo Strategy: Apps vs Scope-Based Libraries', duration: 1000, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_7' }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    slug: 'full-stack-saas-blueprint',
    title: 'Full-Stack SaaS Architecture & Payments',
    subtitle: 'Build, monetize, and scale production SaaS platforms with Razorpay and Lemon Squeezy.',
    description: 'A complete playbook for launching monetized membership platforms with Razorpay Autopay and Lemon Squeezy.',
    thumbnail: '/assets/saas-blueprint.jpg',
    price: 5999,
    currency: 'INR',
    level: 'Advanced',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 107982,
    enrollmentsThisMonth: 18,
    rating: 4.90,
    modules: [
      {
        id: 'mod-4',
        title: 'Section 1: Payment Gateways & RBI Compliance',
        order: 1,
        lessons: [
          { id: 'les-8', title: 'Lecture 1: Razorpay UPI Autopay & Pre-debit Notices', duration: 1600, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_8' }
        ]
      }
    ]
  }
];

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private http = inject(HttpClient);

  private getStoredCourses(): Course[] {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
    }
    return INITIAL_COURSES;
  }

  private saveStoredCourses(courses: Course[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>('/api/courses').pipe(
      catchError(() => of(this.getStoredCourses()))
    );
  }

  getCourseBySlug(slug: string): Observable<Course> {
    return this.http.get<Course>(`/api/courses/${slug}`).pipe(
      catchError(() => {
        const courses = this.getStoredCourses();
        const found = courses.find(c => c.slug === slug) || courses[0];
        return of(found);
      })
    );
  }

  getCourseById(id: string): Observable<Course> {
    const courses = this.getStoredCourses();
    const found = courses.find(c => c.id === id) || courses[0];
    return of(found);
  }

  saveCourse(course: Course): Observable<Course> {
    const courses = this.getStoredCourses();
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      courses[idx] = { ...course };
    } else {
      courses.unshift(course);
    }
    this.saveStoredCourses(courses);
    return of(course);
  }

  deleteCourse(id: string): Observable<boolean> {
    const courses = this.getStoredCourses().filter(c => c.id !== id);
    this.saveStoredCourses(courses);
    return of(true);
  }
}
