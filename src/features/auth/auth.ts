import { fetchGitHubUserInfo } from '@octoreport/core';

import { getCredentials } from '../storage';
import { logLoginGuide } from '../ui';

import { deleteUserCredentials, storeUserCredentials } from './credentials';
import { issueGitHubTokenForRepoScope, invalidateAllGitHubTokens } from './token';
import type { RepoScope } from './types';
import { loadUserInfoFromFile } from './userInfo';

export async function login(repoScope: RepoScope): Promise<void> {
  logLoginGuide(repoScope);
  const newToken = await issueGitHubTokenForRepoScope(repoScope);
  const { login: username, id } = await fetchGitHubUserInfo(newToken);
  await revokeUserAccess();
  await storeUserCredentials(newToken, repoScope, { id, username });
}

export async function logout(): Promise<void> {
  try {
    const { id } = loadUserInfoFromFile();
    if (id) {
      const credentials = await getCredentials(id);
      const { token } = JSON.parse(credentials);
      if (token) {
        await revokeUserAccess();
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

export async function revokeUserAccess(): Promise<void> {
  try {
    await invalidateAllGitHubTokens();
    await deleteUserCredentials();
  } catch (error) {
    console.log(
      '⚠️ Failed to process revoke user access:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
