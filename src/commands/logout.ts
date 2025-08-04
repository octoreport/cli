import chalk from 'chalk';
import { Command } from 'commander';

import { logout } from '../features/auth/logout';
import { clearUserInfo } from '../features/auth/userInfo';

export function registerLogoutCommand(program: Command) {
  program
    .command('logout')
    .description('Logout and revoke GitHub OAuth app authorization')
    .action(async () => {
      console.log(chalk.blue('🔐 Logging out from GitHub...'));

      try {
        await logout();
        clearUserInfo();
        console.log(chalk.green('✅ Successfully logged out!'));
        console.log(chalk.yellow('ℹ️ You will need to log in again to use @octoreport/cli.'));
      } catch (error) {
        console.log(
          chalk.red('❌ Failed to logout:'),
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    });
}
