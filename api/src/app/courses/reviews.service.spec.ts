import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      isDbConnected: false,
      inMemoryCourses: [{ id: 'course_1', slug: 'typescript-course' }],
      inMemoryEnrollments: [
        { id: 'enrollment_1', userId: 'student_1', courseId: 'course_1' },
      ],
      inMemoryUsers: [
        { id: 'student_1', name: 'Asha', avatarUrl: null },
        { id: 'student_2', name: 'Rahul', avatarUrl: null },
      ],
      inMemoryReviews: [],
    };
    service = new ReviewsService(prisma);
  });

  it('creates and updates one durable review per enrolled student', async () => {
    const created = await service.upsertReview('student_1', 'course_1', {
      rating: 5,
      comment: 'A clear and genuinely useful TypeScript course.',
    });
    const updated = await service.upsertReview('student_1', 'course_1', {
      rating: 4,
      comment: 'Still excellent after completing every module.',
    });

    expect(created.user.name).toBe('Asha');
    expect(updated.id).toBe(created.id);
    expect(updated.rating).toBe(4);
    expect(prisma.inMemoryReviews).toHaveLength(1);
    await expect(service.listForCourse('course_1')).resolves.toMatchObject([
      { id: created.id, rating: 4, user: { name: 'Asha' } },
    ]);
  });

  it('rejects reviews from users without a course enrollment', async () => {
    await expect(
      service.upsertReview('student_2', 'course_1', {
        rating: 5,
        comment: 'This review must not be published without enrollment.',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
