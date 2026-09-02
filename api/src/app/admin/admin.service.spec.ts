import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminService } from './admin.service';

describe('AdminService - course deletion', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      isDbConnected: true,
      course: { update: vi.fn().mockResolvedValue({ id: 'course_1', isArchived: true }) },
      $transaction: vi.fn(
        async (callback: (transaction: any) => Promise<unknown>) =>
          callback(prisma),
      ),
      inMemoryCourses: [],
      inMemoryEnrollments: [],
      inMemoryCertificates: [],
      inMemoryPayments: [],
    };
    service = new AdminService(prisma);
  });

  it('archives a database course without destroying enrollment history', async () => {
    await expect(service.deleteCourse('course_1')).resolves.toEqual({
      success: true,
      deleted: true,
    });

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course_1' },
      data: { isArchived: true, isPublished: false },
    });
  });

  it('archives the course while retaining local enrollment and payment records', async () => {
    prisma.isDbConnected = false;
    prisma.inMemoryCourses = [{ id: 'course_1' }, { id: 'course_2' }];
    prisma.inMemoryEnrollments = [
      { courseId: 'course_1' },
      { courseId: 'course_2' },
    ];
    prisma.inMemoryCertificates = [{ courseId: 'course_1' }];
    prisma.inMemoryPayments = [{ courseId: 'course_1', status: 'SUCCESS' }];

    await expect(service.deleteCourse('course_1')).resolves.toEqual({
      success: true,
      deleted: true,
    });

    expect(prisma.inMemoryCourses[0]).toMatchObject({ id: 'course_1', isArchived: true, isPublished: false });
    expect(prisma.inMemoryEnrollments).toHaveLength(2);
    expect(prisma.inMemoryCertificates).toEqual([{ courseId: 'course_1' }]);
    expect(prisma.inMemoryPayments).toEqual([{ courseId: 'course_1', status: 'SUCCESS' }]);
  });

  it('treats a missing local course as an already-completed delete', async () => {
    prisma.isDbConnected = false;

    await expect(service.deleteCourse('missing_course')).resolves.toEqual({
      success: true,
      deleted: false,
    });
  });

  it('imports the complete JavaScript curriculum idempotently in the local adapter', async () => {
    prisma.isDbConnected = false;

    const first = await service.importJavascriptCourse();
    const second = await service.importJavascriptCourse();

    expect(first.id).toBe('course-javascript-2026');
    expect(first.modules).toHaveLength(12);
    expect(first.modules.flatMap((module: any) => module.lessons)).toHaveLength(
      81,
    );
    expect(second.id).toBe(first.id);
    expect(prisma.inMemoryCourses).toHaveLength(1);
  });

  it('creates, updates, and deletes a coupon through database operations', async () => {
    const coupon = { id: 'coupon_1', code: 'SAVE500', discountAmount: 500, scope: 'COURSE', courseId: 'course_1' };
    prisma.coupon = {
      create: vi.fn().mockResolvedValue(coupon),
      findUnique: vi.fn().mockResolvedValue(coupon),
      update: vi.fn().mockResolvedValue({ ...coupon, discountAmount: 600 }),
      delete: vi.fn().mockResolvedValue(coupon),
    };

    await expect(service.createCoupon({ code: 'save500', discountAmount: 500, scope: 'COURSE', courseId: 'course_1' })).resolves.toEqual(coupon);
    await expect(service.updateCoupon('coupon_1', { ...coupon, discountAmount: 600 })).resolves.toMatchObject({ discountAmount: 600 });
    await expect(service.deleteCoupon('coupon_1')).resolves.toEqual({ success: true });
    expect(prisma.coupon.create).toHaveBeenCalledOnce();
    expect(prisma.coupon.update).toHaveBeenCalledOnce();
    expect(prisma.coupon.delete).toHaveBeenCalledOnce();
  });

  it('creates and deletes an unused membership plan in the database', async () => {
    const plan = { id: 'plan_1', name: 'Team Monthly', slug: 'team-monthly', price: 2499, accessAllCourses: true, courseAccess: [] };
    prisma.membershipPlan = {
      create: vi.fn().mockResolvedValue(plan),
      delete: vi.fn().mockResolvedValue(plan),
    };
    prisma.subscription = { count: vi.fn().mockResolvedValue(0) };

    await expect(service.createMembershipPlan({ name: 'Team Monthly', slug: 'team-monthly', price: 2499, interval: 'MONTHLY', features: ['All courses'] })).resolves.toEqual(plan);
    await expect(service.deleteMembershipPlan('plan_1')).resolves.toEqual({ success: true });
  });
});
