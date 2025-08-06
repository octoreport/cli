import { fetchGitHubUserInfo } from '@octoreport/core';

import { deleteCredentials, getCredentials } from '../storage';
import { logLoginGuide } from '../ui';

import { storeUserCredentials } from './credentials';
import { issueGitHubTokenForRepoScope, invalidateGitHubToken } from './token';
import { clearUserInfo, getUserInfo } from './userInfo';

export type RepoScope = 'public' | 'private';

export async function login(repoScope: RepoScope): Promise<void> {
  logLoginGuide(repoScope);
  const newToken = await issueGitHubTokenForRepoScope(repoScope);
  const { login: username, email } = await fetchGitHubUserInfo(newToken);
  await storeUserCredentials(newToken, repoScope, { email, username });
}

export async function logout() {
  try {
    const { email } = getUserInfo();
    if (email) {
      const credentials = await getCredentials(email);
      const { token } = JSON.parse(credentials);
      if (token) {
        await invalidateGitHubToken(token);
        await deleteCredentials(email);
        clearUserInfo();
        console.log('✅ Logout completed successfully!');
      } else {
        console.log('ℹ️ No stored tokens found. Local data cleared.');
      }
    } else {
      console.log('ℹ️ No user information found. Nothing to clear.');
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to process logout:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
