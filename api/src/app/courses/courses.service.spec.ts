import { describe, expect, it } from 'vitest';
import { CoursesService } from './courses.service';

describe('CoursesService - public course safety', () => {
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
