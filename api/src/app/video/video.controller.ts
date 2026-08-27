import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Get('token/:lessonId')
  async getSignedPlaybackToken(@Request() req: any, @Param('lessonId') lessonId: string) {
    return this.videoService.generateSignedPlaybackToken(req.user?.id || null, lessonId);
  }
}
