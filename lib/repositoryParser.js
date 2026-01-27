function normalizeGitHubUrl(repo) {
  if (!repo || typeof repo !== "string") {
    return null;
  }

  const trimmed = repo.trim();
  if (!trimmed) {
    return null;
  }

  let candidate = trimmed;

  if (candidate.startsWith("git+")) {
    candidate = candidate.slice(4);
  }

  if (candidate.startsWith("github:")) {
    candidate = candidate.slice("github:".length);
  } else if (
    !candidate.startsWith("http://") &&
    !candidate.startsWith("https://") &&
    /^[a-z]+:/i.test(candidate)
  ) {
    return null;
  }

  const githubMatch =
    candidate.match(/github\.com[:/]+([^/]+)\/([^/]+?)(?:\.git)?$/i) ||
    candidate.match(/^([^/]+)\/([^/]+)$/);

  if (!githubMatch) {
    return null;
  }

  const owner = githubMatch[1];
  const repoName = githubMatch[2].replace(/\.git$/, "");
  return `https://github.com/${owner}/${repoName}`;
}

function parseRepository(repository) {
  if (!repository) {
    return null;
  }

  if (typeof repository === "string") {
    return normalizeGitHubUrl(repository);
  }

  if (typeof repository === "object" && typeof repository.url === "string") {
    return normalizeGitHubUrl(repository.url);
  }

  return null;
}

module.exports = parseRepository;
