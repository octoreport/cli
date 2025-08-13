import fs from 'fs';
import os from 'os';
import path from 'path';

const configDir = path.join(os.homedir(), '.octoreport', 'cli');
const tokenPath = path.join(configDir, 'user_info.json');

export function saveUserInfoToFile(user: { username: string; id: string }) {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(tokenPath, JSON.stringify({ user }), 'utf-8');
}

export function loadUserInfoFromFile(): { username: string; id: string } {
  if (!fs.existsSync(tokenPath)) return { username: '', id: '' };
  const { user } = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  return { username: user.username, id: user.id };
}

export function deleteUserInfoFile(): void {
  try {
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
  } catch (error) {
    console.error('Error clearing user info:', error);
  }
}
