import chalk from "chalk";
import { existsSync } from "fs";
import { join } from "path";
import {
  getAvailableSkills,
  getAvailableAgents,
  getPackageSkillsDir,
  getAllInstallLocations,
} from "../utils/paths.js";
import { copySkills, copyAgents } from "../utils/copy.js";
import { loadMigrations, applyMigrations } from "../utils/migrations.js";
import { runSync } from "./sync.js";

export async function runUpdate() {
  const cwd = process.cwd();
  const { skills: skillLocs, agents: agentLocs } = getAllInstallLocations();

  // Build locations with paired skills + agents dirs
  const locations = skillLocs.map((sl) => {
    const matchingAgent = agentLocs.find((al) => al.level === sl.level);
    return { label: sl.label, skills: sl.dir, agents: matchingAgent ? matchingAgent.dir : null };
  });

  const allSkills = getAvailableSkills();
  const allAgents = getAvailableAgents();
  let updated = 0;

  console.log(chalk.bold("\n✦ Arcana Update\n"));

  // Apply migrations before updating
  const migrationsPath = join(getPackageSkillsDir(), "..", "migrations.json");
  const migrations = loadMigrations(migrationsPath);
  if (migrations.length > 0) {
    const migrated = applyMigrations(locations, migrations);
    if (migrated > 0) {
      console.log(chalk.dim(`  ${migrated} migration(s) applied.\n`));
    }
  }

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
      if (r.status === "installed") {
        console.log(chalk.green(`    ✓ ${r.name} updated`));
        updated++;
      } else if (r.status === "conflict") {
        console.log(chalk.yellow(`    ⚠ ${r.name} skipped — custom skill detected (not Arcana-managed)`));
      }
    }

    // Update agents
    if (loc.agents && existsSync(loc.agents)) {
      const installedAgents = allAgents.filter((a) =>
        existsSync(join(loc.agents, `${a}.md`))
      );
      if (installedAgents.length > 0) {
        const agentResults = copyAgents(installedAgents, loc.agents);
        for (const r of agentResults) {
          if (r.status === "installed") {
            console.log(chalk.green(`    ✓ ${r.name} (agent) updated`));
            updated++;
          } else if (r.status === "conflict") {
            console.log(chalk.yellow(`    ⚠ ${r.name} (agent) skipped — custom agent detected`));
          }
        }
      }
    }
  }

  if (updated === 0) {
    console.log(chalk.yellow("  No installed arcana skills found to update."));
  } else {
    console.log(chalk.bold(`\n✦ ${updated} items updated.\n`));
  }

  // Trigger sync if multi-agent mode is active
  const canonical = join(cwd, ".agents", "skills");
  if (existsSync(canonical) && updated > 0) {
    console.log(chalk.dim("  Syncing multi-agent mirrors...\n"));
    await runSync({ clean: true });
  }
}
