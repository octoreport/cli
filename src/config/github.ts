export const GITHUB_CONFIG = {
  CLIENT_ID: 'Ov23lia7pFpgs8ULT1DL',
  BASE_URL: 'https://api.github.com',
  API_VERSION: '2022-11-28',
} as const;

export const GITHUB_SCOPES = {
  PUBLIC_REPO: ['public_repo'],
  PRIVATE_REPO: ['repo'],
  USER_INFO: ['read:user', 'user:email'],
} as const;
