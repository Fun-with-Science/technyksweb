import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, BehaviorSubject } from 'rxjs';

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
    earnedThisMonth: 6315,
    enrollmentsThisMonth: 24,
    rating: 4.57,
    modules: [
      {
        id: 'sec-1',
        title: 'Section 1: Course Overview & What You Will Build',
        order: 1,
        lessons: [
          { id: 'les-1', title: 'Lecture 1: Welcome to the Course', duration: 900, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_1' },
          { id: 'les-2', title: 'Lecture 2: Course Overview & System Schematics', duration: 1200, order: 2, isFreePreview: true, videoAssetRef: 'demo_video_2' },
          { id: 'les-3', title: 'Lecture 3: Join our Discord and Youtube Community', duration: 600, order: 3, isFreePreview: false, videoAssetRef: 'demo_video_3' },
          { id: 'les-4', title: 'Lecture 4: Explore More Premium Courses', duration: 800, order: 4, isFreePreview: true, videoAssetRef: 'demo_video_4' }
        ]
      },
      {
        id: 'sec-2',
        title: 'Section 2: Automation Foundations',
        order: 2,
        lessons: [
          { id: 'les-5', title: 'Lecture 5: What is N8N and Why It Wins', duration: 1400, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_5' },
          { id: 'les-6', title: 'Lecture 6: Understanding Automation vs Manual Work', duration: 1600, order: 2, isFreePreview: true, videoAssetRef: 'demo_video_6' }
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
    earnedThisMonth: 1775,
    enrollmentsThisMonth: 37,
    rating: 4.53,
    modules: [
      {
        id: 'sec-3',
        title: 'Section 1: AI Prompting & Spec-Driven Development',
        order: 1,
        lessons: [
          { id: 'les-7', title: 'Lecture 1: Introduction to Vibe Coding', duration: 900, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_7' },
          { id: 'les-8', title: 'Lecture 2: Spec-Driven Prompts for Full-Stack Apps', duration: 1100, order: 2, isFreePreview: true, videoAssetRef: 'demo_video_8' }
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
    earnedThisMonth: 8002,
    enrollmentsThisMonth: 72,
    rating: 4.61,
    modules: [
      {
        id: 'sec-4',
        title: 'Section 1: Multi-Agent Orchestration & ReAct Loops',
        order: 1,
        lessons: [
          { id: 'les-9', title: 'Lecture 1: ReAct Framework & Thought-Action Loops', duration: 1500, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_9' }
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
    rating: 4.50,
    modules: [
      {
        id: 'sec-5',
        title: 'Section 1: MERN Stack Architecture Overview',
        order: 1,
        lessons: [
          { id: 'les-10', title: 'Lecture 1: MERN Architecture in 2026', duration: 1000, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_10' }
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(REAL_PRODUCTION_COURSES));
    }
    return REAL_PRODUCTION_COURSES;
  }

  private saveStoredCourses(courses: Course[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
    this.coursesSubject.next(courses);
  }

  getCourses(includeDrafts = false): Observable<Course[]> {
    return of(this.getStoredCourses()).pipe(
      map(courses => includeDrafts ? courses : courses.filter(c => c.status === 'LIVE' || c.isPublished))
    );
  }

  getAllCoursesAdmin(): Observable<Course[]> {
    return of(this.getStoredCourses());
  }

  getCourseBySlug(slug: string): Observable<Course> {
    const courses = this.getStoredCourses();
    const found = courses.find(c => c.slug === slug) || courses[0];
    return of(found);
  }

  getCourseById(id: string): Observable<Course> {
    const courses = this.getStoredCourses();
    const found = courses.find(c => c.id === id) || courses[0];
    return of(found);
  }

  saveCourse(course: Course): Observable<Course> {
    const courses = this.getStoredCourses();
    // Ensure slug is clean
    if (!course.slug) {
      course.slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    course.isPublished = course.status === 'LIVE';

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
