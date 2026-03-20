import fsExtra from "fs-extra";
const { copySync, ensureDirSync, existsSync, readFileSync, moveSync } = fsExtra;
import { join } from "path";
import { getPackageSkillsDir, getPackageAgentsDir, getAvailableSkills, getAvailableAgents } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

const ARCANA_MARKER = "<!-- arcana-managed -->";

/**
 * Check if a file was installed by Arcana (has the marker comment)
 * or is a legacy Arcana install (pre-1.4.0, no marker but frontmatter name matches).
 */
function isArcanaManaged(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");

    // Definitive: v1.4.0+ marker
    if (content.includes(ARCANA_MARKER)) return true;

    // Legacy detection: pre-1.4.0 Arcana installs have no marker.
    // Check if the frontmatter `name:` matches a known Arcana skill/agent.
    const fm = parseFrontmatter(content);
    if (fm.name) {
      const allSkills = getAvailableSkills();
      const allAgents = getAvailableAgents();
      if (allSkills.includes(fm.name) || allAgents.includes(fm.name)) return true;
    }

    return false;
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
  // Use regex to match only the frontmatter block (first two --- delimiters)
  const fmMatch = content.match(/^(---\n[\s\S]*?\n---)\n?/);
  if (fmMatch) {
    const afterFm = content.slice(fmMatch[0].length);
    return fmMatch[1] + "\n" + ARCANA_MARKER + "\n" + afterFm;
  }
  return ARCANA_MARKER + "\n" + content;
}

export function copySkills(skillNames, targetSkillsDir, { force = false } = {}) {
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
    if (!force && existsSync(destSkillMd) && !isArcanaManaged(destSkillMd)) {
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

export function copyAgents(agentNames, targetAgentsDir, { force = false } = {}) {
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
    if (!force && existsSync(dest) && !isArcanaManaged(dest)) {
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

export function renameExistingSkill(skillsDir, oldName, newName) {
  const oldPath = join(skillsDir, oldName);
  const newPath = join(skillsDir, newName);

  if (!existsSync(oldPath)) return false;
  if (existsSync(newPath)) return false;

  moveSync(oldPath, newPath);

  // Update name in SKILL.md frontmatter
  const skillMd = join(newPath, "SKILL.md");
  if (existsSync(skillMd)) {
    let content = readFileSync(skillMd, "utf-8");
    content = content.replace(
      /^(---\n[\s\S]*?name:\s*)['"]?[^'"\n]+/m,
      `$1${newName}`
    );
    fsExtra.writeFileSync(skillMd, content);
  }

  return true;
}

export function renameExistingAgent(agentsDir, oldName, newName) {
  const oldPath = join(agentsDir, `${oldName}.md`);
  const newPath = join(agentsDir, `${newName}.md`);

  if (!existsSync(oldPath)) return false;
  if (existsSync(newPath)) return false;

  moveSync(oldPath, newPath);

  // Update name in frontmatter
  if (!existsSync(newPath)) return true;
  let content = readFileSync(newPath, "utf-8");
  const fmMatch = content.match(/^(---\n[\s\S]*?name:\s*)['"]?[^'"\n]+/m);
  if (fmMatch) {
    content = content.replace(
      /^(---\n[\s\S]*?name:\s*)['"]?[^'"\n]+/m,
      `$1${newName}`
    );
    fsExtra.writeFileSync(newPath, content);
  }

  return true;
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
