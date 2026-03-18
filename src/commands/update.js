import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import {
  getAvailableSkills,
  getAvailableAgents,
  getPackageSkillsDir,
  getPackageAgentsDir,
} from "../utils/paths.js";
import { copySkills, copyAgents } from "../utils/copy.js";

export async function runUpdate() {
  const cwd = process.cwd();
  const home = homedir();

  const locations = [
    { label: "project (.claude)", skills: join(cwd, ".claude", "skills"), agents: join(cwd, ".claude", "agents") },
    { label: "project (.agents)", skills: join(cwd, ".agents", "skills"), agents: null },
    { label: "user", skills: join(home, ".claude", "skills"), agents: join(home, ".claude", "agents") },
  ];

  const allSkills = getAvailableSkills();
  const allAgents = getAvailableAgents();
  let updated = 0;

  console.log(chalk.bold("\n✦ Arcana Update\n"));

  for (const loc of locations) {
    if (!existsSync(loc.skills)) continue;

    // Find which arcana skills are installed here
    const installed = allSkills.filter((s) =>
      existsSync(join(loc.skills, s, "SKILL.md"))
    );

    if (installed.length === 0) continue;

    console.log(chalk.dim(`  ${loc.label}:`));
    const results = copySkills(installed, loc.skills);
    for (const r of results) {
      console.log(chalk.green(`    ✓ ${r.name} updated`));
      updated++;
    }

    // Update agents
    if (loc.agents && existsSync(loc.agents)) {
      const installedAgents = allAgents.filter((a) =>
        existsSync(join(loc.agents, `${a}.md`))
      );
      if (installedAgents.length > 0) {
        const agentResults = copyAgents(installedAgents, loc.agents);
        for (const r of agentResults) {
          console.log(chalk.green(`    ✓ ${r.name} (agent) updated`));
          updated++;
        }
      }
    }
  }

  if (updated === 0) {
    console.log(chalk.yellow("  No installed arcana skills found to update."));
  } else {
    console.log(chalk.bold(`\n✦ ${updated} items updated.\n`));
  }
}
