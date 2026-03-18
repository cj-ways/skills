import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import fsExtra from "fs-extra";
const { copySync, ensureDirSync } = fsExtra;

export async function runSync() {
  const cwd = process.cwd();
  const canonical = join(cwd, ".agents", "skills");

  if (!existsSync(canonical)) {
    console.log(
      chalk.yellow(
        "No .agents/skills/ directory found. Run `arcana init` with multi-agent mode first."
      )
    );
    process.exit(1);
  }

  console.log(chalk.bold("\n✦ Arcana Sync\n"));

  const targets = [
    join(cwd, ".claude", "skills"),
    join(cwd, ".cursor", "skills"),
  ];

  for (const target of targets) {
    ensureDirSync(target);
    copySync(canonical, target, { overwrite: true });
    const rel = relative(cwd, target);
    console.log(chalk.green(`  ✓ ${rel} ← .agents/skills/`));
  }

  console.log(chalk.bold("\n✦ Sync complete.\n"));
}

export function appendAgentsMdBlock(cwd) {
  const agentsPath = join(cwd, "AGENTS.md");
  const skillsDir = join(cwd, ".agents", "skills");

  // Discover installed skill names
  let skillList = "";
  if (existsSync(skillsDir)) {
    const names = readdirSync(skillsDir).filter((name) => {
      return existsSync(join(skillsDir, name, "SKILL.md"));
    });
    skillList = names.map((name) => `- ${name}`).join("\n");
  }

  const block = `
## Agent Skills (Arcana)

Skills are located in \`.agents/skills/\`. Each skill folder contains a \`SKILL.md\` file.

**Skill discovery:** Enumerate all \`.agents/skills/*/SKILL.md\` files. Parse YAML front-matter to get name and description. Load full content only when the skill is invoked.

Available skills:
${skillList}
`;

  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf-8");
    if (content.includes("Agent Skills (Arcana)")) return; // already present
    appendFileSync(agentsPath, block);
  } else {
    writeFileSync(agentsPath, `# AGENTS.md\n${block}`);
  }
}
