import ora, { Ora } from 'ora';

import { login, getGithubToken } from '../features/auth';
import {
  promptCommonQuestions,
  promptPrivateRepositoryAccessPermissionQuestion,
} from '../features/prompts';

export async function withCommandContext<T>(
  command: (
    answers: Awaited<ReturnType<typeof promptCommonQuestions>>,
    githubToken: string,
    username: string,
    spinner: Ora,
  ) => Promise<T>,
  isPrivateAccess: boolean = false,
) {
  if (isPrivateAccess) {
    const isPermitted = await promptPrivateRepositoryAccessPermissionQuestion();
    if (!isPermitted) {
      console.log('❌ Permission denied. Exiting...');
      process.exit(0);
    }
  }

  const { email, username } = await login(isPrivateAccess);
  const githubToken = await getGithubToken(email);
  const answers = await promptCommonQuestions(isPrivateAccess);

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
