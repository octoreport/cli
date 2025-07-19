import { getUserPRListByCreationAndParticipation } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import { printBox } from '../ui/components/boxes';
import { TableConfig, renderTable } from '../ui/components/tables';

import { withCommonSetup } from './withCommonSetup';

export const COMMON_TABLE_CONFIG: TableConfig[] = [
  { width: 10, title: 'Number', key: 'number' },
  { width: 30, title: 'Title', key: 'title' },
  { width: 15, title: 'Author', key: 'author' },
  { width: 10, title: 'Target Branch', key: 'targetBranch' },
  { width: 50, title: 'Url', key: 'url' },
  { width: 10, title: 'State', key: 'state' },
];

function getFormat(format: string): 'table' | 'json' | 'general' {
  switch (format) {
    case 'table':
      return 'table';
    case 'json':
      return 'json';
    default:
      return 'general';
  }
}

export function registerAllCommand(program: Command) {
  program
    .command('all')
    .alias('a')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .description('Get comprehensive PR activity table and json')
    .action(async ({ format }) => {
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
          '🐙🔍 Search Criteria',
          `👤 Username: ${answeredUsername || username}` +
            '\n' +
            `🗄️ Repository: ${repository}` +
            '\n' +
            `📅 Period: ${startDate} ~ ${endDate}` +
            '\n' +
            `🎯 Target Branch: ${targetBranch || 'All branches'}` +
            '\n' +
            `✨ Format: ${getFormat(format)}`,
        );
        if (format === 'table') {
          const userCreatedPRTableConfig: TableConfig[] = [
            ...COMMON_TABLE_CONFIG,
            { width: 15, title: 'Created At', key: 'createdAt' },
            { width: 15, title: 'Merged At', key: 'mergedAt' },
          ];
          renderTable(userCreatedPRTableConfig, result.userCreatedPRList);

          const userParticipatedPRTableConfig: TableConfig[] = [
            ...COMMON_TABLE_CONFIG,
            { width: 15, title: 'Is Reviewed By Me', key: 'reviewers' },
            { width: 15, title: 'Is Commented By Me', key: 'comments' },
          ];
          renderTable(
            userParticipatedPRTableConfig,
            result.userParticipatedPRList.map((pr) => ({
              ...pr,
              reviewers: [pr.reviewers.includes(username) ? '✅' : '❌'],
              comments: [pr.comments && pr.comments.includes(username) ? '✅' : '❌'],
            })),
          );
        } else if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('\n🐙📊 User Created PRs:\n', result.userCreatedPRList);
          console.log('\n🐙📊 User Participated PRs:\n', result.userParticipatedPRList);
        }
      });
    });
}
