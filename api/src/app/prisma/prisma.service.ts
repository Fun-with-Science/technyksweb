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
