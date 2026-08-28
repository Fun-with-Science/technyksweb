import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('metrics')
  async getMetrics() {
    return this.adminService.getRevenueMetrics();
  }

  @Get('students')
  async searchStudents(@Query('search') search?: string) {
    return this.adminService.searchStudents(search);
  }

  @Get('courses')
  async getCourses() {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  async getCourse(@Param('id') id: string) {
    return this.adminService.getCourseById(id);
  }

  @Post('courses')
  async createCourse(@Body() dto: any) {
    return this.adminService.createCourse(dto);
  }

  @Patch('courses/:id')
  async updateCourse(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  @Get('coupons')
  async getCoupons() {
    return this.adminService.getAllCoupons();
  }

  @Post('coupons')
  async createCoupon(@Body() dto: any) {
    return this.adminService.createCoupon(dto);
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }
}
