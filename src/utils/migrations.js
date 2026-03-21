import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import fsExtra from "fs-extra";
const { removeSync, moveSync } = fsExtra;

const MIGRATION_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function loadMigrations(migrationsPath) {
  try {
    if (!existsSync(migrationsPath)) return [];
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));
    return data.migrations || [];
  } catch {
    return [];
  }
}

export function applyMigrations(locations, migrations) {
  let applied = 0;

  for (const migration of migrations) {
    // Validate migration slugs to prevent path traversal
    if (!MIGRATION_SLUG.test(migration.from) || (migration.to && !MIGRATION_SLUG.test(migration.to))) {
      console.log(chalk.yellow(`    ⚠ Skipping invalid migration: ${JSON.stringify(migration)}`));
      continue;
    }

    if (migration.type === "rename") {
      for (const loc of locations) {
        if (!existsSync(loc.skills)) continue;
        const oldDir = join(loc.skills, migration.from);
        const newDir = join(loc.skills, migration.to);

        if (existsSync(join(oldDir, "SKILL.md")) && !existsSync(newDir)) {
          moveSync(oldDir, newDir);
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
