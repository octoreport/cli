import ora, { Ora } from 'ora';

import { login, getGithubToken } from '../features/auth';
import { promptCommonQuestions } from '../features/prompts';

export async function withCommandContext<T>(
  command: (
    answers: Awaited<ReturnType<typeof promptCommonQuestions>>,
    githubToken: string,
    username: string,
    spinner: Ora,
  ) => Promise<T>,
) {
  const { email, username } = await login();
  const githubToken = await getGithubToken(email);
  const answers = await promptCommonQuestions();

  const spinner = ora({
    text: '🐙🔎 Processing...',
    spinner: 'dots2',
    color: 'green',
  }).start();

  try {
    await command(answers, githubToken, username, spinner);
  } catch (error) {
    const errorMessage = error instanceof Error && error.message ? error.message : 'Unknown error';
    spinner.fail(`❌ Failed to execute command: ${errorMessage}. Please try again.`);
    console.error(error);
  } finally {
    spinner.stop();
  }
}
