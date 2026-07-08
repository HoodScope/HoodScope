/** Single source of truth — HoodScope repo & site URLs */
export const PROJECT = {
  name: "HoodScope",
  slug: "hoodscope",
  domain: "https://hoodscope.pro",
  github: {
    owner: "HoodScope",
    repo: "HoodScope",
  },
  social: {
    x: "https://x.com/gohoodscope",
    github: "https://github.com/HoodScope",
  },
} as const;

export const GITHUB_REPO_URL = `https://github.com/${PROJECT.github.owner}/${PROJECT.github.repo}`;
export const GITHUB_CLONE_URL = `${GITHUB_REPO_URL}.git`;
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
export const GITHUB_PROFILE_URL = PROJECT.social.github;
