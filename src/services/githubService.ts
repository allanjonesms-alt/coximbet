import axios from 'axios';

export interface GithubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export const githubService = {
  async getAuthUrl() {
    const response = await fetch('/api/auth/github/url');
    if (!response.ok) throw new Error('Failed to get auth URL');
    return await response.json();
  },

  async getRepoInfo(token: string, repoUrl: string): Promise<GithubRepo> {
    // Extract owner and repo from URL: https://github.com/owner/repo
    const parts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = parts[0];
    const repo = parts[1];

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.data;
  },

  async getUserInfo(token: string) {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  }
};
