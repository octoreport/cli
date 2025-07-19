import keytar from 'keytar';

const { getPassword, setPassword } = keytar;

export async function getGithubToken(githubEmail: string): Promise<string> {
  if (!githubEmail) {
    throw new Error('GitHub email not found. Please log in first.');
  }
  return (await getPassword('@octoreport/cli', githubEmail)) ?? '';
}

export async function setGithubToken(githubEmail: string, token: string) {
  if (!githubEmail) {
    throw new Error('GitHub email not found. Please log in first.');
  }
  await setPassword('@octoreport/cli', githubEmail, token);
}
