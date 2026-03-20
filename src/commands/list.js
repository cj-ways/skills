import chalk from "chalk";
import { existsSync } from "fs";
import { join } from "path";
import { getAvailableSkills, getAvailableAgents, getAllInstallLocations } from "../utils/paths.js";

export async function runList() {
  const allSkills = getAvailableSkills();
  const allAgents = getAvailableAgents();
  const { skills: locations, agents: agentLocations } = getAllInstallLocations();

  console.log(chalk.bold("\n✦ Arcana Skills\n"));

  console.log(chalk.dim("  Skills:"));
  for (const name of allSkills) {
    const installed = [];
    for (const loc of locations) {
      if (existsSync(join(loc.dir, name, "SKILL.md"))) {
        installed.push(loc.label);
      }
    }

    if (installed.length > 0) {
      console.log(
        chalk.green(`  ✓ ${name.padEnd(22)} `) +
          chalk.dim(installed.join(", "))
      );
    } else {
      console.log(chalk.gray(`  · ${name.padEnd(22)} not installed`));
    }
  }

  console.log(chalk.dim("\n  Agents:"));
  for (const name of allAgents) {
    const installed = [];
    for (const loc of agentLocations) {
      if (existsSync(join(loc.dir, `${name}.md`))) {
        installed.push(loc.label);
      }
    }

    if (installed.length > 0) {
      console.log(
        chalk.green(`  ✓ ${name.padEnd(22)} `) +
          chalk.dim(installed.join(", "))
      );
    } else {
      console.log(chalk.gray(`  · ${name.padEnd(22)} not installed`));
    }
  }

  console.log();
}
