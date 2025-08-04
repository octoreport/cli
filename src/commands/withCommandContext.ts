import ora, { Ora } from 'ora';

import { login, getGithubToken } from '../features/auth';
import { promptCommonQuestions, promptPermissionConfirmation } from '../features/prompts';

export async function withCommandContext<T>(
  command: (
    answers: Awaited<ReturnType<typeof promptCommonQuestions>>,
    githubToken: string,
    username: string,
    spinner: Ora,
  ) => Promise<T>,
  isPrivateAccess: boolean = false,
) {
  // 권한 확인 프롬프트
  const permissionConfirmed = await promptPermissionConfirmation(isPrivateAccess);
  if (!permissionConfirmed) {
    console.log('❌ Permission denied. Exiting...');
    process.exit(0);
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
    // 이미 처리된 오류인지 확인 (spinner가 이미 fail 상태인지)
    if (!spinner.isSpinning && spinner.text.includes('❌')) {
      // 이미 처리된 오류는 추가 처리하지 않음
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
