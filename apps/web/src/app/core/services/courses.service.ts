import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, BehaviorSubject, tap, defer, throwError } from 'rxjs';

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

const STORAGE_KEY = 'technyks_courses_store_v2';
const LEGACY_STORAGE_KEY = 'technyks_courses_store';
const METRICS_MIGRATION_KEY = 'technyks_course_metrics_v1';

const REAL_PRODUCTION_COURSES: Course[] = [
  {
    id: 'course-n8n-1',
    slug: 'ai-automation-engineer-n8n',
    title: 'AI Automation Engineer — Zero to Industry-Ready with n8n',
    subtitle: 'Build AI Agents, RAG Pipelines & MCP Systems in n8n — 11 Real Projects, Production Security & Industry-Grade Skills',
    description: 'Most n8n courses teach you to build workflows. This one teaches you to build systems that work when you are not watching. The AI automation market is exploding in 2026. Engineers who understand Agents, RAG, and MCP are landing high-paying clients and charging rates that traditional developers cannot compete with. In 9 sections and 70 plus lectures, you go from complete beginner to deploying AI systems that real businesses run on.',
    thumbnail: '/assets/agentic-ai.jpg',
    price: 4999,
    currency: 'INR',
    level: 'Advanced',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 0,
    enrollmentsThisMonth: 0,
    rating: 0,
    modules: [
      {
        id: 'sec-1',
        title: 'Section 1: Course Overview & What You Will Build',
        order: 1,
        lessons: [
          { id: 'les-1', title: 'Lecture 1: Welcome to the Course', duration: 900, order: 1, isFreePreview: true },
          { id: 'les-2', title: 'Lecture 2: Course Overview & System Schematics', duration: 1200, order: 2, isFreePreview: true },
          { id: 'les-3', title: 'Lecture 3: Join our Discord and Youtube Community', duration: 600, order: 3, isFreePreview: false },
          { id: 'les-4', title: 'Lecture 4: Explore More Premium Courses', duration: 800, order: 4, isFreePreview: true }
        ]
      },
      {
        id: 'sec-2',
        title: 'Section 2: Automation Foundations',
        order: 2,
        lessons: [
          { id: 'les-5', title: 'Lecture 5: What is N8N and Why It Wins', duration: 1400, order: 1, isFreePreview: true },
          { id: 'les-6', title: 'Lecture 6: Understanding Automation vs Manual Work', duration: 1600, order: 2, isFreePreview: true }
        ]
      }
    ]
  },
  {
    id: 'course-vibe-2',
    slug: 'vibe-coding-foundation',
    title: 'Vibe Coding Foundation: Build Production SaaS Apps with AI',
    subtitle: 'Learn Next-Gen AI-Assisted Engineering, Spec-Driven Development & Rapid Prototyping',
    description: 'Supercharge your developer velocity using modern AI coding assistants, prompt-driven architecture, and automated test generators to ship production SaaS products 10x faster.',
    thumbnail: '/assets/saas-blueprint.jpg',
    price: 7900,
    currency: 'INR',
    level: 'Beginner',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 0,
    enrollmentsThisMonth: 0,
    rating: 0,
    modules: [
      {
        id: 'sec-3',
        title: 'Section 1: AI Prompting & Spec-Driven Development',
        order: 1,
        lessons: [
          { id: 'les-7', title: 'Lecture 1: Introduction to Vibe Coding', duration: 900, order: 1, isFreePreview: true },
          { id: 'les-8', title: 'Lecture 2: Spec-Driven Prompts for Full-Stack Apps', duration: 1100, order: 2, isFreePreview: true }
        ]
      }
    ]
  },
  {
    id: 'course-agent-3',
    slug: 'agentic-ai-full-stack-masterclass',
    title: 'Agentic AI Full-Stack Masterclass: RAG, MCP & AI Agents',
    subtitle: 'Build Production SaaS Apps with AI, Multi-Agent Systems, LangChain, NestJS & Angular 19',
    description: 'Master the architecture of autonomous LLM agents, tool-calling pipelines, vector database RAG search (Pinecone & Qdrant), and Model Context Protocol (MCP). Built for senior full-stack developers looking to lead AI engineering teams.',
    thumbnail: '/assets/agentic-ai.jpg',
    price: 7900,
    currency: 'INR',
    level: 'Advanced',
    status: 'LIVE',
    isPublished: true,
    earnedThisMonth: 0,
    enrollmentsThisMonth: 0,
    rating: 0,
    modules: [
      {
        id: 'sec-4',
        title: 'Section 1: Multi-Agent Orchestration & ReAct Loops',
        order: 1,
        lessons: [
          { id: 'les-9', title: 'Lecture 1: ReAct Framework & Thought-Action Loops', duration: 1500, order: 1, isFreePreview: true }
        ]
      }
    ]
  },
  {
    id: 'course-mern-4',
    slug: 'ai-engineering-rag-mcp-mern',
    title: 'AI Engineering: RAG, MCP & Full Stack Apps with MERN',
    subtitle: 'Full-Stack MERN + RAG Vector Search & MCP Tool Integration',
    description: 'Build scalable full-stack applications with MongoDB, Express, React, Node.js, combined with modern RAG vector embeddings and MCP tools.',
    thumbnail: '/assets/architectural-intelligence.jpg',
    price: 3999,
    currency: 'INR',
    level: 'Intermediate',
    status: 'DRAFT',
    isPublished: false,
    earnedThisMonth: 0,
    enrollmentsThisMonth: 0,
    rating: 0,
    modules: [
      {
        id: 'sec-5',
        title: 'Section 1: MERN Stack Architecture Overview',
        order: 1,
        lessons: [
          { id: 'les-10', title: 'Lecture 1: MERN Architecture in 2026', duration: 1000, order: 1, isFreePreview: true }
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
  private coursesSubject = new BehaviorSubject<Course[]>(this.getStoredCourses());

  courses$ = this.coursesSubject.asObservable();

  private getStoredCourses(): Course[] {
    if (typeof localStorage !== 'undefined') {
      const storedByKey = [STORAGE_KEY, LEGACY_STORAGE_KEY].map(key => {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        try {
          const stored = JSON.parse(raw);
          return Array.isArray(stored) ? stored : [];
        } catch {
          return [];
        }
      });
      const resetLegacyMetrics = localStorage.getItem(METRICS_MIGRATION_KEY) !== '1';
      const stored = storedByKey.flat().map(course => this.normaliseCourse({
        ...course,
        ...(resetLegacyMetrics ? {
          earnedThisMonth: 0,
          rating: 0,
        } : {}),
      }));
      if (resetLegacyMetrics) localStorage.setItem(METRICS_MIGRATION_KEY, '1');
      const unique = stored.filter((course, index, all) => all.findIndex(candidate =>
        candidate.id === course.id || candidate.slug === course.slug
      ) === index);
      if (unique.length) {
        // Migrate older browser sessions so drafts created by the previous
        // admin panel are not lost when the new roster is loaded.
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
        return unique;
      }
      const seeded = REAL_PRODUCTION_COURSES.map(course => this.normaliseCourse(course));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return REAL_PRODUCTION_COURSES.map(course => this.normaliseCourse(course));
  }

  private saveStoredCourses(courses: Course[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
    this.coursesSubject.next(courses);
  }

  getCourses(includeDrafts = false): Observable<Course[]> {
    const fallback = () => {
      const courses = this.getStoredCourses();
      return includeDrafts ? courses : courses.filter(course => course.status === 'LIVE' || course.isPublished);
    };
    const request$ = includeDrafts
      ? this.http.get<any[]>('/api/admin/courses')
      : this.http.get<any[]>('/api/courses');

    return defer(() => typeof window === 'undefined' ? of(fallback()) : request$).pipe(
      map(courses => {
        const normalised = courses.map(course => this.normaliseCourse(course));
        return includeDrafts ? this.mergeAdminDrafts(normalised) : normalised;
      }),
      tap(courses => this.cacheCourses(courses)),
      catchError(() => of(fallback()))
    );
  }

  getAllCoursesAdmin(): Observable<Course[]> {
    return this.getCourses(true);
  }

  getCourseBySlug(slug: string): Observable<Course> {
    const fallback = () => {
      const found = this.getStoredCourses().find(course => course.slug === slug && (course.isPublished || course.status === 'LIVE'));
      return found ? of(found) : throwError(() => new Error('Course not found'));
    };

    return defer(() => typeof window === 'undefined'
      ? fallback()
      : this.http.get<any>(`/api/courses/${encodeURIComponent(slug)}`)
    ).pipe(
      map(course => this.normaliseCourse(course)),
      tap(course => this.cacheCourses([course])),
      catchError(() => fallback())
    );
  }

  getCourseById(id: string): Observable<Course> {
    const fallback = () => {
      const found = this.getStoredCourses().find(course => course.id === id);
      return found ? of(found) : throwError(() => new Error('Course not found'));
    };

    return defer(() => typeof window === 'undefined'
      ? fallback()
      : this.http.get<any>(`/api/admin/courses/${encodeURIComponent(id)}`)
    ).pipe(
      map(course => this.normaliseCourse(course)),
      tap(course => this.cacheCourses([course])),
      catchError(() => fallback())
    );
  }

  saveCourse(course: Course): Observable<Course> {
    const prepared = this.normaliseCourse({
      ...course,
      status: course.status || (course.isPublished ? 'LIVE' : 'DRAFT'),
    });
    const fallback = () => {
      const courses = this.getStoredCourses();
      const idx = courses.findIndex(candidate => candidate.id === prepared.id);
      if (idx !== -1) courses[idx] = prepared;
      else courses.unshift(prepared);
      this.saveStoredCourses(courses);
      return of(prepared);
    };

    return defer(() => typeof window === 'undefined'
      ? fallback()
      : this.http.patch<any>(`/api/admin/courses/${encodeURIComponent(prepared.id)}`, prepared)
    ).pipe(
      map(saved => this.normaliseCourse(saved)),
      tap(saved => this.cacheCourses([saved])),
      catchError(() => fallback())
    );
  }

  createCourse(payload: Partial<Course>): Observable<Course> {
    const localCourse = this.normaliseCourse({
      ...payload,
      id: payload.id || `course-${Date.now()}`,
      status: payload.status || 'DRAFT',
      isPublished: payload.status === 'LIVE',
      createdAt: (payload as Course & { createdAt?: string }).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const fallback = () => {
      const courses = this.getStoredCourses().filter(course => course.id !== localCourse.id);
      courses.unshift(localCourse);
      this.saveStoredCourses(courses);
      return of(localCourse);
    };

    return defer(() => typeof window === 'undefined'
      ? fallback()
      : this.http.post<any>('/api/admin/courses', payload)
    ).pipe(
      map(created => this.normaliseCourse(created)),
      tap(created => this.cacheCourses([created])),
      catchError(() => fallback())
    );
  }

  deleteCourse(id: string): Observable<boolean> {
    const fallback = () => {
      const courses = this.getStoredCourses().filter(course => course.id !== id);
      this.saveStoredCourses(courses);
      return of(true);
    };

    return defer(() => typeof window === 'undefined'
      ? fallback()
      : this.http.delete(`/api/admin/courses/${encodeURIComponent(id)}`)
    ).pipe(
      map(() => true),
      tap(() => this.saveStoredCourses(this.getStoredCourses().filter(course => course.id !== id))),
      catchError((error) => error?.status === 0 ? fallback() : throwError(() => error))
    );
  }

  private cacheCourses(courses: Course[]) {
    if (!courses.length) return;
    const current = this.getStoredCourses();
    for (const course of courses) {
      const index = current.findIndex(candidate => candidate.id === course.id);
      if (index === -1) current.unshift(course);
      else current[index] = course;
    }
    this.saveStoredCourses(current);
  }

  private mergeAdminDrafts(serverCourses: Course[]): Course[] {
    const serverIds = new Set(serverCourses.map(course => course.id));
    const localDrafts = this.getStoredCourses().filter(course => !course.isPublished && course.status === 'DRAFT');
    return [
      ...localDrafts.filter(course => !serverIds.has(course.id)),
      ...serverCourses,
    ];
  }

  private normaliseCourse(course: any): Course {
    const status = course.status || (course.isPublished ? 'LIVE' : 'DRAFT');
    return {
      ...course,
      id: course.id,
      slug: course.slug || this.slugify(course.title || 'new-course'),
      title: course.title || 'Untitled Course',
      subtitle: course.subtitle || '',
      description: course.description || '',
      price: Number(course.price || 0),
      currency: course.currency || 'INR',
      level: course.level || 'Intermediate',
      status,
      isPublished: status === 'LIVE',
      earnedThisMonth: Number(course.earnedThisMonth ?? 0),
      enrollmentsThisMonth: Number(course.enrollmentsThisMonth ?? 0),
      rating: Number(course.rating ?? 0),
      modules: (course.modules || []).map((module: any, moduleIndex: number) => ({
        ...module,
        id: module.id || `module-${moduleIndex + 1}`,
        title: module.title || `Section ${moduleIndex + 1}`,
        order: moduleIndex + 1,
        lessons: (module.lessons || []).map((lesson: any, lessonIndex: number) => ({
          ...lesson,
          id: lesson.id || `lesson-${moduleIndex + 1}-${lessonIndex + 1}`,
          title: lesson.title || `Lecture ${lessonIndex + 1}`,
          videoAssetRef: this.cleanVideoAssetRef(lesson.videoAssetRef),
          duration: Number(lesson.duration || 0),
          order: lessonIndex + 1,
          isFreePreview: Boolean(lesson.isFreePreview),
        })),
      })),
    };
  }

  private slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private cleanVideoAssetRef(value: unknown): string | undefined {
    const ref = String(value || '').trim();
    return ref && !/^demo(?:[_-]|$)/i.test(ref) ? ref : undefined;
  }
}
