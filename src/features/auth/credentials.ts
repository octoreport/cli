import { getCredentials, setCredentials } from '../storage';

import { RepoScope } from './auth';
import { getUserInfo, setUserInfo } from './userInfo';

export async function getStoredUserCredentials(): Promise<{
  email: string;
  token: string;
  username: string;
  repoScope: RepoScope;
}> {
  const { email, username } = getUserInfo();
  const credentials = await getCredentials(email);
  const { token, repoScope } = JSON.parse(credentials);
  return { email, username, token, repoScope };
}

export async function storeUserCredentials(
  token: string,
  repoScope: RepoScope,
  userInfo: { email: string; username: string },
): Promise<void> {
  setUserInfo(userInfo);
  await setCredentials(userInfo.email, JSON.stringify({ token, repoScope }));
}

export async function areUserCredentialsStored(): Promise<boolean> {
  try {
    const { email } = getUserInfo();
    if (!email) return false;

    const credentials = await getCredentials(email);
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
