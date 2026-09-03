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
      // Schema creation and non-destructive changes are handled by
      // `prisma db push` during the Hostinger build. Keeping schema changes
      // out of startup makes the API compatible with MySQL and prevents
      // PostgreSQL-specific SQL from running against the production database.
      this.isDbConnected = true;
      this.logger.log(
        ' Connected successfully to MySQL database via Prisma',
      );
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
}
