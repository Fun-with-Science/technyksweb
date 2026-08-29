import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JAVASCRIPT_COURSE } from './javascript-course.data';

const INITIAL_COURSES = [
  JAVASCRIPT_COURSE,
  {
    id: 'course_1',
    slug: 'mastering-agentic-ai',
    title: 'Mastering Agentic AI & Autonomous Workflows',
    subtitle:
      'Build enterprise-grade multi-agent systems, tool-calling pipelines, and autonomous AI agents.',
    description:
      'Deep dive into the architecture of modern AI agents. Learn state management, tool execution, long-term memory, fallback routines, and multi-agent coordination using NestJS and Python.',
    price: 4999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    thumbnail: '/assets/course-agentic-ai.png',
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Foundations of Agentic Systems',
        order: 1,
        lessons: [
          {
            id: 'les_1',
            title: '1.1 Paradigm Shift: Chains vs Autonomous Agents',
            duration: 900,
            order: 1,
            isFreePreview: true,
            videoAssetRef: null,
          },
          {
            id: 'les_2',
            title: '1.2 ReAct Framework & Thought-Action Loops',
            duration: 1200,
            order: 2,
            isFreePreview: false,
            videoAssetRef: null,
          },
          {
            id: 'les_3',
            title: '1.3 Tool Calling Specs & Schema Enforcement',
            duration: 1500,
            order: 3,
            isFreePreview: false,
            videoAssetRef: null,
          },
        ],
      },
      {
        id: 'mod_2',
        title: 'Module 2: Multi-Agent Orchestration & Memory',
        order: 2,
        lessons: [
          {
            id: 'les_4',
            title: '2.1 Supervisor & Hierarchical Agent Topologies',
            duration: 1800,
            order: 1,
            isFreePreview: false,
            videoAssetRef: null,
          },
          {
            id: 'les_5',
            title: '2.2 Vector Databases, Semantic Search & Epistemic Memory',
            duration: 2100,
            order: 2,
            isFreePreview: false,
            videoAssetRef: null,
          },
        ],
      },
    ],
  },
  {
    id: 'course_2',
    slug: 'architectural-intelligence',
    title: 'Architectural Intelligence & Nx Monorepos',
    subtitle:
      'Master enterprise software architecture, domain-driven design, and Nx monorepo patterns.',
    description:
      'Learn how to structure complex enterprise applications for years of solo or team maintenance. Master Nx boundaries, domain isolation, Angular signals, and resilient NestJS backends.',
    price: 3999,
    currency: 'INR',
    level: 'Intermediate',
    isPublished: true,
    thumbnail: '/assets/course-mern-rag.png',
    modules: [
      {
        id: 'mod_3',
        title: 'Module 1: Domain-Driven Design in Monorepos',
        order: 1,
        lessons: [
          {
            id: 'les_6',
            title: '1.1 Monorepo Strategy: Apps vs Scope-Based Libraries',
            duration: 1000,
            order: 1,
            isFreePreview: true,
            videoAssetRef: null,
          },
          {
            id: 'les_7',
            title: '1.2 Module Boundaries & Dependency Linting Rules',
            duration: 1400,
            order: 2,
            isFreePreview: false,
            videoAssetRef: null,
          },
        ],
      },
    ],
  },
  {
    id: 'course_3',
    slug: 'full-stack-saas-blueprint',
    title: 'Full-Stack SaaS Architecture & Payments',
    subtitle:
      'Build, monetize, and scale production SaaS platforms with Razorpay and Lemon Squeezy.',
    description:
      'A complete playbook for launching monetized membership platforms. Covers Razorpay Subscriptions (e-mandate / UPI Autopay), Lemon Squeezy Merchant-of-Record integration, JWT auth, and tokenized video hosting.',
    price: 5999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    thumbnail: '/assets/course-vibe-coding.png',
    modules: [
      {
        id: 'mod_4',
        title: 'Module 1: Payment Gateways & RBI Compliance',
        order: 1,
        lessons: [
          {
            id: 'les_8',
            title: '1.1 Razorpay UPI Autopay & Pre-debit Notices',
            duration: 1600,
            order: 1,
            isFreePreview: true,
            videoAssetRef: null,
          },
          {
            id: 'les_9',
            title: '1.2 Lemon Squeezy MoR & Global Tax Calculation',
            duration: 1500,
            order: 2,
            isFreePreview: false,
            videoAssetRef: null,
          },
        ],
      },
    ],
  },
];

