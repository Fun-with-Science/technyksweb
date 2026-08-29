import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, ReviewsService],
  exports: [CoursesService, ReviewsService],
})
export class CoursesModule {}
