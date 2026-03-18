import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, "..", "..");

export function getPackageSkillsDir() {
  return join(PACKAGE_ROOT, "skills");
}

export function getPackageAgentsDir() {
  return join(PACKAGE_ROOT, "agents");
}

export function getTargetDirs(agent, scope) {
  const base = scope === "user" ? homedir() : process.cwd();

  switch (agent) {
    case "claude":
      return {
        skills: join(base, ".claude", "skills"),
        agents: join(base, ".claude", "agents"),
      };
    case "codex":
      return {
        skills: join(base, ".agents", "skills"),
        agents: null, // Codex doesn't have a separate agents dir
      };
    case "multi":
      return {
        skills: join(base, ".agents", "skills"), // canonical
        agents: join(base, ".claude", "agents"), // agents still go to claude
        mirrors: [
          join(base, ".claude", "skills"),
          join(base, ".cursor", "skills"),
        ],
      };
    default:
      return {
        skills: join(base, ".claude", "skills"),
        agents: join(base, ".claude", "agents"),
      };
  }
}

export function getAvailableSkills() {
  return [
    "agent-audit",
    "feature-audit",
    "new-project-idea",
    "find-unused",
    "persist-knowledge",
    "create-pr",
    "deploy-prep",
  ];
}

export function getAvailableAgents() {
  return ["code-reviewer"];
}
