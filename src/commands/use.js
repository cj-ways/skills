import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getPackageSkillsDir, getPackageAgentsDir, getAvailableSkills, getAvailableAgents } from "../utils/paths.js";

export async function runUse(skill) {
  // Try as skill first
  const skillPath = join(getPackageSkillsDir(), skill, "SKILL.md");
  if (existsSync(skillPath)) {
    process.stdout.write(readFileSync(skillPath, "utf-8") + '\n');
    return;
  }

  // Try as agent
  const agentPath = join(getPackageAgentsDir(), `${skill}.md`);
  if (existsSync(agentPath)) {
    process.stdout.write(readFileSync(agentPath, "utf-8") + '\n');
    return;
  }

  const available = getAvailableSkills().concat(getAvailableAgents()).join(', ');
  console.error(`Unknown skill or agent: ${skill}`);
  console.error(`Available: ${available}`);
  process.exit(1);
}
