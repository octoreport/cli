import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { fetchGitHubUserInfo } from '@octoreport/core';

import { GITHUB_CONFIG, GITHUB_SCOPES } from '../../config/github';
import { logLoginInfo } from '../ui/console/permission';

import { getGithubToken, setGithubToken } from './token';
import { getUserInfo, setUserInfo } from './userInfo';

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
  logLoginInfo(isPrivateAccess);

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
    `🎉 Successfully logged in${isPrivateAccess && ' with private repository access'}! You can now use @octoreport/cli. Please run the command again.`,
  );

  return { email, username };
}

export async function isLoggedIn(): Promise<boolean> {
  const { email } = getUserInfo();
  const githubToken = email ? await getGithubToken(email) : null;
  return !!githubToken;
}

export async function getLoggedInUserInfo(isPrivateAccess: boolean = false) {
  if (!isLoggedIn()) {
    return await login(isPrivateAccess);
  } else {
    const { email, username } = getUserInfo();
    return { email, username };
  }
}
