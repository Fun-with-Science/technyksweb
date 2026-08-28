import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async generateSignedPlaybackToken(userId: string | null, lessonId: string) {
    let lesson: any = null;
    let usingDatabase = false;

    if (this.prisma.isDbConnected) {
      try {
        lesson = await this.prisma.lesson.findUnique({
          where: { id: lessonId },
          include: { module: { include: { course: true } } }
        });
        usingDatabase = true;
      } catch {
        // Use the local adapter if PostgreSQL becomes unavailable.
      }
    }

    if (!lesson) {
      for (const course of this.prisma.inMemoryCourses) {
        for (const module of course.modules || []) {
          const found = (module.lessons || []).find((candidate: any) => candidate.id === lessonId);
          if (found) {
            lesson = { ...found, module: { courseId: course.id, course } };
            break;
          }
        }
        if (lesson) break;
      }
    }

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    // Check authorization: Free Preview OR Enrolled OR Active Subscription
    if (!lesson.isFreePreview) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to view this paid lesson.');
      }

      let enrollment: any = null;
      let activeSub: any = null;

      if (usingDatabase) {
        try {
          enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
          });
          activeSub = await this.prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' } });
        } catch {
          // Use the local adapter below.
        }
      }

      if (!enrollment) {
        enrollment = this.prisma.inMemoryEnrollments.find(item => item.userId === userId && item.courseId === lesson.module.courseId);
      }
      if (!activeSub) {
        activeSub = this.prisma.inMemorySubscriptions.find(item => item.userId === userId && item.status === 'ACTIVE');
      }

      if (!enrollment && !activeSub) {
        throw new ForbiddenException('You must enroll in this track or join Membership to stream this lesson.');
      }
    }

    const bunnyLibraryId = this.config.get<string>('BUNNY_STREAM_LIBRARY_ID')?.trim();
    const bunnyTokenKey = this.config.get<string>('BUNNY_STREAM_TOKEN_KEY')?.trim();
    const bunnyEnabled = this.config.get<string>('BUNNY_STREAM_ENABLED')?.toLowerCase() === 'true';
    const expires = Math.floor(Date.now() / 1000) + 3600 * 4; // Token expires in 4 hours
    const videoId = String(lesson.videoAssetRef || '').trim();

    // Bunny is intentionally optional until the owner supplies real account
    // credentials and attaches a real video ID to each lesson.
    if (!bunnyEnabled || !videoId || /^demo(?:[_-]|$)/i.test(videoId) || !bunnyLibraryId || !bunnyTokenKey) {
      return {
        lessonId: lesson.id,
        title: lesson.title,
        isFreePreview: lesson.isFreePreview,
        videoAvailable: false,
        embedUrl: null,
        expires: 0,
        token: null,
      };
    }

    // Bunny Stream SHA-256 Token Authentication Hash calculation:
    // hash = sha256(tokenKey + videoId + expires)
    const hashable = `${bunnyTokenKey}${videoId}${expires}`;
    const token = crypto.createHash('sha256').update(hashable).digest('hex');

    // Secure tokenized embed URL (never direct raw MP4 URL!)
    const embedUrl = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=true`;

    return {
      lessonId: lesson.id,
      title: lesson.title,
      isFreePreview: lesson.isFreePreview,
      videoAvailable: true,
      embedUrl,
      expires,
      token,
    };
  }
}