@Injectable()
export class CoursesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (this.prisma.inMemoryCourses.length === 0) {
      this.prisma.inMemoryCourses = INITIAL_COURSES.map((course) => ({
        ...course,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    } else {
      const javascriptCourse = INITIAL_COURSES.find(
        (course) => course.id === 'course-javascript-2026',
      );
      if (
        javascriptCourse &&
        !this.prisma.inMemoryCourses.some(
          (course) => course.id === javascriptCourse.id,
        )
      ) {
        this.prisma.inMemoryCourses.unshift({
          ...javascriptCourse,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (this.prisma.isDbConnected) {
      try {
        const courseCount = await this.prisma.course.count();
        const coursesToSeed =
          courseCount === 0
            ? INITIAL_COURSES
            : INITIAL_COURSES.filter(
                (course) => course.id === 'course-javascript-2026',
              );
        for (const course of coursesToSeed) {
          const existing = await this.prisma.course.findUnique({
            where: { id: course.id },
            select: { id: true },
          });
          if (existing) continue;
          await this.prisma.course.create({
            data: {
              id: course.id,
              slug: course.slug,
              title: course.title,
              subtitle: course.subtitle,
              description: course.description,
              thumbnail: course.thumbnail,
              price: course.price,
              currency: course.currency,
              level: course.level,
              isPublished: course.isPublished,
              modules: {
                create: course.modules.map((module) => ({
                  id: module.id,
                  title: module.title,
                  order: module.order,
                  lessons: {
                    create: module.lessons.map((lesson) => ({
                      id: lesson.id,
                      title: lesson.title,
                      duration: lesson.duration,
                      order: lesson.order,
                      isFreePreview: lesson.isFreePreview,
                      videoAssetRef: lesson.videoAssetRef,
                    })),
                  },
                })),
              },
            } as any,
          });
        }
      } catch {
        // Keep the application available through the local adapter during a transient DB failure.
      }
    }
  }

  async findAllPublished() {
    if (this.prisma.isDbConnected) {
      try {
        const courses = await this.prisma.course.findMany({
          where: { isPublished: true },
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    duration: true,
                    isFreePreview: true,
                    order: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        return courses.map((course) => this.toPublicCourse(course));
      } catch (e) {
        return this.prisma.inMemoryCourses
          .filter((course) => course.isPublished)
          .map((course) => this.toPublicCourse(course));
      }
    }
    return this.prisma.inMemoryCourses
      .filter((course) => course.isPublished)
      .map((course) => this.toPublicCourse(course));
  }

  async findBySlug(slug: string) {
    if (this.prisma.isDbConnected) {
      try {
        const course = await this.prisma.course.findUnique({
          where: { slug, isPublished: true },
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    duration: true,
                    isFreePreview: true,
                    order: true,
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        });
        if (course) return this.toPublicCourse(course);
      } catch (e) {
        // Fallback to in-memory
      }
    }

    const found = this.prisma.inMemoryCourses.find(
      (c) => c.slug === slug && c.isPublished,
    );
    if (!found) {
      throw new NotFoundException(`Course with slug "${slug}" not found.`);
    }
    return this.toPublicCourse(found);
  }

  private toPublicCourse(course: any) {
    return {
      ...course,
      modules: (course.modules || []).map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).map((lesson: any) => {
          const { videoAssetRef: _privateVideoAssetRef, ...publicLesson } =
            lesson;
          return publicLesson;
        }),
      })),
    };
  }
}
