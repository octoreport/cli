import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { fetchGitHubUserInfo } from '@octoreport/core';

import { GITHUB_CONFIG, GITHUB_SCOPES } from '../../config/github';
import {
  logPrivateRepositoryAccessRequestInfo,
  logToolAccessRangeInfo,
  logPublicRepositoryAccessRequestInfo,
} from '../ui/console/permission';

import { getGithubToken, setGithubToken } from './token';
import { getUserInfo } from './userInfo';
import { setUserInfo } from './userInfo';

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

export async function login(isPrivateAccess: boolean = false) {
  const { email, username } = getUserInfo();
  const githubToken = email ? await getGithubToken(email) : null;

  if (!githubToken) {
    logToolAccessRangeInfo();
    if (isPrivateAccess) {
      logPrivateRepositoryAccessRequestInfo();
    } else {
      logPublicRepositoryAccessRequestInfo();
    }

    const repoScopes = isPrivateAccess
      ? [...GITHUB_SCOPES.PRIVATE_REPO]
      : [...GITHUB_SCOPES.PUBLIC_REPO];

    const newGithubToken = await authorizeWithGitHubDeviceFlow(GITHUB_CONFIG.CLIENT_ID, [
      ...repoScopes,
      ...GITHUB_SCOPES.USER_INFO,
    ]);
    const { login: username, email } = await fetchGitHubUserInfo(newGithubToken);
    setUserInfo({ username, email });
    await setGithubToken(email, newGithubToken);
    console.log(
      `🎉 Successfully logged in${' with private repository access'}! You can now use @octoreport/cli. Please run the command again.`,
    );

    return { email, username };
  }

  return { email, username };
}
