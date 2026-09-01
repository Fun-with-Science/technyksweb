import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app/app.module';
import { getUploadsDirectory } from './app/admin/media.service';

function validateProductionEnvironment() {
  if (process.env.NODE_ENV !== 'production') return;

  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required in production. Configure the Hostinger MySQL connection URL.',
    );
  }

  if (!/^mysql:\/\//i.test(databaseUrl)) {
    throw new Error(
      'DATABASE_URL must use the mysql:// protocol because prisma/schema.prisma is configured for MySQL.',
    );
  }

  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET is required in production and must contain at least 32 characters.',
    );
  }
}

async function bootstrap() {
  Logger.log('[Startup] Technyks API bootstrap() starting...', 'Bootstrap');
  Logger.log(
    `[Startup] NODE_ENV=${process.env.NODE_ENV || 'unset'}, ` +
      `PORT=${process.env.PORT || 'unset'}, ` +
      `API_PORT=${process.env.API_PORT || 'unset'}, ` +
      `DATABASE_URL=${process.env.DATABASE_URL ? 'set (hidden)' : 'NOT SET'}`,
    'Bootstrap',
  );

  validateProductionEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const uploadsDirectory = getUploadsDirectory();
  mkdirSync(uploadsDirectory, { recursive: true });
  app.useStaticAssets(uploadsDirectory, {
    prefix: '/uploads/',
    index: false,
  });
  app.use(json({ limit: '16mb' }));
  app.use(urlencoded({ extended: true, limit: '16mb' }));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['/', 'health'],
  });

  const rawPort = process.env.PORT || process.env.API_PORT || 3000;
  const numericPort = Number(rawPort);

  if (!isNaN(numericPort) && numericPort > 0) {
    await app.listen(numericPort, '0.0.0.0');
    Logger.log(
      `🚀 Backend API is running on: http://0.0.0.0:${numericPort}/${globalPrefix}`,
      'Bootstrap',
    );
  } else {
    // Unix domain socket or named pipe provided by host
    await app.listen(rawPort);
    Logger.log(
      `🚀 Backend API is running on socket: ${rawPort}`,
      'Bootstrap',
    );
  }
}

bootstrap().catch((err) => {
  console.error('[FATAL] Technyks API failed to start:', err?.message || err);
  console.error(err);
  process.exit(1);
});
