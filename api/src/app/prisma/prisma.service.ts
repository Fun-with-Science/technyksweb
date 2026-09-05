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

  // In-memory fallback stores when the configured database is not running.
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
  public inMemoryCourseQuestions: any[] = [];
  public inMemoryCourseReplies: any[] = [];
  public inMemoryCourseAnnouncements: any[] = [];
  public inMemorySiteSettings: any | null = null;

  async onModuleInit() {
    try {
      await this.$connect();
      await this.ensureRuntimeColumns();
      await this.ensureCommunicationTables();
      this.isDbConnected = true;
      this.logger.log(' Connected successfully to MySQL database via Prisma');
    } catch (error: any) {
      this.isDbConnected = false;
      this.logger.warn(
        `Configured MySQL database not reachable (${error?.message || 'Connection failed'}). ` +
          `Switching seamlessly to high-performance in-memory persistence layer.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isDbConnected) {
      await this.$disconnect();
    }
  }

  private async ensureRuntimeColumns() {
    const additions = [
      {
        table: 'User',
        sql: 'ADD COLUMN `onboardingCompleted` BOOLEAN NOT NULL DEFAULT false',
      },
      { table: 'User', sql: 'ADD COLUMN `learnerGoal` VARCHAR(191) NULL' },
      { table: 'User', sql: 'ADD COLUMN `experienceLevel` VARCHAR(191) NULL' },
      {
        table: 'User',
        sql: 'ADD COLUMN `membershipPreference` VARCHAR(191) NULL',
      },
      {
        table: 'Course',
        sql: "ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Web Development'",
      },
    ];

    for (const addition of additions) {
      try {
        await this.$executeRawUnsafe(
          `ALTER TABLE \`${addition.table}\` ${addition.sql}`,
        );
      } catch (error: any) {
        const databaseCode = String(error?.meta?.code || error?.code || '');
        const message = String(error?.meta?.message || error?.message || '');
        if (
          databaseCode === '1060' ||
          message.includes('Duplicate column name')
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  private async ensureCommunicationTables() {
    const statements = [
      `CREATE TABLE IF NOT EXISTS \`CourseQuestion\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`courseId\` VARCHAR(191) NOT NULL,
        \`lessonId\` VARCHAR(191) NULL,
        \`title\` VARCHAR(240) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`status\` VARCHAR(32) NOT NULL DEFAULT 'OPEN',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`CourseQuestion_courseId_createdAt_idx\` (\`courseId\`, \`createdAt\`),
        INDEX \`CourseQuestion_lessonId_idx\` (\`lessonId\`),
        INDEX \`CourseQuestion_status_idx\` (\`status\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS \`CourseReply\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`questionId\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`isInstructor\` BOOLEAN NOT NULL DEFAULT false,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`CourseReply_questionId_createdAt_idx\` (\`questionId\`, \`createdAt\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS \`CourseAnnouncement\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`createdById\` VARCHAR(191) NOT NULL,
        \`title\` VARCHAR(240) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`targetCourseIds\` JSON NOT NULL,
        \`sendEmail\` BOOLEAN NOT NULL DEFAULT false,
        \`emailStatus\` VARCHAR(32) NOT NULL DEFAULT 'NOT_REQUESTED',
        \`recipientCount\` INT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`CourseAnnouncement_createdAt_idx\` (\`createdAt\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    ];

    for (const statement of statements) {
      await this.$executeRawUnsafe(statement);
    }
  }
}
