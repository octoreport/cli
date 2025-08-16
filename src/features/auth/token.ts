import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

import { GITHUB_CONFIG, GITHUB_SCOPES } from '../../config/github';

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
