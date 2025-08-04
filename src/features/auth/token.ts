import { Entry } from '@napi-rs/keyring';

let keytar: typeof import('keytar') | undefined;
try {
  const keytarModule = await import('keytar');
  keytar = (keytarModule.default ?? keytarModule) as typeof import('keytar');
} catch {
  /* keytar is not installed */
}

const SERVICE_NAME = '@octoreport/cli';
export async function getGithubToken(email: string): Promise<string> {
  if (!email) throw new Error('GitHub email not found. Please log in first!!!!!');

  const entry = new Entry(SERVICE_NAME, email);
  let token = entry.getPassword() ?? undefined;

  if (!token && keytar) {
    token = (await keytar.getPassword(SERVICE_NAME, email)) ?? undefined;
    if (token) {
      entry.setPassword(token);
      const { deletePassword } = keytar;
      await deletePassword(SERVICE_NAME, email);
      console.log('🔄 token successfully migrated from keytar to keyring');
    }
  }
  return token ?? '';
}

export async function setGithubToken(email: string, token: string) {
  if (!email) throw new Error('GitHub email not found. Please log in first!!!!!');

  const entry = new Entry(SERVICE_NAME, email);
  entry.setPassword(token);

  if (keytar) await keytar.deletePassword(SERVICE_NAME, email);
}

export async function deleteGithubToken(email: string) {
  const entry = new Entry(SERVICE_NAME, email);
  entry.deletePassword();
  if (keytar) await keytar.deletePassword(SERVICE_NAME, email);
}
