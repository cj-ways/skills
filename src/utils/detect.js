import { existsSync } from "fs";
import { join } from "path";

export function isInsideProject(cwd = process.cwd()) {
  return existsSync(join(cwd, ".git"));
}

export function detectExistingAgents(cwd = process.cwd()) {
  return {
    claude: existsSync(join(cwd, "CLAUDE.md")) || existsSync(join(cwd, ".claude")),
    codex: existsSync(join(cwd, "AGENTS.md")) || existsSync(join(cwd, ".codex")),
    multi: existsSync(join(cwd, ".agents", "skills")),
  };
}

export function suggestAgent(cwd = process.cwd()) {
  const agents = detectExistingAgents(cwd);
  if (agents.multi) return "multi";
  if (agents.claude && agents.codex) return "multi";
  if (agents.codex) return "codex";
  return "claude";
}

