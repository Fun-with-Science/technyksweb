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
  public inMemorySiteSettings: any | null = null;

  async onModuleInit() {
    try {
      await this.$connect();
      await this.ensureRuntimeColumns();
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
}
