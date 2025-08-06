import { GitHubUserInfo } from '@octoreport/core';
import ora, { Ora } from 'ora';

import {
  getUserCredentialsByPAT,
  getUserCredentialsForRepoScope,
  RepoScope,
} from '../features/auth';
import { promptPRFetchCriteria, promptSecureToken } from '../features/prompts';

function getRepoScopeByScopeList(scopeList: GitHubUserInfo['scopeList']): RepoScope {
  if (scopeList.includes('repo')) {
    return 'private';
  } else {
    return 'public';
  }
}

interface CommandContext {
  answers: Awaited<ReturnType<typeof promptPRFetchCriteria>>;
  githubToken: string;
  username: string;
}

async function getCommandContextForPAT(): Promise<CommandContext> {
  const pat = await promptSecureToken();
  const { token, username: fetchedUsername, scopeList } = await getUserCredentialsByPAT(pat);
  const patRepoScope = getRepoScopeByScopeList(scopeList);
  const answers = await promptPRFetchCriteria(patRepoScope);
  return { answers, githubToken: token, username: fetchedUsername };
}

async function getCommandContextForRepoScope(repoScope: RepoScope): Promise<CommandContext> {
  const { token, username: fetchedUsername } = await getUserCredentialsForRepoScope(repoScope);
  const answers = await promptPRFetchCriteria(repoScope);
  return { answers, githubToken: token, username: fetchedUsername };
}

async function getCommandContextByMode(
  mode: 'pat' | 'normal',
  repoScope: RepoScope,
): Promise<CommandContext> {
  let context: CommandContext;
  if (mode === 'pat') {
    context = await getCommandContextForPAT();
  } else {
    context = await getCommandContextForRepoScope(repoScope);
  }
  return context;
}

export async function withCommandContext<T>(
  command: (context: CommandContext, spinner: Ora) => Promise<T>,
  options: {
    mode: 'pat' | 'normal';
    repoScope: RepoScope;
  },
) {
  const { mode, repoScope } = options;
  const context = await getCommandContextByMode(mode, repoScope);

  const spinner = ora({
    text: '🐙🔎 Processing...',
    spinner: 'dots2',
    color: 'green',
  }).start();

  try {
    await command(context, spinner);
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
