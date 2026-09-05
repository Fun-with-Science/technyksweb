import { Module } from '@nestjs/common';
import {
  AdminCommunicationController,
  CommunicationController,
} from './communication.controller';
import { CommunicationService } from './communication.service';

@Module({
  controllers: [CommunicationController, AdminCommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
