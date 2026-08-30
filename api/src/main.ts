import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Course thumbnails and short promotional clips are uploaded as data URLs
  // from the admin studio until object storage is configured.
  app.use(json({ limit: '16mb' }));
  app.use(urlencoded({ extended: true, limit: '16mb' }));
  app.enableCors();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // Managed hosts assign the listening port through PORT. Keep API_PORT as a
  // local-development override and retain 3000 for local runs.
  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  await app.listen(port);
  Logger.log(
    `🚀 Backend API is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
