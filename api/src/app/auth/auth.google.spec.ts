import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService Google authentication', () => {
  afterEach(() => delete process.env.GOOGLE_CLIENT_ID);

  it('verifies the Google ID token and persists a new learner', async () => {
    process.env.GOOGLE_CLIENT_ID = 'web-client.apps.googleusercontent.com';
    const created = {
      id: 'user_google',
      email: 'learner@example.com',
      name: 'Learner Example',
      role: 'STUDENT',
      avatarUrl: 'https://example.com/avatar.png',
    };
    const prisma: any = {
      isDbConnected: true,
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
      inMemoryUsers: [],
    };
    const jwt: any = { sign: vi.fn().mockReturnValue('session-token') };
    const service = new AuthService(prisma, jwt);
    vi.spyOn((service as any).googleClient, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        sub: 'google-subject',
        email: 'Learner@Example.com',
        email_verified: true,
        name: 'Learner Example',
        picture: 'https://example.com/avatar.png',
      }),
    });

    await expect(service.loginWithGoogle('signed-google-id-token')).resolves.toMatchObject({
      accessToken: 'session-token',
      user: { id: 'user_google', email: 'learner@example.com', role: 'STUDENT' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'learner@example.com', googleId: 'google-subject' }),
    });
  });

  it('rejects Google login when it is not configured', async () => {
    const service = new AuthService({ isDbConnected: false, inMemoryUsers: [] } as any, { sign: vi.fn() } as any);
    await expect(service.loginWithGoogle('credential')).rejects.toThrow('Google sign-in is not configured.');
  });
});
