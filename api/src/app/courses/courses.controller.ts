import { Controller, Get, Param, Header } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  async getAllCourses() {
    return this.coursesService.findAllPublished();
  }

  @Get(':slug')
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}
