import { readFileSync, existsSync } from "fs";
import { join, resolve, sep } from "path";
import { getPackageSkillsDir, getPackageAgentsDir, getAvailableSkills, getAvailableAgents } from "../utils/paths.js";

export async function runUse(skill) {
  const skillsDir = getPackageSkillsDir();
  const agentsDir = getPackageAgentsDir();

  // Try as skill first
  const skillPath = resolve(join(skillsDir, skill, "SKILL.md"));
  if (skillPath.startsWith(skillsDir + sep) && existsSync(skillPath)) {
    process.stdout.write(readFileSync(skillPath, "utf-8") + '\n');
    return;
  }

  // Try as agent
  const agentPath = resolve(join(agentsDir, `${skill}.md`));
  if (agentPath.startsWith(agentsDir + sep) && existsSync(agentPath)) {
    process.stdout.write(readFileSync(agentPath, "utf-8") + '\n');
    return;
  }

  const available = getAvailableSkills().concat(getAvailableAgents()).join(', ');
  console.error(`Unknown skill or agent: ${skill}`);
  console.error(`Available: ${available}`);
  process.exit(1);
}
