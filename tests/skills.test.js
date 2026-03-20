import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { getPackageSkillsDir, getAvailableSkills } from "../src/utils/paths.js";

const skillsDir = getPackageSkillsDir();
const skills = getAvailableSkills();

describe("skill frontmatter compliance", () => {
  for (const skill of skills) {
    describe(skill, () => {
      const content = readFileSync(join(skillsDir, skill, "SKILL.md"), "utf-8");
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = fmMatch ? fmMatch[1] : "";

      it("has valid frontmatter", () => {
        expect(fmMatch).not.toBeNull();
      });

      it("has name field matching directory", () => {
        const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
        expect(nameMatch).not.toBeNull();
        expect(nameMatch[1].trim()).toBe(skill);
      });

      it("has description under 1024 chars", () => {
        const descMatch = frontmatter.match(/^description:\s*['"]?([\s\S]*?)['"]?\s*$/m);
        expect(descMatch).not.toBeNull();
        expect(descMatch[1].length).toBeLessThan(1024);
      });

      it("has allowed-tools declared", () => {
        expect(frontmatter).toMatch(/^allowed-tools:/m);
      });

      it("uses comma-separated format for allowed-tools (not JSON array)", () => {
        const toolsMatch = frontmatter.match(/^allowed-tools:\s*(.+)$/m);
        if (toolsMatch) {
          expect(toolsMatch[1]).not.toMatch(/^\[/);
        }
      });

      it("is under 500 lines", () => {
        const lines = content.split("\n").length;
        expect(lines).toBeLessThan(500);
      });

      it("has name in lowercase-kebab-case", () => {
        expect(skill).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      });

      it("has name under 64 chars", () => {
        expect(skill.length).toBeLessThan(64);
      });
    });
  }
});
