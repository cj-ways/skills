import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import fsExtra from "fs-extra";
import { appendAgentsMdBlock } from "../src/utils/agents-md.js";

const TMP = join(import.meta.dirname, ".tmp-test-agents-md");

beforeEach(() => {
  fsExtra.ensureDirSync(TMP);
});

afterEach(() => {
  fsExtra.removeSync(TMP);
});

describe("appendAgentsMdBlock", () => {
  it("creates AGENTS.md when it does not exist", () => {
    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    expect(content).toContain("# AGENTS.md");
    expect(content).toContain("Agent Skills (Arcana)");
  });

  it("appends block to existing AGENTS.md", () => {
    fsExtra.writeFileSync(join(TMP, "AGENTS.md"), "# My Agents\n\nSome content.\n");
    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    expect(content).toContain("# My Agents");
    expect(content).toContain("Agent Skills (Arcana)");
  });

  it("is idempotent — does not duplicate block", () => {
    appendAgentsMdBlock(TMP);
    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    const count = (content.match(/Agent Skills \(Arcana\)/g) || []).length;
    expect(count).toBe(1);
  });

  it("lists skills from .agents/skills/ directory", () => {
    const skillsDir = join(TMP, ".agents", "skills");
    fsExtra.ensureDirSync(join(skillsDir, "my-skill"));
    fsExtra.writeFileSync(join(skillsDir, "my-skill", "SKILL.md"), "---\nname: my-skill\n---\n");
    fsExtra.ensureDirSync(join(skillsDir, "other-skill"));
    fsExtra.writeFileSync(join(skillsDir, "other-skill", "SKILL.md"), "---\nname: other-skill\n---\n");

    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    expect(content).toContain("- my-skill");
    expect(content).toContain("- other-skill");
  });

  it("handles empty .agents/skills/ directory", () => {
    fsExtra.ensureDirSync(join(TMP, ".agents", "skills"));
    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    expect(content).toContain("Agent Skills (Arcana)");
    expect(content).toContain("Available skills:");
  });

  it("handles missing .agents/skills/ directory", () => {
    appendAgentsMdBlock(TMP);
    const content = fsExtra.readFileSync(join(TMP, "AGENTS.md"), "utf-8");
    expect(content).toContain("Agent Skills (Arcana)");
  });
});
