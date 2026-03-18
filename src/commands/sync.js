import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
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
    return;
  }

  console.log(chalk.bold("\n✦ Arcana Sync\n"));

  const targets = [
    join(cwd, ".claude", "skills"),
    join(cwd, ".cursor", "skills"),
  ];

  for (const target of targets) {
    ensureDirSync(target);
    copySync(canonical, target, { overwrite: true });
    const relative = target.replace(cwd + "/", "");
    console.log(chalk.green(`  ✓ ${relative} ← .agents/skills/`));
  }

  console.log(chalk.bold("\n✦ Sync complete.\n"));
}

export function appendAgentsMdBlock(cwd) {
  const agentsPath = join(cwd, "AGENTS.md");
  const block = `
## Agent Skills (Arcana)

Skills are located in \`.agents/skills/\`. Each skill folder contains a \`SKILL.md\` file.

**Skill discovery:** Enumerate all \`.agents/skills/*/SKILL.md\` files. Parse YAML front-matter to get name and description. Load full content only when the skill is invoked.

Available skills:
`;

  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf-8");
    if (content.includes("Agent Skills (Arcana)")) return; // already present
    appendFileSync(agentsPath, block);
  } else {
    writeFileSync(agentsPath, `# AGENTS.md\n${block}`);
  }
}
