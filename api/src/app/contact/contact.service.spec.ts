import { beforeEach, describe, expect, it } from 'vitest';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      isDbConnected: false,
      inMemoryContactMessages: [],
    };
    service = new ContactService(prisma);
  });

  it('stores a valid support message in the local adapter', async () => {
    const result = await service.createMessage({
      name: 'Asha Developer',
      email: 'asha@example.com',
      subject: 'Question about JavaScript course',
      message: 'Please tell me how to access the next lesson.',
    });

    expect(result.success).toBe(true);
    expect(prisma.inMemoryContactMessages).toHaveLength(1);
    expect(prisma.inMemoryContactMessages[0].email).toBe('asha@example.com');
  });

  it('rejects incomplete messages before persistence', async () => {
    await expect(
      service.createMessage({
        name: 'A',
        email: 'not-an-email',
        subject: 'Hi',
        message: 'Short',
      }),
    ).rejects.toThrow('Name must be between 2 and 100 characters.');
    expect(prisma.inMemoryContactMessages).toHaveLength(0);
  });
});
