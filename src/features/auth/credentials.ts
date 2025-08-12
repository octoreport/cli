import { fetchGitHubUserInfo, GitHubUserInfo } from '@octoreport/core';

import { getCredentials, setCredentials } from '../storage';

import { login, RepoScope } from './auth';
import { getUserInfo, setUserInfo } from './userInfo';

export async function getUserCredentialsByPAT(
  pat: string,
): Promise<{ token: string; username: string; scopeList: GitHubUserInfo['scopeList'] }> {
  const { login: username, scopeList } = await fetchGitHubUserInfo(pat);
  return { token: pat, username, scopeList };
}

export async function getUserCredentialsForRepoScope(
  repoScope: RepoScope,
): Promise<{ token: string; username: string }> {
  try {
    const { repoScope: storedRepoScope } = await getStoredUserCredentials();
    if (repoScope !== storedRepoScope) {
      await login(repoScope);
    }
    const { token, username } = await getStoredUserCredentials();
    return { token, username };
  } catch {
    await login(repoScope);
    const { token, username } = await getStoredUserCredentials();
    return { token, username };
  }
}

export async function getStoredUserCredentials(): Promise<{
  id: string;
  token: string;
  username: string;
  repoScope: RepoScope;
}> {
  const { id, username } = getUserInfo();
  if (!id || !username) throw new Error('User info not found. Please log in first.');
  const credentials = await getCredentials(id);
  if (!credentials) throw new Error('Credentials not found. Please log in first.');
  const { token, repoScope } = JSON.parse(credentials);
  if (!token || !repoScope) throw new Error('Credentials not found. Please log in first.');
  return { id, username, token, repoScope };
}

export async function storeUserCredentials(
  token: string,
  repoScope: RepoScope,
  userInfo: { id: string; username: string },
): Promise<void> {
  setUserInfo(userInfo);
  await setCredentials(userInfo.id, JSON.stringify({ token, repoScope }));
}

export async function areUserCredentialsStored(): Promise<boolean> {
  try {
    const { id } = getUserInfo();
    if (!id) return false;

    const credentials = await getCredentials(id);
    if (!credentials) return false;

    const parsedCredentials = JSON.parse(credentials);
    return !!(parsedCredentials.token && parsedCredentials.repoScope);
  } catch (error) {
    console.log(
      '⚠️ Error checking user credentials:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }
}
