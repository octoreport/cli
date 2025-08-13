import { getUserPRActivityListInPeriod } from '@octoreport/core';
import chalk from 'chalk';
import { Command } from 'commander';

import type { RepoScope } from '../features/auth/types';
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
  { width: 60, title: 'Url', key: 'url' },
  { width: 10, title: 'State', key: 'state' },
];

function getAuthenticationModeDescription(mode: 'pat' | 'normal'): string {
  switch (mode) {
    case 'pat':
      return '   • Personal Access Token mode\n   • You will need to enter your PAT each time\n   • No tokens are stored on your system';
    case 'normal':
      return `   • OAuth flow mode\n   • Token is securely stored in your OS keychain\n   • You can invalidate token by executing 'octoreport logout'\n`;
  }
}

function getRepositoryScopeDescription(repoScope: RepoScope): string {
  switch (repoScope) {
    case 'public':
      return '   • Access to public repositories only\n   • Private repositories will be excluded';
    case 'private':
      return '   • Access to both public and private repositories\n   • Full repository access granted';
  }
}

async function handleAllCommand(
  format: Format,
  options: {
    mode: 'pat' | 'normal';
    repoScope: RepoScope;
  },
) {
  const { mode, repoScope } = options;

  printBox(
    '🔐 Authentication & Access Settings',
    `${chalk.blue.bold('🔑 Authentication Mode:')} ${chalk.bold(mode.toUpperCase())}\n${getAuthenticationModeDescription(mode)}\n${chalk.blue.bold('🔒 Repository Scope:')} ${chalk.bold(repoScope.toUpperCase())}\n${getRepositoryScopeDescription(repoScope)}`,
  );
  await withCommandContext(
    async (context, spinner) => {
      const { answers, githubToken, username } = context;
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
        formatSearchCriteriaDisplay({
          username: answeredUsername || username,
          repository,
          period: `${startDate} ~ ${endDate}`,
          branch: targetBranch || 'All branches',
          format: getFormat(format),
          mode: mode.toUpperCase(),
          scope: repoScope.toUpperCase(),
        }),
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
    .description(
      'Generate comprehensive PR activity reports for GitHub repositories 🐙📊\n\n' +
        'This command analyzes your Pull Request activities including:\n' +
        'ℹ️ PRs you created\n' +
        'ℹ️ PRs you participated in (reviews, comments)\n\n' +
        'Output Format:\n' +
        '• --format table: Default format. Display results in a table\n' +
        '• --format json: Display results in JSON format\n' +
        '• --format general: Display results in a more readable format\n\n' +
        'Authentication Options:\n' +
        '• --mode normal: Default mode. Use OAuth flow (tokens are securely stored)\n\n' +
        '• --mode pat: Use Personal Access Token (requires manual input each time)\n' +
        'Repository Access:\n' +
        '• --repo-scope public: Default scope. Access public repositories only\n' +
        '• --repo-scope private: Access both public and private repositories\n\n' +
        'Example:\n' +
        'octoreport all --mode pat --repo-scope private --format json',
    )
    .option('--format <format>', 'Output format (table, json)', 'table')
    .option(
      '--mode <mode>',
      'Authentication mode: pat (Personal Access Token - requires manual token input each time, no storage) or normal (OAuth flow with token storage)',
      'normal',
    )
    .option(
      '--repo-scope <repoScope>',
      'Repository access scope: public (public repositories only) or private (both public and private repositories)',
      'public',
    )
    .action(async ({ format, mode, repoScope }) => {
      handleAllCommand(format, { mode, repoScope });
    });
}

interface SearchCriteriaDisplay {
  username: string;
  repository: string;
  period: string;
  branch: string;
  format: string;
  mode: string;
  scope: string;
}

const formatSearchCriteriaDisplay = ({
  username,
  repository,
  period,
  branch,
  format,
  mode,
  scope,
}: SearchCriteriaDisplay) => {
  return `👤 Username: ${username}
💾 Repository: ${repository}
📅 Period: ${period}
🎯 Target Branch: ${branch}
✨ Format: ${format}
🎨 Mode: ${mode}
🔒 Repo Scope: ${scope}`;
};
