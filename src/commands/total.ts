import { getUserPRListByCreationAndParticipation } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import { withCommonSetup } from './withCommonSetup';

export function createTotalCommand(program: Command) {
  program
    .command('report')
    .alias('r')
    .description('Get comprehensive PR activity report including created and participated PR list')
    .action(async () => {
      await withCommonSetup(async (answers, githubToken, username, spinner) => {
        const result = await getUserPRListByCreationAndParticipation({
          githubToken,
          username: answers.username || username,
          repository: answers.repository,
          period: {
            startDate: answers.startDate,
            endDate: answers.endDate,
          },
          targetBranch: answers.targetBranch,
        });
        spinner.succeed(chalk.green.bold('✅ PR activity report generated successfully!'));

        console.log('\n🐙📊 User Created PRs:\n', result.userCreatedPRList);
        console.log('\n🐙📊 User Participated PRs:\n', result.userParticipatedPRList);
      });
    });
}
