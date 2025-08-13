import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

import { GITHUB_CONFIG, GITHUB_SCOPES } from '../../config/github';
import { getAllCredentials } from '../storage';

import type { RepoScope } from './types';

async function authorizeWithGitHubDeviceFlow(
  clientId: string,
  scopes: string[] = [...GITHUB_SCOPES.PUBLIC_REPO, ...GITHUB_SCOPES.USER_INFO],
) {
  const auth = createOAuthDeviceAuth({
    clientType: 'oauth-app',
    clientId,
    scopes,
    onVerification: (verification) => {
      console.log('🔐 GitHub authentication is required!');
      console.log(
        `👉 Please visit the following link in your browser: ${verification.verification_uri}`,
      );
      console.log(`✅ Enter the following code in the browser: ${verification.user_code}`);
    },
  });

  const authentication = await auth({ type: 'oauth' });
  return authentication.token;
}

export async function issueGitHubTokenForRepoScope(repoScope: RepoScope): Promise<string> {
  const formattedRepoScope =
    repoScope === 'private' ? [...GITHUB_SCOPES.PRIVATE_REPO] : [...GITHUB_SCOPES.PUBLIC_REPO];
  const newGithubToken = await authorizeWithGitHubDeviceFlow(GITHUB_CONFIG.CLIENT_ID, [
    ...formattedRepoScope,
    ...GITHUB_SCOPES.USER_INFO,
  ]);
  return newGithubToken;
}

export async function invalidateGitHubToken(accessToken: string): Promise<void> {
  try {
    console.log('🔍 Attempting to invalidate GitHub access token...');
    const response = await fetch(
      `${GITHUB_CONFIG.BASE_URL}/applications/${GITHUB_CONFIG.CLIENT_ID}/grant`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': GITHUB_CONFIG.API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      },
    );

    switch (response.status) {
      case 204:
        console.log('✅ GitHub access token invalidated successfully');
        console.log('ℹ️ Note: The OAuth app may still appear in GitHub Applications');
        console.log(
          `ℹ️ To completely remove the app, visit: https://github.com/settings/connections/applications/${GITHUB_CONFIG.CLIENT_ID}`,
        );
        break;
      case 422:
        console.log('⚠️ Validation failed (token may be invalid or endpoint spammed)');
        console.log(
          `ℹ️ Please manually revoke at: https://github.com/settings/connections/applications/${GITHUB_CONFIG.CLIENT_ID}`,
        );
        break;

      default:
        console.log(`⚠️ Failed to invalidate token: ${response.status} ${response.statusText}`);
        console.log(
          `ℹ️ Please manually revoke at: https://github.com/settings/connections/applications/${GITHUB_CONFIG.CLIENT_ID}`,
        );
        break;
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to invalidate GitHub token:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log(
      `ℹ️ Please manually revoke at: https://github.com/settings/connections/applications/${GITHUB_CONFIG.CLIENT_ID}`,
    );
  }
}

export async function invalidateAllGitHubTokens(): Promise<void> {
  try {
    const allCredentials = await getAllCredentials();

    await Promise.all(
      allCredentials.map(async (credential) => {
        const { key, value } = credential;
        try {
          if (value) {
            await invalidateGitHubToken(value);
          }
        } catch (error) {
          console.warn(`Failed to revoke token for account ${key}:`, error);
        }
      }),
    );

    console.log(`✅ Successfully revoked ${allCredentials.length} GitHub tokens`);
  } catch (error) {
    console.error('Failed to revoke GitHub tokens:', error);
    throw error;
  }
}
