import { describe, expect, it } from 'vitest';
import { CoursesService } from './courses.service';

describe('CoursesService - public course safety', () => {
  it('seeds the TypeScript curriculum into API persistence for public and admin use', async () => {
    const prisma = {
      isDbConnected: false,
      inMemoryCourses: [],
      inMemoryReviews: [],
    } as any;
    const service = new CoursesService(prisma);

    await service.onModuleInit();

    const typeScriptCourse = prisma.inMemoryCourses.find(
      (course: any) => course.id === 'course-typescript-2026',
    );
    expect(typeScriptCourse).toBeDefined();
    expect(typeScriptCourse.isPublished).toBe(true);
    expect(typeScriptCourse.modules).toHaveLength(9);
    expect(
      typeScriptCourse.modules.flatMap((module: any) => module.lessons),
    ).toHaveLength(37);
  });

  it('removes private video references from a public course response', async () => {
    const service = new CoursesService({
      isDbConnected: false,
      inMemoryCourses: [
        {
          id: 'course-javascript-2026',
          slug: 'complete-javascript-course',
          isPublished: true,
          modules: [
            {
              id: 'javascript-section-1',
              title: 'Course Orientation',
              lessons: [
                {
                  id: 'javascript-lesson-01',
                  title: 'Introduction',
                  videoAssetRef: 'youtube:private-id',
                },
              ],
            },
          ],
        },
      ],
    } as any);

    const result = await service.findBySlug('complete-javascript-course');

    expect(result.modules[0].lessons[0]).not.toHaveProperty('videoAssetRef');
    expect(result.modules[0].lessons[0].title).toBe('Introduction');
  });
});
