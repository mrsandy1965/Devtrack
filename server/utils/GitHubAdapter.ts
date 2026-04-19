import axios from 'axios';

/**
 * GitHubAdapter – Adapter Pattern wrapping the GitHub REST API.
 * Abstracts all GitHub HTTP calls behind a consistent interface.
 */
class GitHubAdapter {
  private baseURL: string = 'https://api.github.com';
  private defaultHeaders: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  private _getHeaders(token: string | null): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getUserInfo(username: string, token: string | null = null): Promise<any> {
    const res = await axios.get(`${this.baseURL}/users/${username}`, {
      headers: this._getHeaders(token),
    });
    return res.data;
  }

  async getRecentCommits(username: string, token: string | null = null, perPage: number = 5): Promise<any[]> {
    const reposRes = await axios.get(`${this.baseURL}/users/${username}/repos`, {
      headers: this._getHeaders(token),
      params: { sort: 'pushed', per_page: perPage, type: 'owner' },
    });

    const repos = reposRes.data.slice(0, 5);

    let allCommits: any[] = [];
    for (const repo of repos) {
      try {
        const commitsRes = await axios.get(
          `${this.baseURL}/repos/${username}/${repo.name}/commits`,
          {
            headers: this._getHeaders(token),
            params: { author: username, per_page: 10 },
          }
        );
        const commits = commitsRes.data.map((c: any) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split('\n')[0],
          date: c.commit.author.date,
          repo: repo.name,
          url: c.html_url,
        }));
        allCommits = allCommits.concat(commits);
      } catch {
        // Skip repos with no access
      }
    }

    allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return allCommits.slice(0, 30);
  }

  async getCommitCountLastNDays(username: string, token: string | null = null, days: number = 30): Promise<{ totalCommits: number; dailyCounts: Record<string, number> }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reposRes = await axios.get(`${this.baseURL}/users/${username}/repos`, {
      headers: this._getHeaders(token),
      params: { sort: 'pushed', per_page: 10, type: 'owner' },
    });

    let totalCommits = 0;
    const dailyCounts: Record<string, number> = {};

    for (const repo of reposRes.data.slice(0, 10)) {
      try {
        const commitsRes = await axios.get(
          `${this.baseURL}/repos/${username}/${repo.name}/commits`,
          {
            headers: this._getHeaders(token),
            params: { author: username, since: since.toISOString(), per_page: 100 },
          }
        );
        totalCommits += commitsRes.data.length;

        commitsRes.data.forEach((c: any) => {
          const day = c.commit.author.date.split('T')[0];
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });
      } catch {
        // Skip
      }
    }

    return { totalCommits, dailyCounts };
  }
}

export default new GitHubAdapter();
