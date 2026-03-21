import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from "fs";
import { join } from "path";

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
