import chalk from 'chalk';
import { Command } from 'commander';

import { login, logout } from '../features/auth';
import type { RepoScope } from '../features/auth/types';

export function registerLoginCommand(program: Command) {
  program
    .command('login')
    .description('Login to GitHub')
    .option('--repo-scope <repoScope>', 'Repository scope (public, private)', 'public')
    .action(async ({ repoScope }: { repoScope: RepoScope }) => {
      console.log(chalk.blue('🔐 Logging in to GitHub...'));
      try {
        await login(repoScope);
        console.log(chalk.green('✅ Successfully logged in!'));
        if (repoScope === 'private') {
          console.log(
            chalk.yellow(
              'ℹ️ You can access your private and public repositories with `octoreport all` command.',
            ),
          );
        } else {
          console.log(
            chalk.yellow(
              'ℹ️ You can access your public repositories with `octoreport all` command.',
            ),
          );
        }
      } catch (error) {
        console.log(
          chalk.red('❌ Failed to login: '),
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    });
}

export function registerLogoutCommand(program: Command) {
  program
    .command('logout')
    .description('Logout and revoke GitHub OAuth app authorization')
    .action(async () => {
      console.log(chalk.blue('🔐 Logging out from GitHub...'));

      try {
        await logout();
        console.log(chalk.green('✅ Successfully logged out!'));
        console.log(chalk.yellow('ℹ️ You will need to log in again to use @octoreport/cli.'));
      } catch (error) {
        console.log(
          chalk.red('❌ Failed to logout: '),
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    });
}
