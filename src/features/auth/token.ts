import { Entry } from '@napi-rs/keyring';

import { GITHUB_CONFIG } from '../../config/github';

const SERVICE_NAME = '@octoreport/cli';

async function loadKeytar() {
  try {
    const keytarModule = await import('keytar');
    const keytar = keytarModule.default || keytarModule;

    if (
      keytar &&
      typeof keytar.getPassword === 'function' &&
      typeof keytar.deletePassword === 'function'
    ) {
      return keytar;
    }
  } catch {
    // keytar is not installed
  }
  return null;
}

export async function getGithubToken(email: string): Promise<string> {
  if (!email) throw new Error('GitHub email not found. Please log in first.');

  const entry = new Entry(SERVICE_NAME, email);
  let token = entry.getPassword() ?? '';

  // keytar to keyring migration
  if (!token) {
    try {
      const keytar = await loadKeytar();
      if (keytar) {
        const oldTokenStoredInKeytar = await keytar.getPassword(SERVICE_NAME, email);
        if (oldTokenStoredInKeytar) {
          entry.setPassword(oldTokenStoredInKeytar);
          await keytar.deletePassword(SERVICE_NAME, email);
          console.log('🔄 Token successfully migrated from keytar to keyring');
          token = oldTokenStoredInKeytar;
        }
      }
    } catch {
      // migration failed silently (new auth flow)
    }
  }

  return token;
}

export async function setGithubToken(email: string, token: string) {
  if (!email) throw new Error('GitHub email not found. Please log in first.');

  const entry = new Entry(SERVICE_NAME, email);
  entry.setPassword(token);

  // delete old token stored in keytar
  try {
    const keytar = await loadKeytar();
    if (keytar) {
      await keytar.deletePassword(SERVICE_NAME, email);
    }
  } catch {
    // keytar deletion failed silently (already migrated to keyring)
  }
}

export async function deleteGithubToken(email: string) {
  const entry = new Entry(SERVICE_NAME, email);
  entry.deletePassword();

  // delete old token stored in keytar
  try {
    const keytar = await loadKeytar();
    if (keytar) {
      await keytar.deletePassword(SERVICE_NAME, email);
    }
  } catch {
    // keytar deletion failed silently (already migrated to keyring)
  }
}

export async function revokeGitHubToken(accessToken: string): Promise<void> {
  try {
    const response = await fetch(
      `${GITHUB_CONFIG.BASE_URL}/applications/${GITHUB_CONFIG.CLIENT_ID}/grant`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${accessToken}`,
          'X-GitHub-Api-Version': GITHUB_CONFIG.API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      },
    );

    switch (response.status) {
      case 204:
        console.log('✅ GitHub OAuth app authorization revoked successfully');
        break;
      case 404:
        console.log('ℹ️ No active authorization found to revoke');
        break;
      default:
        console.log(`⚠️ Failed to revoke authorization: ${response.status} ${response.statusText}`);
        break;
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to revoke GitHub authorization:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
