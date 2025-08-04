import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { fetchGitHubUserInfo } from '@octoreport/core';

import { getGithubToken, setGithubToken } from './token';
import { getUserInfo } from './userInfo';
import { setUserInfo } from './userInfo';

const GITHUB_CLIENT_ID = 'Ov23lia7pFpgs8ULT1DL';

export async function loginWithGitHubDeviceFlow(
  clientId: string,
  scopes: string[] = ['public_repo', 'read:user'],
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

  const scopes = isPrivateAccess ? ['repo', 'read:user'] : ['public_repo', 'read:user'];

  if (!githubToken) {
    const newGithubToken = await loginWithGitHubDeviceFlow(GITHUB_CLIENT_ID, scopes);
    const { login: username, email } = await fetchGitHubUserInfo(newGithubToken);
    setUserInfo({ username, email });
    await setGithubToken(email, newGithubToken);
    console.log(
      '🎉 Successfully logged in! You can now use octoreport. Please run the command again.',
    );

    return { email, username };
  }

  // if there is an existing token but private access is required, re-login is needed
  if (isPrivateAccess) {
    console.log(
      '🔐 Private repository access requires re-authentication with expanded permissions.',
    );
    const newGithubToken = await loginWithGitHubDeviceFlow(GITHUB_CLIENT_ID, scopes);
    const { login: username, email } = await fetchGitHubUserInfo(newGithubToken);
    setUserInfo({ username, email });
    await setGithubToken(email, newGithubToken);
    console.log(
      '🎉 Successfully logged in with private repository access! You can now use octoreport. Please run the command again.',
    );

    return { email, username };
  }

  return { email, username };
}
