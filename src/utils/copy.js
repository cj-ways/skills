import fsExtra from "fs-extra";
const { copySync, ensureDirSync, existsSync } = fsExtra;
import { join } from "path";
import { getPackageSkillsDir, getPackageAgentsDir } from "./paths.js";

export function copySkills(skillNames, targetSkillsDir) {
  const sourceDir = getPackageSkillsDir();
  const results = [];

  for (const name of skillNames) {
    const src = join(sourceDir, name);
    const dest = join(targetSkillsDir, name);

    if (!existsSync(src)) {
      results.push({ name, status: "not found" });
      continue;
    }

    ensureDirSync(dest);
    copySync(src, dest, { overwrite: true });
    results.push({ name, status: "installed" });
  }

  return results;
}

export function copyAgents(agentNames, targetAgentsDir) {
  if (!targetAgentsDir) return [];

  const sourceDir = getPackageAgentsDir();
  const results = [];

  for (const name of agentNames) {
    const src = join(sourceDir, `${name}.md`);
    const dest = join(targetAgentsDir, `${name}.md`);

    if (!existsSync(src)) {
      results.push({ name, status: "not found" });
      continue;
    }

    ensureDirSync(targetAgentsDir);
    copySync(src, dest, { overwrite: true });
    results.push({ name, status: "installed" });
  }

  return results;
}

export function mirrorSkills(canonicalDir, mirrorDirs) {
  const results = [];

  for (const mirrorDir of mirrorDirs) {
    ensureDirSync(mirrorDir);
    copySync(canonicalDir, mirrorDir, { overwrite: true });
    results.push({ dir: mirrorDir, status: "synced" });
  }

  return results;
}
