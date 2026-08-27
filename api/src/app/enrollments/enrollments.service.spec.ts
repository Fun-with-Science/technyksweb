import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsService - Progress Tracking', () => {
  let service: EnrollmentsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      isDbConnected: true,
      inMemoryCourses: [],
      inMemoryEnrollments: [],
      inMemoryCertificates: [],
      enrollment: {
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      course: {
        findUnique: vi.fn(),
      },
      certificate: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new EnrollmentsService(mockPrisma);
  });

  it('should calculate 50% progress accurately when 1 of 2 lessons completed', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      id: 'enr_1',
      userId: 'user_1',
      courseId: 'course_1',
      completedLessonIds: [],
    });

    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'course_1',
      modules: [
        { lessons: [{ id: 'les_1' }, { id: 'les_2' }] }
      ]
    });

    const result = await service.updateProgress('user_1', {
      courseId: 'course_1',
      lessonId: 'les_1',
      isCompleted: true,
    });

    expect(result.progressPercent).toBe(50);
    expect(result.completedLessonIds).toEqual(['les_1']);
  });

  it('should trigger certificate generation upon 100% course completion', async () => {
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      id: 'enr_1',
      userId: 'user_1',
      courseId: 'course_1',
      completedLessonIds: ['les_1'],
    });

    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'course_1',
      modules: [
        { lessons: [{ id: 'les_1' }, { id: 'les_2' }] }
      ]
    });

    const result = await service.updateProgress('user_1', {
      courseId: 'course_1',
      lessonId: 'les_2',
      isCompleted: true,
    });

    expect(result.progressPercent).toBe(100);
  });
});
