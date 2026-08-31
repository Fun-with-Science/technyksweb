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
