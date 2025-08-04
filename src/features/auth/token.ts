import { Entry } from '@napi-rs/keyring';

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

export async function clearAllTokens() {
  try {
    const { getUserInfo } = await import('./userInfo');
    const { email } = getUserInfo();
    if (email) {
      await deleteGithubToken(email);
      console.log('🗑️ All stored tokens have been cleared.');
    }
  } catch (error) {
    console.log(
      '⚠️ Failed to clear tokens:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
