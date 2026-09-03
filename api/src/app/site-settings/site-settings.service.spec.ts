import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettingsService,
} from './site-settings.service';

describe('SiteSettingsService', () => {
  let prisma: any;
  let service: SiteSettingsService;

  beforeEach(() => {
    prisma = {
      isDbConnected: false,
      inMemorySiteSettings: null,
      siteSetting: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };
    service = new SiteSettingsService(prisma);
  });

  it('returns safe defaults before an administrator has saved settings', async () => {
    await expect(service.getSettings()).resolves.toEqual(DEFAULT_SITE_SETTINGS);
  });

  it('stores and returns hero words and announcement settings locally', async () => {
    const saved = await service.updateSettings({
      typingWords: ['Angular', 'Angular', ' TypeScript '],
      announcementBar: {
        enabled: true,
        message: 'Enrollment closes Friday',
        buttonText: 'Join now',
        buttonUrl: '/membership',
        badgeText: 'OFFER',
        theme: 'emerald',
      },
    });

    expect(saved.typingWords).toEqual(['Angular', 'TypeScript']);
    expect(saved.announcementBar.theme).toBe('emerald');
    await expect(service.getSettings()).resolves.toEqual(saved);
  });

  it('rejects unsafe banner links', async () => {
    await expect(
      service.updateSettings({
        ...DEFAULT_SITE_SETTINGS,
        announcementBar: {
          ...DEFAULT_SITE_SETTINGS.announcementBar,
          buttonUrl: 'javascript:alert(1)',
        },
      }),
    ).rejects.toThrow('Banner button URL');
  });
});
