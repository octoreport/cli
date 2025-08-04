import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { GITHUB_CONFIG } from '../../src/config/github';
import { revokeGitHubToken } from '../../src/features/auth/token';
import { clearUserInfo } from '../../src/features/auth/userInfo';

global.fetch = vi.fn();

describe('Logout Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('revokeGitHubAppAuthorization', () => {
    it('should successfully revoke GitHub app authorization', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        status: 204,
        statusText: 'No Content',
      } as Response);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await revokeGitHubToken('test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        `${GITHUB_CONFIG.BASE_URL}/applications/${GITHUB_CONFIG.CLIENT_ID}/grant`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': GITHUB_CONFIG.API_VERSION,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            access_token: 'test-token',
          }),
        }),
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ GitHub OAuth app authorization revoked successfully',
      );
    });

    it('should handle 404 response (no authorization found)', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await revokeGitHubToken('test-token');

      expect(consoleSpy).toHaveBeenCalledWith('ℹ️ No active authorization found to revoke');
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await revokeGitHubToken('test-token');

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ Failed to revoke GitHub authorization:',
        'Network error',
      );
    });
  });

  describe('clearUserInfo', () => {
    it('should not throw error when file does not exist', () => {
      expect(() => clearUserInfo()).not.toThrow();
    });
  });
});
