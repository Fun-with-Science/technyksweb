import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const COURSE_INCLUDE = {
  modules: {
    include: { lessons: { orderBy: { order: 'asc' as const } } },
    orderBy: { order: 'asc' as const },
  },
};

const DEFAULT_COUPONS = [
  { id: 'c1', code: 'TECHNYKS50', discountPercent: 50, usageLimit: 100, timesUsed: 0, isActive: true },
  { id: 'c2', code: 'ARCH20', discountPercent: 20, usageLimit: 500, timesUsed: 0, isActive: true },
];

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getRevenueMetrics() {
    let payments: any[] = [];
    let activeSubscriptions = 0;
    let canceledSubscriptions = 0;
    let totalStudents = 0;

    if (this.prisma.isDbConnected) {
      try {
        payments = await this.prisma.payment.findMany({ where: { status: 'SUCCESS' }, include: { course: true } });
        activeSubscriptions = await this.prisma.subscription.count({ where: { status: 'ACTIVE' } });
        canceledSubscriptions = await this.prisma.subscription.count({ where: { status: 'CANCELED' } });
        totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });
      } catch {
        payments = this.prisma.inMemoryPayments.filter(payment => payment.status === 'SUCCESS');
        activeSubscriptions = this.prisma.inMemorySubscriptions.filter(subscription => subscription.status === 'ACTIVE').length;
        canceledSubscriptions = this.prisma.inMemorySubscriptions.filter(subscription => subscription.status === 'CANCELED').length;
        totalStudents = this.prisma.inMemoryUsers.filter(user => user.role === 'STUDENT').length;
      }
    } else {
      payments = this.prisma.inMemoryPayments.filter(payment => payment.status === 'SUCCESS');
      activeSubscriptions = this.prisma.inMemorySubscriptions.filter(subscription => subscription.status === 'ACTIVE').length;
      canceledSubscriptions = this.prisma.inMemorySubscriptions.filter(subscription => subscription.status === 'CANCELED').length;
      totalStudents = this.prisma.inMemoryUsers.filter(user => user.role === 'STUDENT').length;
    }

    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const courseSalesMap: Record<string, { title: string; count: number; totalAmount: number }> = {};
    for (const payment of payments) {
      const title = payment.course?.title || 'Membership Subscription';
      courseSalesMap[title] ??= { title, count: 0, totalAmount: 0 };
      courseSalesMap[title].count += 1;
      courseSalesMap[title].totalAmount += Number(payment.amount || 0);
    }

    const subscriptionCount = activeSubscriptions + canceledSubscriptions;
    const churnRate = subscriptionCount === 0
      ? '0%'
      : `${Math.round((canceledSubscriptions / subscriptionCount) * 100)}%`;

    return {
      totalRevenue: Math.round(totalRevenue),
      activeSubscriptions,
      churnRate,
      totalStudents,
      salesByCourse: Object.values(courseSalesMap),
    };
  }

  async searchStudents(query?: string) {
    const q = (query || '').toLowerCase().trim();
    let users: any[] = this.prisma.inMemoryUsers;
    let usingDatabaseUsers = false;

    if (this.prisma.isDbConnected) {
      try {
        users = await this.prisma.user.findMany({
          where: q ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          } : undefined,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: { select: { enrollments: true, subscriptions: true } },
          },
          orderBy: { createdAt: 'desc' },
        }) as any[];
        usingDatabaseUsers = true;
      } catch {
        // Keep using the in-memory adapter.
      }
    }

    const filteredUsers = usingDatabaseUsers
      ? users
      : users.filter(user => !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q));

    return filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || new Date(),
      _count: user._count || {
        enrollments: this.prisma.inMemoryEnrollments.filter(enrollment => enrollment.userId === user.id).length,
        subscriptions: this.prisma.inMemorySubscriptions.filter(subscription => subscription.userId === user.id).length,
      },
    }));
  }

  async getAllCourses() {
    let courses: any[];
    if (this.prisma.isDbConnected) {
      try {
        courses = await this.prisma.course.findMany({ include: COURSE_INCLUDE, orderBy: { createdAt: 'desc' } });
        return this.withCourseMetrics(courses);
      } catch {
        // Use the local adapter if the database becomes unavailable.
      }
    }

    courses = [...this.prisma.inMemoryCourses].sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return this.withCourseMetrics(courses);
  }

  async getCourseById(id: string) {
    if (this.prisma.isDbConnected) {
      try {
        const course = await this.prisma.course.findUnique({ where: { id }, include: COURSE_INCLUDE });
        if (course) return (await this.withCourseMetrics([course]))[0];
      } catch {
        // Use the local adapter if the database becomes unavailable.
      }
    }

    const course = this.prisma.inMemoryCourses.find(candidate => candidate.id === id);
    if (!course) throw new NotFoundException('Course not found.');
    return (await this.withCourseMetrics([course]))[0];
  }

  async createCourse(dto: any) {
    const fields = await this.normaliseCourse(dto);

    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.course.create({
          data: {
            slug: fields.slug,
            title: fields.title,
            subtitle: fields.subtitle,
            description: fields.description,
            thumbnail: fields.thumbnail,
            price: fields.price,
            currency: fields.currency,
            level: fields.level,
            isPublished: fields.isPublished,
            modules: { create: this.toPrismaModules(fields.modules) },
          } as any,
          include: COURSE_INCLUDE,
        });
      } catch {
        // Fall back to local persistence for development when PostgreSQL is unavailable.
      }
    }

    const course = {
      id: `course_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      ...fields,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.prisma.inMemoryCourses.unshift(course);
    return course;
  }

  async updateCourse(id: string, dto: any) {
    const current = await this.getCourseById(id);
    const fields = await this.normaliseCourse(dto, id, current);

    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.course.update({
          where: { id },
          data: {
            slug: fields.slug,
            title: fields.title,
            subtitle: fields.subtitle,
            description: fields.description,
            thumbnail: fields.thumbnail,
            price: fields.price,
            currency: fields.currency,
            level: fields.level,
            isPublished: fields.isPublished,
            modules: { deleteMany: {}, create: this.toPrismaModules(fields.modules) },
          } as any,
          include: COURSE_INCLUDE,
        });
      } catch {
        // Fall back to local persistence for development when PostgreSQL is unavailable.
      }
    }

    const index = this.prisma.inMemoryCourses.findIndex(course => course.id === id);
    if (index === -1) throw new NotFoundException('Course not found.');

    const updated = {
      ...current,
      ...fields,
      id,
      createdAt: current.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.prisma.inMemoryCourses[index] = updated;
    return updated;
  }

  async deleteCourse(id: string) {
    if (this.prisma.isDbConnected) {
      try {
        // Payments intentionally keep their audit history, but the optional
        // course relation must be detached before deleting the course. The
        // other course-owned records can be removed with the course.
        await this.prisma.$transaction(async (transaction) => {
          await transaction.payment.updateMany({ where: { courseId: id }, data: { courseId: null } });
          await transaction.certificate.deleteMany({ where: { courseId: id } });
          await transaction.enrollment.deleteMany({ where: { courseId: id } });
          await transaction.course.delete({ where: { id } });
        });
        return { success: true };
      } catch (error: any) {
        if (error?.code === 'P2025') throw new NotFoundException('Course not found.');
        throw new BadRequestException('Course could not be deleted.');
      }
    }

    const before = this.prisma.inMemoryCourses.length;
    this.prisma.inMemoryCourses = this.prisma.inMemoryCourses.filter(course => course.id !== id);
    if (before === this.prisma.inMemoryCourses.length) throw new NotFoundException('Course not found.');
    this.prisma.inMemoryEnrollments = this.prisma.inMemoryEnrollments.filter(enrollment => enrollment.courseId !== id);
    this.prisma.inMemoryCertificates = this.prisma.inMemoryCertificates.filter(certificate => certificate.courseId !== id);
    this.prisma.inMemoryPayments = this.prisma.inMemoryPayments.map(payment =>
      payment.courseId === id ? { ...payment, courseId: null } : payment
    );
    return { success: true };
  }

  async createCoupon(dto: any) {
    const code = String(dto.code || '').trim().toUpperCase();
    if (!code) throw new BadRequestException('Coupon code is required.');

    const data = {
      code,
      discountPercent: dto.discountPercent ? Number(dto.discountPercent) : null,
      discountAmount: dto.discountAmount ? Number(dto.discountAmount) : null,
      usageLimit: dto.usageLimit ? Number(dto.usageLimit) : null,
      timesUsed: 0,
      isActive: true,
    };

    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.coupon.create({ data: data as any });
      } catch {
        // Fall back to local persistence for development when PostgreSQL is unavailable.
      }
    }

    const coupon = {
      id: `coup_${Date.now().toString(36)}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.prisma.inMemoryCoupons.unshift(coupon);
    return coupon;
  }

  async getAllCoupons() {
    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
      } catch {
        // Use the local adapter if the database becomes unavailable.
      }
    }

    if (this.prisma.inMemoryCoupons.length === 0) {
      this.prisma.inMemoryCoupons = DEFAULT_COUPONS.map(coupon => ({ ...coupon, createdAt: new Date() }));
    }
    return this.prisma.inMemoryCoupons;
  }

  async deleteCoupon(id: string) {
    if (this.prisma.isDbConnected) {
      try {
        await this.prisma.coupon.delete({ where: { id } });
        return { success: true };
      } catch {
        // Fall back to local persistence for development when PostgreSQL is unavailable.
      }
    }

    this.prisma.inMemoryCoupons = this.prisma.inMemoryCoupons.filter(coupon => coupon.id !== id);
    return { success: true };
  }

  private async normaliseCourse(dto: any, existingId?: string, current?: any) {
    const title = String(dto.title ?? current?.title ?? '').trim();
    if (!title) throw new BadRequestException('Course title is required.');

    const price = Number(dto.price ?? current?.price ?? 0);
    if (!Number.isFinite(price) || price < 0) throw new BadRequestException('Course price must be a non-negative number.');

    const requestedSlug = String(dto.slug ?? current?.slug ?? title);
    const slug = await this.uniqueSlug(requestedSlug, existingId);
    const modules = this.normaliseModules(dto.modules ?? current?.modules ?? []);

    return {
      slug,
      title,
      subtitle: String(dto.subtitle ?? current?.subtitle ?? '').trim(),
      description: String(dto.description ?? current?.description ?? '').trim(),
      thumbnail: dto.thumbnail ?? current?.thumbnail ?? null,
      price,
      currency: String(dto.currency ?? current?.currency ?? 'INR').toUpperCase(),
      level: String(dto.level ?? current?.level ?? 'Intermediate'),
      isPublished: Boolean(dto.isPublished ?? (dto.status ? dto.status === 'LIVE' : current?.isPublished ?? false)),
      modules,
    };
  }

  private async withCourseMetrics(courses: any[]) {
    if (!courses.length) return courses;

    const courseIds = courses.map(course => course.id).filter(Boolean);
    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);

    let payments: any[] = [];
    let enrollments: any[] = [];

    if (this.prisma.isDbConnected) {
      try {
        [payments, enrollments] = await Promise.all([
          this.prisma.payment.findMany({
            where: {
              courseId: { in: courseIds },
              status: 'SUCCESS',
              createdAt: { gte: monthStart },
            },
            select: { courseId: true, amount: true, createdAt: true },
          }),
          this.prisma.enrollment.findMany({
            where: {
              courseId: { in: courseIds },
              createdAt: { gte: monthStart },
            },
            select: { courseId: true, createdAt: true },
          }),
        ]);
      } catch {
        payments = this.prisma.inMemoryPayments;
        enrollments = this.prisma.inMemoryEnrollments;
      }
    } else {
      payments = this.prisma.inMemoryPayments;
      enrollments = this.prisma.inMemoryEnrollments;
    }

    const revenueByCourse = new Map<string, number>();
    for (const payment of payments) {
      if (
        payment.courseId &&
        payment.status === 'SUCCESS' &&
        new Date(payment.createdAt || 0).getTime() >= monthStart.getTime()
      ) {
        revenueByCourse.set(
          payment.courseId,
          (revenueByCourse.get(payment.courseId) || 0) + Number(payment.amount || 0),
        );
      }
    }

    const enrollmentsByCourse = new Map<string, number>();
    for (const enrollment of enrollments) {
      if (
        enrollment.courseId &&
        new Date(enrollment.createdAt || 0).getTime() >= monthStart.getTime()
      ) {
        enrollmentsByCourse.set(
          enrollment.courseId,
          (enrollmentsByCourse.get(enrollment.courseId) || 0) + 1,
        );
      }
    }

    return courses.map(course => ({
      ...course,
      // Ratings are intentionally zero until a real reviews data source exists.
      rating: 0,
      earnedThisMonth: Math.round(revenueByCourse.get(course.id) || 0),
      enrollmentsThisMonth: enrollmentsByCourse.get(course.id) || 0,
    }));
  }

  private normaliseModules(modules: any[]) {
    return (Array.isArray(modules) ? modules : []).map((module, moduleIndex) => ({
      id: module.id || `module_${Date.now().toString(36)}_${moduleIndex + 1}`,
      title: String(module.title || `Section ${moduleIndex + 1}`).trim(),
      order: moduleIndex + 1,
      lessons: (Array.isArray(module.lessons) ? module.lessons : []).map((lesson: any, lessonIndex: number) => ({
          id: lesson.id || `lesson_${Date.now().toString(36)}_${moduleIndex + 1}_${lessonIndex + 1}`,
          title: String(lesson.title || `Lecture ${lessonIndex + 1}`).trim(),
          description: lesson.description ? String(lesson.description) : null,
          videoAssetRef: this.cleanVideoAssetRef(lesson.videoAssetRef),
          duration: Math.max(0, Number(lesson.duration) || 0),
          order: lessonIndex + 1,
          isFreePreview: Boolean(lesson.isFreePreview),
        })),
    }));
  }

  private toPrismaModules(modules: any[]) {
    return modules.map(module => ({
      title: module.title,
      order: module.order,
      lessons: {
        create: (module.lessons || []).map((lesson: any) => ({
          title: lesson.title,
          description: lesson.description,
          videoAssetRef: lesson.videoAssetRef,
          duration: lesson.duration,
          order: lesson.order,
          isFreePreview: lesson.isFreePreview,
        })),
      },
    }));
  }

  private async uniqueSlug(value: string, existingId?: string) {
    const base = this.slugify(value) || `course-${Date.now().toString(36)}`;
    let slug = base;
    let suffix = 2;
    while (await this.slugExists(slug, existingId)) slug = `${base}-${suffix++}`;
    return slug;
  }

  private async slugExists(slug: string, existingId?: string) {
    if (this.prisma.isDbConnected) {
      try {
        const existing = await this.prisma.course.findUnique({ where: { slug }, select: { id: true } });
        return Boolean(existing && existing.id !== existingId);
      } catch {
        // Check the local adapter below.
      }
    }
    return this.prisma.inMemoryCourses.some(course => course.slug === slug && course.id !== existingId);
  }

  private slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private cleanVideoAssetRef(value: unknown): string | null {
    const ref = String(value || '').trim();
    return ref && !/^demo(?:[_-]|$)/i.test(ref) ? ref : null;
  }
}
