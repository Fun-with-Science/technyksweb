import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const INITIAL_COURSES = [
  {
    id: 'course_1',
    slug: 'mastering-agentic-ai',
    title: 'Mastering Agentic AI & Autonomous Workflows',
    subtitle: 'Build enterprise-grade multi-agent systems, tool-calling pipelines, and autonomous AI agents.',
    description: 'Deep dive into the architecture of modern AI agents. Learn state management, tool execution, long-term memory, fallback routines, and multi-agent coordination using NestJS and Python.',
    price: 4999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    thumbnail: '/assets/agentic-ai.jpg',
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Foundations of Agentic Systems',
        order: 1,
        lessons: [
          { id: 'les_1', title: '1.1 Paradigm Shift: Chains vs Autonomous Agents', duration: 900, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_1' },
          { id: 'les_2', title: '1.2 ReAct Framework & Thought-Action Loops', duration: 1200, order: 2, isFreePreview: false, videoAssetRef: 'demo_video_2' },
          { id: 'les_3', title: '1.3 Tool Calling Specs & Schema Enforcement', duration: 1500, order: 3, isFreePreview: false, videoAssetRef: 'demo_video_3' },
        ]
      },
      {
        id: 'mod_2',
        title: 'Module 2: Multi-Agent Orchestration & Memory',
        order: 2,
        lessons: [
          { id: 'les_4', title: '2.1 Supervisor & Hierarchical Agent Topologies', duration: 1800, order: 1, isFreePreview: false, videoAssetRef: 'demo_video_4' },
          { id: 'les_5', title: '2.2 Vector Databases, Semantic Search & Epistemic Memory', duration: 2100, order: 2, isFreePreview: false, videoAssetRef: 'demo_video_5' },
        ]
      }
    ]
  },
  {
    id: 'course_2',
    slug: 'architectural-intelligence',
    title: 'Architectural Intelligence & Nx Monorepos',
    subtitle: 'Master enterprise software architecture, domain-driven design, and Nx monorepo patterns.',
    description: 'Learn how to structure complex enterprise applications for years of solo or team maintenance. Master Nx boundaries, domain isolation, Angular signals, and resilient NestJS backends.',
    price: 3999,
    currency: 'INR',
    level: 'Intermediate',
    isPublished: true,
    thumbnail: '/assets/architectural-intelligence.jpg',
    modules: [
      {
        id: 'mod_3',
        title: 'Module 1: Domain-Driven Design in Monorepos',
        order: 1,
        lessons: [
          { id: 'les_6', title: '1.1 Monorepo Strategy: Apps vs Scope-Based Libraries', duration: 1000, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_6' },
          { id: 'les_7', title: '1.2 Module Boundaries & Dependency Linting Rules', duration: 1400, order: 2, isFreePreview: false, videoAssetRef: 'demo_video_7' },
        ]
      }
    ]
  },
  {
    id: 'course_3',
    slug: 'full-stack-saas-blueprint',
    title: 'Full-Stack SaaS Architecture & Payments',
    subtitle: 'Build, monetize, and scale production SaaS platforms with Razorpay and Lemon Squeezy.',
    description: 'A complete playbook for launching monetized membership platforms. Covers Razorpay Subscriptions (e-mandate / UPI Autopay), Lemon Squeezy Merchant-of-Record integration, JWT auth, and tokenized video hosting.',
    price: 5999,
    currency: 'INR',
    level: 'Advanced',
    isPublished: true,
    thumbnail: '/assets/saas-blueprint.jpg',
    modules: [
      {
        id: 'mod_4',
        title: 'Module 1: Payment Gateways & RBI Compliance',
        order: 1,
        lessons: [
          { id: 'les_8', title: '1.1 Razorpay UPI Autopay & Pre-debit Notices', duration: 1600, order: 1, isFreePreview: true, videoAssetRef: 'demo_video_8' },
          { id: 'les_9', title: '1.2 Lemon Squeezy MoR & Global Tax Calculation', duration: 1500, order: 2, isFreePreview: false, videoAssetRef: 'demo_video_9' },
        ]
      }
    ]
  }
];

@Injectable()
export class CoursesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.prisma.inMemoryCourses = [...INITIAL_COURSES];
  }

  async findAllPublished() {
    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.course.findMany({
          where: { isPublished: true },
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true, title: true, duration: true, isFreePreview: true, order: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        return this.prisma.inMemoryCourses;
      }
    }
    return this.prisma.inMemoryCourses;
  }

  async findBySlug(slug: string) {
    if (this.prisma.isDbConnected) {
      try {
        const course = await this.prisma.course.findUnique({
          where: { slug },
          include: {
            modules: {
              include: { lessons: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' }
            }
          }
        });
        if (course) return course;
      } catch (e) {
        // Fallback to in-memory
      }
    }

    const found = this.prisma.inMemoryCourses.find(c => c.slug === slug);
    if (!found) {
      throw new NotFoundException(`Course with slug "${slug}" not found.`);
    }
    return found;
  }
}
