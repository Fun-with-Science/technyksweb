import {
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { SiteSettingsService } from './site-settings.service';

@Controller('settings')
export class PublicSiteSettingsController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }
}

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@SetMetadata('roles', ['ADMIN'])
export class AdminSiteSettingsController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  @Post()
  updateSettings(@Body() body: unknown) {
    return this.settingsService.updateSettings(body);
  }
}
