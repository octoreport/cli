import fs from 'fs';
import os from 'os';
import path from 'path';

const configDir = path.join(os.homedir(), '.octoreport', 'cli');
const tokenPath = path.join(configDir, 'user_info.json');

export function setUserInfo(user: { username: string; email: string }) {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(tokenPath, JSON.stringify({ user }), 'utf-8');
}

export function getUserInfo(): { username: string; email: string } {
  if (!fs.existsSync(tokenPath)) return { username: '', email: '' };
  const { user } = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  return { username: user.username, email: user.email };
}

export function clearUserInfo(): void {
  try {
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
  } catch (error) {
    console.error('Error clearing user info:', error);
  }
}
