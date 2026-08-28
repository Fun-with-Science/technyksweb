import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminService } from './admin.service';

describe('AdminService - course deletion', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      isDbConnected: true,
      course: { delete: vi.fn().mockResolvedValue({ id: 'course_1' }) },
      payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      certificate: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      enrollment: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      $transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback(prisma)),
      inMemoryCourses: [],
      inMemoryEnrollments: [],
      inMemoryCertificates: [],
      inMemoryPayments: [],
    };
    service = new AdminService(prisma);
  });

  it('detaches payments and removes course-owned records before deleting a database course', async () => {
    await expect(service.deleteCourse('course_1')).resolves.toEqual({ success: true });

    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { courseId: 'course_1' },
      data: { courseId: null },
    });
    expect(prisma.certificate.deleteMany).toHaveBeenCalledWith({ where: { courseId: 'course_1' } });
    expect(prisma.enrollment.deleteMany).toHaveBeenCalledWith({ where: { courseId: 'course_1' } });
    expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: 'course_1' } });
  });

  it('removes the course and cleans related records in the local adapter', async () => {
    prisma.isDbConnected = false;
    prisma.inMemoryCourses = [{ id: 'course_1' }, { id: 'course_2' }];
    prisma.inMemoryEnrollments = [{ courseId: 'course_1' }, { courseId: 'course_2' }];
    prisma.inMemoryCertificates = [{ courseId: 'course_1' }];
    prisma.inMemoryPayments = [{ courseId: 'course_1', status: 'SUCCESS' }];

    await expect(service.deleteCourse('course_1')).resolves.toEqual({ success: true });

    expect(prisma.inMemoryCourses).toEqual([{ id: 'course_2' }]);
    expect(prisma.inMemoryEnrollments).toEqual([{ courseId: 'course_2' }]);
    expect(prisma.inMemoryCertificates).toEqual([]);
    expect(prisma.inMemoryPayments).toEqual([{ courseId: null, status: 'SUCCESS' }]);
  });
});
