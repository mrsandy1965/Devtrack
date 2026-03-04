const axios = require('axios');

/**
 * GitHubAdapter – Adapter Pattern wrapping the GitHub REST API.
 * Abstracts all GitHub HTTP calls behind a consistent interface.
 */
class GitHubAdapter {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.defaultHeaders = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  _getHeaders(token) {
    return {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getUserInfo(username, token = null) {
    const res = await axios.get(`${this.baseURL}/users/${username}`, {
      headers: this._getHeaders(token),
    });
    return res.data;
  }

  async getRecentCommits(username, token = null, perPage = 5) {
    // Get user's public repos
    const reposRes = await axios.get(`${this.baseURL}/users/${username}/repos`, {
      headers: this._getHeaders(token),
      params: { sort: 'pushed', per_page: perPage, type: 'owner' },
    });

    const repos = reposRes.data.slice(0, 5);

    let allCommits = [];
    for (const repo of repos) {
      try {
        const commitsRes = await axios.get(
          `${this.baseURL}/repos/${username}/${repo.name}/commits`,
          {
            headers: this._getHeaders(token),
            params: { author: username, per_page: 10 },
          }
        );
        const commits = commitsRes.data.map((c) => ({
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

    // Sort by date
    allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allCommits.slice(0, 30);
  }

  async getCommitCountLastNDays(username, token = null, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reposRes = await axios.get(`${this.baseURL}/users/${username}/repos`, {
      headers: this._getHeaders(token),
      params: { sort: 'pushed', per_page: 10, type: 'owner' },
    });

    let totalCommits = 0;
    const dailyCounts = {};

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

        commitsRes.data.forEach((c) => {
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

// Singleton export
module.exports = new GitHubAdapter();
