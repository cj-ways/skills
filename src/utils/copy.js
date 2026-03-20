import fsExtra from "fs-extra";
const { copySync, ensureDirSync, existsSync, readFileSync } = fsExtra;
import { join } from "path";
import { getPackageSkillsDir, getPackageAgentsDir } from "./paths.js";

const ARCANA_MARKER = "<!-- arcana-managed -->";

/**
 * Check if a file was installed by Arcana (has the marker comment)
 * or is a user-created file.
 */
function isArcanaManaged(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.includes(ARCANA_MARKER);
  } catch {
    return false;
  }
}

/**
 * Add Arcana marker to a SKILL.md file content if not already present.
 */
function addMarker(content) {
  if (content.includes(ARCANA_MARKER)) return content;
  // Insert marker after the closing --- of frontmatter
  const parts = content.split("---");
  if (parts.length >= 3) {
    // frontmatter is between first and second ---
    return parts[0] + "---" + parts[1] + "---\n" + ARCANA_MARKER + "\n" + parts.slice(2).join("---");
  }
  return ARCANA_MARKER + "\n" + content;
}

export function copySkills(skillNames, targetSkillsDir) {
  const sourceDir = getPackageSkillsDir();
  const results = [];

  for (const name of skillNames) {
    const src = join(sourceDir, name);
    const dest = join(targetSkillsDir, name);
    const destSkillMd = join(dest, "SKILL.md");

    if (!existsSync(src)) {
      results.push({ name, status: "not found" });
      continue;
    }

    // Check for conflict: destination exists and is NOT managed by Arcana
    if (existsSync(destSkillMd) && !isArcanaManaged(destSkillMd)) {
      results.push({ name, status: "conflict" });
      continue;
    }

    ensureDirSync(dest);
    copySync(src, dest, { overwrite: true });

    // Add marker to installed SKILL.md
    const installedPath = join(dest, "SKILL.md");
    if (existsSync(installedPath)) {
      const content = readFileSync(installedPath, "utf-8");
      const marked = addMarker(content);
      fsExtra.writeFileSync(installedPath, marked);
    }

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

    // Check for conflict
    if (existsSync(dest) && !isArcanaManaged(dest)) {
      results.push({ name, status: "conflict" });
      continue;
    }

    ensureDirSync(targetAgentsDir);
    copySync(src, dest, { overwrite: true });

    // Add marker
    const content = readFileSync(dest, "utf-8");
    if (!content.includes(ARCANA_MARKER)) {
      fsExtra.writeFileSync(dest, ARCANA_MARKER + "\n" + content);
    }

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
