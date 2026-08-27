import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getMyEnrollments(userId: string) {
    if (this.prisma.isDbConnected) {
      try {
        return await this.prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: { select: { id: true, title: true, duration: true, order: true } }
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });
      } catch (e) {
        return this.prisma.inMemoryEnrollments.filter(e => e.userId === userId);
      }
    }

    return this.prisma.inMemoryEnrollments.filter(e => e.userId === userId);
  }

  async updateProgress(userId: string, dto: { courseId: string; lessonId: string; isCompleted?: boolean }) {
    let enrollment: any = null;
    let course: any = null;

    if (this.prisma.isDbConnected) {
      try {
        enrollment = await this.prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: dto.courseId } }
        });
        course = await this.prisma.course.findUnique({
          where: { id: dto.courseId },
          include: { modules: { include: { lessons: true } } }
        });
      } catch (e) {
        // Fallback to in-memory below
      }
    }

    if (!course) {
      course = this.prisma.inMemoryCourses.find(c => c.id === dto.courseId || c.slug === dto.courseId);
    }
    if (!enrollment) {
      enrollment = this.prisma.inMemoryEnrollments.find(e => e.userId === userId && (e.courseId === dto.courseId || e.course?.id === dto.courseId));
    }

    if (!enrollment) {
      // Auto-create enrollment in memory for smooth trial
      enrollment = {
        id: `enr_${Date.now().toString(36)}`,
        userId,
        courseId: dto.courseId,
        progressPercent: 0,
        lastWatchedLessonId: dto.lessonId,
        completedLessonIds: [],
        course: course || this.prisma.inMemoryCourses[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.prisma.inMemoryEnrollments.push(enrollment);
    }

    let totalLessonsCount = 0;
    if (course && course.modules) {
      course.modules.forEach((m: any) => totalLessonsCount += (m.lessons?.length || 0));
    } else {
      totalLessonsCount = 5;
    }

    let completed = [...(enrollment.completedLessonIds || [])];
    if (dto.isCompleted && !completed.includes(dto.lessonId)) {
      completed.push(dto.lessonId);
    }

    const progressPercent = totalLessonsCount > 0 
      ? Math.min(100, Math.round((completed.length / totalLessonsCount) * 100))
      : 0;

    enrollment.lastWatchedLessonId = dto.lessonId;
    enrollment.completedLessonIds = completed;
    enrollment.progressPercent = progressPercent;
    enrollment.updatedAt = new Date();

    if (progressPercent === 100) {
      await this.generateCertificateIfEligible(userId, dto.courseId);
    }

    return enrollment;
  }

  async generateCertificateIfEligible(userId: string, courseId: string) {
    const certNumber = `CERT-TA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const cert = {
      id: `cert_${Date.now().toString(36)}`,
      userId,
      courseId,
      certificateNumber: certNumber,
      pdfUrl: `/api/certificates/download/${certNumber}.pdf`,
      issuedAt: new Date(),
    };

    const existingMem = this.prisma.inMemoryCertificates.find(c => c.userId === userId && c.courseId === courseId);
    if (existingMem) return existingMem;

    this.prisma.inMemoryCertificates.push(cert);
    return cert;
  }
}
