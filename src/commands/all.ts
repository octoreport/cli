import { getUserPRActivityListInPeriod } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import { printBox, TableConfig, renderTable } from '../features/ui';

import { withCommandContext } from './withCommandContext';

type Format = 'table' | 'json' | 'general';

function getFormat(format: Format): Format {
  switch (format) {
    case 'table':
      return 'table';
    case 'json':
      return 'json';
    default:
      return 'general';
  }
}

const COMMON_TABLE_CONFIG: TableConfig[] = [
  { width: 10, title: 'Number', key: 'number' },
  { width: 30, title: 'Title', key: 'title' },
  { width: 15, title: 'Author', key: 'author' },
  { width: 10, title: 'Target Branch', key: 'targetBranch' },
  { width: 50, title: 'Url', key: 'url' },
  { width: 10, title: 'State', key: 'state' },
];

async function handleAllCommand(
  format: Format,
  options: {
    mode: 'pat' | 'normal';
    repoScope: 'public' | 'private';
  },
) {
  const { mode, repoScope } = options;
  await withCommandContext(
    async (answers, githubToken, username, spinner) => {
      const { username: answeredUsername, repository, startDate, endDate, targetBranch } = answers;
      const result = await getUserPRActivityListInPeriod({
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
          `✨ Format: ${getFormat(format)}` +
          '\n' +
          `🕹️ Mode: ${mode.toUpperCase()}` +
          '\n' +
          `🔒 Repo Scope: ${repoScope.toUpperCase()}`,
      );
      if (format === 'table') {
        const userCreatedPRTableConfig: TableConfig[] = [
          ...COMMON_TABLE_CONFIG,
          { width: 15, title: 'Created At', key: 'createdAt' },
          { width: 15, title: 'Merged At', key: 'mergedAt' },
        ];
        renderTable(userCreatedPRTableConfig, result.created);

        const userParticipatedPRTableConfig: TableConfig[] = [
          ...COMMON_TABLE_CONFIG,
          { width: 15, title: 'Is Reviewed By Me', key: 'reviewers' },
          { width: 15, title: 'Is Commented By Me', key: 'commenters' },
        ];
        renderTable(
          userParticipatedPRTableConfig,
          result.participated.map((pr) => ({
            ...pr,
            reviewers: [pr.reviewers?.includes(username || answeredUsername) ? '✅' : '❌'],
            commenters: [pr.commenters?.includes(username || answeredUsername) ? '✅' : '❌'],
          })),
        );
      } else if (format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\n🐙📊 User Created PRs:\n', result.created);
        console.log('\n🐙📊 User Participated PRs:\n', result.participated);
      }
    },
    { mode, repoScope },
  );
}

export function registerAllCommand(program: Command) {
  program
    .command('all')
    .alias('a')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .option('--mode <mode>', 'Mode (pat, normal)', 'normal')
    .option('--repo-scope <repoScope>', 'Repository scope (public, private)', 'public')
    .description('Get comprehensive PR activity table and json')
    .action(async ({ format, mode, repoScope }) => {
      handleAllCommand(format, { mode, repoScope });
    });
}
