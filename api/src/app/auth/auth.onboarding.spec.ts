import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService onboarding', () => {
  it('persists the learner profile and marks onboarding complete', async () => {
    const updated = {
      id: 'user_1',
      email: 'learner@example.com',
      name: 'Learner',
      role: 'STUDENT',
      onboardingCompleted: true,
      learnerGoal: 'build-projects',
      experienceLevel: 'building-projects',
      membershipPreference: 'free',
    };
    const prisma: any = {
      isDbConnected: true,
      inMemoryUsers: [],
      user: { update: vi.fn().mockResolvedValue(updated) },
    };
    const service = new AuthService(prisma, { sign: vi.fn() } as any);

    await expect(service.completeOnboarding('user_1', {
      learnerGoal: 'build-projects',
      experienceLevel: 'building-projects',
      membershipPreference: 'free',
    })).resolves.toMatchObject({ onboardingCompleted: true, membershipPreference: 'free' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: expect.objectContaining({ onboardingCompleted: true, learnerGoal: 'build-projects' }),
    });
  });

  it('rejects unsupported onboarding answers', async () => {
    const service = new AuthService({ isDbConnected: false, inMemoryUsers: [] } as any, { sign: vi.fn() } as any);
    await expect(service.completeOnboarding('user_1', {
      learnerGoal: 'invalid',
      experienceLevel: 'new-to-coding',
      membershipPreference: 'free',
    })).rejects.toThrow('Select a valid learning goal.');
  });
});
