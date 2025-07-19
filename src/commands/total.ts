import { getUserPRListByCreationAndParticipation } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import { colors } from '../ui';
import { printBox } from '../ui/components/boxes';

import { withCommonSetup } from './withCommonSetup';

export function createTotalCommand(program: Command) {
  program
    .command('report')
    .alias('r')
    .description('Get comprehensive PR activity report including created and participated PR list')
    .action(async () => {
      await withCommonSetup(async (answers, githubToken, username, spinner) => {
        const {
          username: answeredUsername,
          repository,
          startDate,
          endDate,
          targetBranch,
        } = answers;
        const result = await getUserPRListByCreationAndParticipation({
          githubToken,
          username: answeredUsername || username,
          repository,
          period: {
            startDate,
            endDate,
          },
          targetBranch,
        });
        spinner.succeed(chalk.green.bold('✅ PR activity report generated successfully!'));

        printBox(
          '🐙📊 Report Summary',
          colors.secondary.bold('< GitHub PR Activity Report >') +
            '\n' +
            `👤 Username: ${answeredUsername || username}` +
            '\n' +
            `🗄️ Repository: ${repository}` +
            '\n' +
            `📅 Period: ${startDate} ~ ${endDate}` +
            '\n' +
            `🎯 Target Branch: ${targetBranch || 'All branches'}`,
        );

        console.log('\n🐙📊 User Created PRs:\n', result.userCreatedPRList);
        console.log('\n🐙📊 User Participated PRs:\n', result.userParticipatedPRList);
      });
    });
}
