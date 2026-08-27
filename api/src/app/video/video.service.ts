import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async generateSignedPlaybackToken(userId: string | null, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    // Check authorization: Free Preview OR Enrolled OR Active Subscription
    if (!lesson.isFreePreview) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to view this paid lesson.');
      }

      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.module.courseId,
          }
        }
      });

      const activeSub = await this.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        }
      });

      if (!enrollment && !activeSub) {
        throw new ForbiddenException('You must enroll in this track or join Membership to stream this lesson.');
      }
    }

    const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '348201';
    const bunnyTokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || 'technyks_bunny_secret_stream_token_key';
    const expires = Math.floor(Date.now() / 1000) + 3600 * 4; // Token expires in 4 hours
    const videoId = lesson.videoAssetRef || 'demo-video-asset-id';

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
      embedUrl,
      expires,
      token,
    };
  }
}
