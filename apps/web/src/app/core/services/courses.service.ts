import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

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
  isPublished: boolean;
  modules: Module[];
}

const MOCK_COURSES: Course[] = [
  {
    id: 'mock-1',
    slug: 'mastering-agentic-ai',
    title: 'Mastering Agentic AI & Autonomous Workflows',
    subtitle: 'Build enterprise-grade multi-agent systems, tool-calling pipelines, and autonomous AI agents.',
    description: 'Deep dive into the architecture of modern AI agents using NestJS and Python.',
    thumbnail: '/assets/agentic-ai.jpg',
    price: 4999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations of Agentic Systems',
        order: 1,
        lessons: [
          { id: 'les-1', title: '1.1 Paradigm Shift: Chains vs Autonomous Agents', duration: 900, order: 1, isFreePreview: true },
          { id: 'les-2', title: '1.2 ReAct Framework & Thought-Action Loops', duration: 1200, order: 2, isFreePreview: false },
        ]
      }
    ]
  },
  {
    id: 'mock-2',
    slug: 'architectural-intelligence',
    title: 'Architectural Intelligence & Nx Monorepos',
    subtitle: 'Master enterprise software architecture, domain-driven design, and Nx monorepo patterns.',
    description: 'Learn how to structure complex enterprise applications for years of solo or team maintenance.',
    thumbnail: '/assets/architectural-intelligence.jpg',
    price: 3999,
    currency: 'INR',
    level: 'Intermediate',
    isPublished: true,
    modules: [
      {
        id: 'mod-2',
        title: 'Module 1: Domain-Driven Design in Monorepos',
        order: 1,
        lessons: [
          { id: 'les-3', title: '1.1 Monorepo Strategy: Apps vs Scope-Based Libraries', duration: 1000, order: 1, isFreePreview: true }
        ]
      }
    ]
  },
  {
    id: 'mock-3',
    slug: 'full-stack-saas-blueprint',
    title: 'Full-Stack SaaS Architecture & Payments',
    subtitle: 'Build, monetize, and scale production SaaS platforms with Razorpay and Lemon Squeezy.',
    description: 'A complete playbook for launching monetized membership platforms with Razorpay Autopay and Lemon Squeezy.',
    thumbnail: '/assets/saas-blueprint.jpg',
    price: 5999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    modules: [
      {
        id: 'mod-3',
        title: 'Module 1: Payment Gateways & RBI Compliance',
        order: 1,
        lessons: [
          { id: 'les-4', title: '1.1 Razorpay UPI Autopay & Pre-debit Notices', duration: 1600, order: 1, isFreePreview: true }
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

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>('/api/courses').pipe(
      catchError(() => of(MOCK_COURSES))
    );
  }

  getCourseBySlug(slug: string): Observable<Course> {
    return this.http.get<Course>(`/api/courses/${slug}`).pipe(
      catchError(() => {
        const found = MOCK_COURSES.find(c => c.slug === slug) || MOCK_COURSES[0];
        return of(found);
      })
    );
  }
}
