import { Body, Controller, Post } from '@nestjs/common';
import { ContactService, ContactSubmission } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  submitMessage(@Body() submission: ContactSubmission) {
    return this.contactService.createMessage(submission);
  }
}
