import { Command } from 'commander';

import { handleAllCommand } from './handler';

export function registerAllCommand(program: Command) {
  program
    .command('all')
    .alias('a')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .description('Get comprehensive PR activity table and json')
    .action(async ({ format }) => {
      handleAllCommand(format);
    });
}
