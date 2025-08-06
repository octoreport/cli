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

export async function getCredentials(key: string): Promise<string> {
  if (!key) throw new Error('Key is not found. Please check your auth status.');

  const entry = new Entry(SERVICE_NAME, key);
  let credentials = entry.getPassword() ?? '';

  // keytar to keyring migration
  if (!credentials) {
    try {
      const keytar = await loadKeytar();
      if (keytar) {
        const oldTokenStoredInKeytar = await keytar.getPassword(SERVICE_NAME, key);
        if (oldTokenStoredInKeytar) {
          entry.setPassword(oldTokenStoredInKeytar);
          await keytar.deletePassword(SERVICE_NAME, key);
          console.log('🔄 Credentials successfully migrated from keytar to keyring');
          credentials = oldTokenStoredInKeytar;
        }
      }
    } catch {
      // migration failed silently (new auth flow)
    }
  }

  return credentials;
}

export async function setCredentials(key: string, credentials: string) {
  if (!key) throw new Error('Key is not found. Please check your auth status.');

  const entry = new Entry(SERVICE_NAME, key);
  entry.setPassword(credentials);

  // delete old token stored in keytar
  try {
    const keytar = await loadKeytar();
    if (keytar) {
      await keytar.deletePassword(SERVICE_NAME, key);
    }
  } catch {
    // keytar deletion failed silently (already migrated to keyring)
  }
}

export async function deleteCredentials(key: string) {
  const entry = new Entry(SERVICE_NAME, key);
  entry.deletePassword();

  // delete old token stored in keytar
  try {
    const keytar = await loadKeytar();
    if (keytar) {
      await keytar.deletePassword(SERVICE_NAME, key);
    }
  } catch {
    // keytar deletion failed silently (already migrated to keyring)
  }
}
