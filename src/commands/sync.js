import chalk from "chalk";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import fsExtra from "fs-extra";
const { copySync, ensureDirSync, removeSync } = fsExtra;

export { appendAgentsMdBlock } from "../utils/agents-md.js";

export async function runSync(opts = {}) {
  const cwd = process.cwd();
  const canonical = join(cwd, ".agents", "skills");

  if (!existsSync(canonical)) {
    console.error(
      chalk.yellow(
        "No .agents/skills/ directory found. Run `arcana init` with multi-agent mode first."
      )
    );
    process.exit(1);
  }

  console.log(chalk.bold("\n✦ Arcana Sync\n"));

  // Smart mirror targets: only sync to directories whose parent exists
  const possibleTargets = [
    { dir: join(cwd, ".claude", "skills"), parent: join(cwd, ".claude") },
  ];
  let targets = possibleTargets
    .filter(t => existsSync(t.parent))
    .map(t => t.dir);

  // If no targets exist, always create .claude/skills/ as minimum default
  if (targets.length === 0) {
    targets = [join(cwd, ".claude", "skills")];
  }

  for (const target of targets) {
    ensureDirSync(target);
    copySync(canonical, target, { overwrite: true });
    const rel = relative(cwd, target);
    console.log(chalk.green(`  ✓ ${rel} ← .agents/skills/`));
  }

  // --clean: remove stale Arcana-managed skills from mirrors that don't exist in canonical
  if (opts.clean) {
    console.log(chalk.dim("\n  Cleaning stale skills...\n"));
    const canonicalSkills = readdirSync(canonical).filter(name =>
      existsSync(join(canonical, name, "SKILL.md"))
    );
    let cleaned = 0;

    for (const target of targets) {
      if (!existsSync(target)) continue;
      const mirrorEntries = readdirSync(target);
      for (const entry of mirrorEntries) {
        if (!canonicalSkills.includes(entry)) {
          const stale = join(target, entry);
          // Only remove Arcana-managed skill entries — preserve everything else
          const skillMd = join(stale, "SKILL.md");
          if (!existsSync(skillMd)) continue; // not a skill dir — preserve
          const content = readFileSync(skillMd, "utf-8");
          if (!content.includes("<!-- arcana-managed -->")) continue;
          removeSync(stale);
          const rel = relative(cwd, stale);
          console.log(chalk.yellow(`  ✗ Removed stale: ${rel}`));
          cleaned++;
        }
      }
    }

    if (cleaned === 0) {
      console.log(chalk.dim("  No stale skills found."));
    } else {
      console.log(chalk.dim(`\n  Cleaned ${cleaned} stale skill(s).`));
    }
  }

  console.log(chalk.bold("\n✦ Sync complete.\n"));
}

