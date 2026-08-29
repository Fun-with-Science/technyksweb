import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  public isDbConnected = false;

  // In-memory fallback stores when local PostgreSQL is not running
  public inMemoryUsers: any[] = [];
  public inMemoryCourses: any[] = [];
  public inMemoryEnrollments: any[] = [];
  public inMemorySubscriptions: any[] = [];
  public inMemoryCoupons: any[] = [];
  public inMemoryCertificates: any[] = [];
  public inMemoryPayments: any[] = [];
  public inMemoryMembershipPlans: any[] = [];
  public inMemoryReviews: any[] = [];
  public inMemoryContactMessages: any[] = [];

  async onModuleInit() {
    try {
      await this.$connect();
      // Keep existing Hostinger databases compatible with the new optional
      // promotional-video field without requiring a destructive migration.
      await this.$executeRawUnsafe(
        'ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "promoVideoUrl" TEXT',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT FALSE',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT FALSE',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "MembershipPlan" ADD COLUMN IF NOT EXISTS "description" TEXT',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "MembershipPlan" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "MembershipPlan" ADD COLUMN IF NOT EXISTS "accessAllCourses" BOOLEAN NOT NULL DEFAULT TRUE',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "scope" TEXT NOT NULL DEFAULT \'COURSE\'',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "courseId" TEXT',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "couponCode" TEXT',
      );
      await this.$executeRawUnsafe(
        'ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "planId" TEXT',
      );
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MembershipCourseAccess" (
          "planId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MembershipCourseAccess_pkey" PRIMARY KEY ("planId", "courseId"),
          CONSTRAINT "MembershipCourseAccess_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "MembershipCourseAccess_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await this.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "MembershipCourseAccess_courseId_idx" ON "MembershipCourseAccess"("courseId")',
      );
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Review" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "rating" INTEGER NOT NULL,
          "comment" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await this.$executeRawUnsafe(
        'CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_courseId_key" ON "Review"("userId", "courseId")',
      );
      await this.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "Review_courseId_createdAt_idx" ON "Review"("courseId", "createdAt")',
      );
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContactMessage" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'NEW',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt")',
      );
      // The bundled JavaScript course shipped before preview flags were
      // enabled. Backfill only its public introduction lesson so existing
      // deployments receive the same preview behavior as new imports.
      await this.$executeRawUnsafe(`
        UPDATE "Lesson" AS lesson
        SET "isFreePreview" = TRUE
        FROM "Module" AS module
        WHERE lesson."moduleId" = module."id"
          AND module."courseId" = 'course-javascript-2026'
          AND lesson."id" = 'javascript-lesson-01'
      `);
      this.isDbConnected = true;
      this.logger.log(
        ' Connected successfully to PostgreSQL database via Prisma',
      );
    } catch (error: any) {
      this.isDbConnected = false;
      const allowFallback =
        process.env.NODE_ENV !== 'production' &&
        process.env.ALLOW_IN_MEMORY_FALLBACK !== 'false';
      if (!allowFallback) {
        throw error;
      }
      this.logger.warn(
        ` Local PostgreSQL database not reachable (${error?.message || 'Connection failed'}). ` +
          `Switching seamlessly to high-performance in-memory persistence layer.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isDbConnected) {
      await this.$disconnect();
    }
  }
}
