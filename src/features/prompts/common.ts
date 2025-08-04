import inquirer from 'inquirer';

export async function promptCommonQuestions(privateAccess: boolean = false) {
  const repositoryMessage = privateAccess
    ? '🐙 Enter the repository (e.g., facebook/react) - Private repositories are now accessible:'
    : '🐙 Enter the repository (e.g., facebook/react) - Only public repositories are accessible:';

  return await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message:
        '🐙 Optionally, enter the target GitHub username (press Enter to skip and use your own):',
    },
    {
      type: 'input',
      name: 'repository',
      message: repositoryMessage,
    },
    {
      type: 'input',
      name: 'startDate',
      message: '🐙 Enter start date (YYYY-MM-DD):',
    },
    {
      type: 'input',
      name: 'endDate',
      message: '🐙 Enter end date (YYYY-MM-DD):',
    },
    {
      type: 'input',
      name: 'targetBranch',
      message: '🐙 Optionally, Enter target branch (press Enter to target all branches):',
    },
  ]);
}

export async function promptPermissionConfirmation(privateAccess: boolean = false) {
  console.log('📋 **What this tool actually does:**');
  console.log('  • Reads PR activity data from repositories');
  console.log('  • Generates reports and analytics');
  console.log('  • Does NOT create, modify, or delete any repository content');
  console.log('  • Does NOT make any changes to your repositories');
  console.log('  • Token is securely stored in your OS keychain\n');

  if (privateAccess) {
    console.log('\n🔒 **Private Repository Access Request**');
    console.log('This will grant the following permissions:');
    console.log('  • Full access to public and private repositories (read/write)');
    console.log('  • Access to repository settings, webhooks, and deploy keys');
    console.log('  • Ability to manage issues, pull requests, and wikis');
    console.log('  • Access to organization resources and team memberships');
    console.log('  • Ability to manage user and organization projects');
    console.log('');
    console.log(
      '⚠️  **Security Notice**: This grants extensive permissions to ALL your repositories.',
    );
    console.log('   Only proceed if you trust this application and understand the implications.\n');
  } else {
    console.log('\n🔓 **Public Repository Access Request**');
    console.log('This will grant the following permissions:');
    console.log('  • Full access to public repositories (read/write)');
    console.log('  • Access to public repository settings and webhooks');
    console.log('  • Ability to manage public repository content');
    console.log('  • Read access to your profile information');
    console.log('');
    console.log(
      '⚠️  **Security Notice**: This grants read/write access to your public repositories.',
    );
    console.log('   This is more than read-only access.\n');
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: privateAccess
        ? 'Do you want to proceed with private repository access? (y/N)'
        : 'Do you want to proceed with public repository access? (y/N)',
      default: false,
    },
  ]);

  return confirm;
}
