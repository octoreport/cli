import { fetchGitHubUserInfo } from '@octoreport/core';
import ora, { Ora } from 'ora';

import { login, getStoredUserCredentials, areUserCredentialsStored } from '../features/auth';
import { promptPRFetchCriteria, promptSecureToken } from '../features/prompts';

export async function withCommandContext<T>(
  command: (
    answers: Awaited<ReturnType<typeof promptPRFetchCriteria>>,
    githubToken: string,
    username: string,
    spinner: Ora,
  ) => Promise<T>,
  options: {
    mode: 'pat' | 'normal';
    repoScope: 'public' | 'private';
  },
) {
  const { mode, repoScope } = options;
  let githubToken: string;
  let username: string;

  if (mode === 'pat') {
    githubToken = await promptSecureToken();
    const { login: fetchedUsername } = await fetchGitHubUserInfo(githubToken);
    username = fetchedUsername;
  } else {
    const areCredentialsStored = await areUserCredentialsStored();
    if (areCredentialsStored) {
      const { repoScope: storedRepoScope } = await getStoredUserCredentials();
      if (repoScope !== storedRepoScope) {
        await login(repoScope);
      }
      const { token, username: storedUsername } = await getStoredUserCredentials();
      githubToken = token;
      username = storedUsername;
    } else {
      await login(repoScope);
      const { token, username: storedUsername } = await getStoredUserCredentials();
      githubToken = token;
      username = storedUsername;
    }
  }
  const answers = await promptPRFetchCriteria(repoScope);

  const spinner = ora({
    text: '🐙🔎 Processing...',
    spinner: 'dots2',
    color: 'green',
  }).start();

  try {
    await command(answers, githubToken, username, spinner);
  } catch (error) {
    if (!spinner.isSpinning && spinner.text.includes('❌')) {
      return;
    }

    const errorMessage = error instanceof Error && error.message ? error.message : 'Unknown error';
    spinner.fail(`❌ Failed to execute command: ${errorMessage}. Please try again.`);
    console.error(error);
  } finally {
    if (spinner.isSpinning) {
      spinner.stop();
    }
  }
}
