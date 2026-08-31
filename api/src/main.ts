import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  Logger.log('[Startup] Technyks API bootstrap() starting...', 'Bootstrap');
  Logger.log(
    `[Startup] NODE_ENV=${process.env.NODE_ENV || 'unset'}, ` +
      `PORT=${process.env.PORT || 'unset'}, ` +
      `API_PORT=${process.env.API_PORT || 'unset'}, ` +
      `DATABASE_URL=${process.env.DATABASE_URL ? 'set (hidden)' : 'NOT SET'}`,
    'Bootstrap',
  );

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Course thumbnails and short promotional clips are uploaded as data URLs
  // from the admin studio until object storage is configured.
  app.use(json({ limit: '16mb' }));
  app.use(urlencoded({ extended: true, limit: '16mb' }));
  app.enableCors();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['/', 'health'],
  });

  // Managed hosts assign the listening port through PORT. Keep API_PORT as a
  // local-development override and retain 3000 for local runs.
  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Backend API is running on: http://0.0.0.0:${port}/${globalPrefix}`,
    'Bootstrap',
  );
}

bootstrap().catch((err) => {
  // Log the startup failure visibly so Hostinger runtime logs capture it.
  console.error('[FATAL] Technyks API failed to start:', err?.message || err);
  console.error(err);
  process.exit(1);
});
