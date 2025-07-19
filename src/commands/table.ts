import { getUserPRListByCreationAndParticipation } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import { printBox } from '../ui/components/boxes';
import { addTotalRow, createPRTable } from '../ui/components/tables';

import { withCommonSetup } from './withCommonSetup';

const TABLE_CONFIGS = {
  userCreatedPRTable: { columns: ['Created At', 'Merged At'], widths: [15, 15] },
  userParticipatedPRTable: {
    columns: ['Is Reviewed By Me', 'Is Commented By Me'],
    widths: [15, 15],
  },
} as const;

export function createTableCommand(program: Command) {
  program
    .command('table')
    .alias('t')
    .description('Get comprehensive PR activity table')
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
        const userCreatedPRListCount = result.userCreatedPRList.length;
        const userParticipatedPRListCount = result.userParticipatedPRList.length;
        spinner.succeed(chalk.green.bold('✅ PR activity report generated successfully!'));

        printBox(
          '🐙🔍 Search Criteria',
          `👤 Username: ${answeredUsername || username}` +
            '\n' +
            `🗄️ Repository: ${repository}` +
            '\n' +
            `📅 Period: ${startDate} ~ ${endDate}` +
            '\n' +
            `🎯 Target Branch: ${targetBranch || 'All branches'}`,
        );

        const userCreatedPRTable = createPRTable(
          [...TABLE_CONFIGS.userCreatedPRTable.columns],
          [...TABLE_CONFIGS.userCreatedPRTable.widths],
        );

        userCreatedPRTable.push(
          ...result.userCreatedPRList.map((pr) => [
            pr.number,
            pr.title,
            pr.author,
            pr.targetBranch,
            pr.url,
            pr.state,
            pr.createdAt,
            pr.mergedAt,
          ]),
        );
        addTotalRow(userCreatedPRTable, userCreatedPRListCount, 7);

        const userParticipatedPRTable = createPRTable(
          [...TABLE_CONFIGS.userParticipatedPRTable.columns],
          [...TABLE_CONFIGS.userParticipatedPRTable.widths],
        );
        userParticipatedPRTable.push(
          ...result.userParticipatedPRList.map((pr) => [
            pr.number,
            pr.title,
            pr.author,
            pr.targetBranch,
            pr.url,
            pr.state,
            { content: pr.reviewers.includes(username) ? '✅' : '❌' },
            { content: pr.comments && pr.comments.includes(username) ? '✅' : '❌' },
          ]),
        );
        addTotalRow(userParticipatedPRTable, userParticipatedPRListCount, 7);

        console.log(userCreatedPRTable.toString());
        console.log(userParticipatedPRTable.toString());
      });
    });
}
