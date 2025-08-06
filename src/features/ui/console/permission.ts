import { RepoScope } from '../../auth';

export function logAccessRangeInfo() {
  console.log('🐙📊 What this tool actually does:');
  console.log('  ✅ Reads PR activity data from repositories');
  console.log('  ✅ Generates reports and analytics');
  console.log('  ❌ Does NOT create, modify, or delete any repository content');
  console.log('  ❌ Does NOT make any changes to your repositories');
  console.log('  🔑 Token is securely stored in your OS keychain');
  console.log('  🙂 You can freely check the source code at https://github.com/octoreport/cli\n');
}

export function logPrivateRepositoryAccessRequestInfo() {
  console.log('\n🔒 Private Repository Access Request');
  console.log('This will grant the following permissions:');
  console.log('  • Full access to public and private repositories (read/write)');
  console.log('  • Access to repository settings, webhooks, and deploy keys');
  console.log('  • Ability to manage issues, pull requests, and wikis');
  console.log('  • Access to organization resources and team memberships');
  console.log('  • Ability to manage user and organization projects');
  console.log('');
  console.log('⚠️  Security Notice: This grants extensive permissions to ALL your repositories.');
  console.log('   Only proceed if you trust this application and understand the implications.\n');
}

export function logPublicRepositoryAccessRequestInfo() {
  console.log('\n🔓 Public Repository Access Request');
  console.log('This will grant the following permissions:');
  console.log('  • Full access to public repositories (read/write)');
  console.log('  • Access to public repository settings and webhooks');
  console.log('  • Ability to manage public repository content');
  console.log('  • Read access to your profile information');
  console.log('');
  console.log('⚠️  Security Notice: This grants read/write access to your public repositories.');
  console.log('   This is more than read-only access.\n');
}

export function logLoginGuide(repoScope: RepoScope) {
  logAccessRangeInfo();
  switch (repoScope) {
    case 'private':
      logPrivateRepositoryAccessRequestInfo();
      break;
    case 'public':
      logPublicRepositoryAccessRequestInfo();
      break;
    default:
      break;
  }
}
