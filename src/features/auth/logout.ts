import { getGithubToken, deleteGithubToken, revokeGitHubToken } from './token';
import { getUserInfo, clearUserInfo } from './userInfo';

export async function logout() {
  try {
    const { email } = getUserInfo();
    if (email) {
      const currentToken = await getGithubToken(email);
      if (currentToken) {
        await revokeGitHubToken(currentToken);
        await deleteGithubToken(email);
        clearUserInfo();
        console.log('🗑️ All stored tokens have been cleared.');
      } else {
        console.log('🗑️ No stored tokens found. Please log in first.');
      }
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to clear tokens:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
