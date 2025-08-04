import { Command } from 'commander';

import { clearAllTokens } from '../features/auth';

export function registerLogoutCommand(program: Command) {
  program
    .command('logout')
    .description('Clear stored authentication tokens')
    .action(async () => {
      await clearAllTokens();
    });
}
