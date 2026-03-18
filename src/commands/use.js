import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getPackageSkillsDir, getPackageAgentsDir } from "../utils/paths.js";

export async function runUse(skill) {
  // Try as skill first
  const skillPath = join(getPackageSkillsDir(), skill, "SKILL.md");
  if (existsSync(skillPath)) {
    process.stdout.write(readFileSync(skillPath, "utf-8"));
    return;
  }

  // Try as agent
  const agentPath = join(getPackageAgentsDir(), `${skill}.md`);
  if (existsSync(agentPath)) {
    process.stdout.write(readFileSync(agentPath, "utf-8"));
    return;
  }

  console.error(`Unknown skill or agent: ${skill}`);
  console.error("Available: agent-audit, feature-audit, new-project-idea, find-unused, persist-knowledge, create-pr, deploy-prep, code-reviewer");
  process.exit(1);
}
