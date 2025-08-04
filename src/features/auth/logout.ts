import { getGithubToken, deleteGithubToken, invalidateGitHubToken } from './token';
import { getUserInfo, clearUserInfo } from './userInfo';

export async function logout() {
  try {
    const { email } = getUserInfo();
    if (email) {
      const currentToken = await getGithubToken(email);
      if (currentToken) {
        await invalidateGitHubToken(currentToken);
        await deleteGithubToken(email);
        clearUserInfo();
        console.log('✅ Logout completed successfully!');
      } else {
        console.log('ℹ️ No stored tokens found. Local data cleared.');
      }
    } else {
      console.log('ℹ️ No user information found. Nothing to clear.');
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to process logout:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
