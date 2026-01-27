const test = require("node:test");
const assert = require("node:assert/strict");

const parseRepository = require("../lib/repositoryParser");

test("parseRepository handles string formats", () => {
  assert.equal(
    parseRepository("github:openai/codex"),
    "https://github.com/openai/codex"
  );
  assert.equal(
    parseRepository("openai/codex"),
    "https://github.com/openai/codex"
  );
  assert.equal(
    parseRepository("https://github.com/openai/codex"),
    "https://github.com/openai/codex"
  );
  assert.equal(
    parseRepository("git+https://github.com/openai/codex.git"),
    "https://github.com/openai/codex"
  );
});

test("parseRepository handles object formats and invalid values", () => {
  assert.equal(
    parseRepository({ type: "git", url: "https://github.com/openai/codex.git" }),
    "https://github.com/openai/codex"
  );
  assert.equal(parseRepository({ type: "git", url: "bitbucket:org/repo" }), null);
  assert.equal(parseRepository(null), null);
  assert.equal(parseRepository(""), null);
});
