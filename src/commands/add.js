import chalk from "chalk";
import { getTargetDirs, getAvailableSkills, getAvailableAgents } from "../utils/paths.js";
import { copySkills, copyAgents, mirrorSkills } from "../utils/copy.js";
import { detectExistingAgents, isInsideProject } from "../utils/detect.js";
import { existsSync } from "fs";
import { join } from "path";

function detectAgent() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, ".agents", "skills"))) return "multi";
  if (existsSync(join(cwd, "AGENTS.md")) && !existsSync(join(cwd, "CLAUDE.md"))) return "codex";
  return "claude";
}

function detectScope() {
  return isInsideProject() ? "project" : "user";
}

export async function runAdd(skills, opts) {
  const agent = opts.agent || detectAgent();
  const scope = opts.scope || detectScope();
  const dirs = getTargetDirs(agent, scope);

  const allSkills = getAvailableSkills();
  const allAgents = getAvailableAgents();

  let toInstall = skills || [];

  if (opts.all || toInstall.length === 0) {
    toInstall = allSkills;
  }

  // Separate skills from agents
  const skillNames = toInstall.filter((s) => allSkills.includes(s));
  const agentNames = toInstall.filter((s) => allAgents.includes(s));

  // If user passed names that are neither skill nor agent, warn
  const unknown = toInstall.filter(
    (s) => !allSkills.includes(s) && !allAgents.includes(s)
  );
  for (const u of unknown) {
    console.log(chalk.yellow(`  ? Unknown skill: ${u}`));
  }

  // Install skills
  if (skillNames.length > 0) {
    const results = copySkills(skillNames, dirs.skills);
    for (const r of results) {
      if (r.status === "installed") {
        console.log(chalk.green(`  ✓ ${r.name}`));
      } else {
        console.log(chalk.red(`  ✗ ${r.name} — ${r.status}`));
      }
    }

    // Multi-agent: also mirror
    if (agent === "multi" && dirs.mirrors) {
      mirrorSkills(dirs.skills, dirs.mirrors);
      console.log(chalk.dim("  ↳ Mirrored to agent-specific directories"));
    }
  }

  // Install agents
  if (agentNames.length > 0 && dirs.agents) {
    const results = copyAgents(agentNames, dirs.agents);
    for (const r of results) {
      if (r.status === "installed") {
        console.log(chalk.green(`  ✓ ${r.name} (agent)`));
      } else {
        console.log(chalk.red(`  ✗ ${r.name} — ${r.status}`));
      }
    }
  }

  // Install all agents too when --all
  if (opts.all && dirs.agents) {
    const results = copyAgents(allAgents, dirs.agents);
    for (const r of results) {
      if (r.status === "installed") {
        console.log(chalk.green(`  ✓ ${r.name} (agent)`));
      }
    }
  }
}
