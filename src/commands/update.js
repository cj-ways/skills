import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import fsExtra from "fs-extra";
const { removeSync } = fsExtra;
import {
  getAvailableSkills,
  getAvailableAgents,
  getPackageSkillsDir,
  getPackageAgentsDir,
} from "../utils/paths.js";
import { copySkills, copyAgents } from "../utils/copy.js";
import { runSync } from "./sync.js";

function loadMigrations() {
  const migrationsPath = join(getPackageSkillsDir(), "..", "migrations.json");
  try {
    if (!existsSync(migrationsPath)) return [];
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));
    return data.migrations || [];
  } catch {
    return [];
  }
}

function applyMigrations(locations, migrations) {
  let applied = 0;

  for (const migration of migrations) {
    if (migration.type === "rename") {
      for (const loc of locations) {
        if (!existsSync(loc.skills)) continue;
        const oldDir = join(loc.skills, migration.from);
        const newDir = join(loc.skills, migration.to);

        if (existsSync(join(oldDir, "SKILL.md")) && !existsSync(newDir)) {
          removeSync(oldDir);
          console.log(chalk.dim(`    ↳ ${migration.from} → ${migration.to} (renamed)`));
          applied++;
        }
      }
    } else if (migration.type === "remove") {
      for (const loc of locations) {
        if (!existsSync(loc.skills)) continue;
        const oldDir = join(loc.skills, migration.from);

        if (existsSync(oldDir)) {
          removeSync(oldDir);
          console.log(chalk.dim(`    ↳ ${migration.from} removed (${migration.reason || "deprecated"})`));
          applied++;
        }
      }
    }
  }

  return applied;
}

export async function runUpdate() {
  const cwd = process.cwd();
  const home = homedir();

  const locations = [
    { label: "project (.claude)", skills: join(cwd, ".claude", "skills"), agents: join(cwd, ".claude", "agents") },
    { label: "project (.agents)", skills: join(cwd, ".agents", "skills"), agents: null },
    { label: "user", skills: join(home, ".claude", "skills"), agents: join(home, ".claude", "agents") },
    { label: "user (.agents)", skills: join(home, ".agents", "skills"), agents: null },
  ];

  const allSkills = getAvailableSkills();
  const allAgents = getAvailableAgents();
  let updated = 0;

  console.log(chalk.bold("\n✦ Arcana Update\n"));

  // Apply migrations before updating
  const migrations = loadMigrations();
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
    await runSync();
  }
}
