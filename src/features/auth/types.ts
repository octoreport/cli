export type RepoScope = 'public' | 'private';

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
}
export interface StoredCredentials {
  id: string;
  username: string;
  token: string;
  repoScope: RepoScope;
}
