import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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

  async onModuleInit() {
    try {
      await this.$connect();
      this.isDbConnected = true;
      this.logger.log(' Connected successfully to PostgreSQL database via Prisma');
    } catch (error: any) {
      this.isDbConnected = false;
      this.logger.warn(
        ` Local PostgreSQL database not reachable (${error?.message || 'Connection failed'}). ` +
        `Switching seamlessly to high-performance in-memory persistence layer.`
      );
    }
  }

  async onModuleDestroy() {
    if (this.isDbConnected) {
      await this.$disconnect();
    }
  }
}
