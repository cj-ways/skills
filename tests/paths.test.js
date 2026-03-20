import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import {
  getPackageSkillsDir,
  getPackageAgentsDir,
  getPackageRulesDir,
  getTargetDirs,
  getAvailableSkills,
  getAvailableAgents,
} from "../src/utils/paths.js";

describe("getPackageSkillsDir", () => {
  it("returns a directory that exists", () => {
    expect(existsSync(getPackageSkillsDir())).toBe(true);
  });
});

describe("getPackageAgentsDir", () => {
  it("returns a directory that exists", () => {
    expect(existsSync(getPackageAgentsDir())).toBe(true);
  });
});

describe("getPackageRulesDir", () => {
  it("returns a directory that exists", () => {
    expect(existsSync(getPackageRulesDir())).toBe(true);
  });
});

describe("getTargetDirs", () => {
  it("returns correct paths for claude agent", () => {
    const dirs = getTargetDirs("claude", "project");
    expect(dirs.skills).toContain(".claude/skills");
    expect(dirs.agents).toContain(".claude/agents");
    expect(dirs.mirrors).toBeUndefined();
  });

  it("returns correct paths for codex agent", () => {
    const dirs = getTargetDirs("codex", "project");
    expect(dirs.skills).toContain(".agents/skills");
    expect(dirs.agents).toBeNull();
  });

  it("returns correct paths for multi agent", () => {
    const dirs = getTargetDirs("multi", "project");
    expect(dirs.skills).toContain(".agents/skills");
    expect(dirs.agents).toContain(".claude/agents");
    expect(dirs.mirrors).toBeDefined();
    expect(dirs.mirrors).toHaveLength(1);
    expect(dirs.mirrors[0]).toContain(".claude/skills");
  });

  it("does not include cursor or gemini in multi mirrors", () => {
    const dirs = getTargetDirs("multi", "project");
    for (const mirror of dirs.mirrors) {
      expect(mirror).not.toContain(".cursor");
      expect(mirror).not.toContain(".gemini");
    }
  });

  it("throws for unknown agent", () => {
    expect(() => getTargetDirs("unknown", "project")).toThrow("Unknown agent");
  });

  it("throws for gemini (removed)", () => {
    expect(() => getTargetDirs("gemini", "project")).toThrow("Unknown agent");
  });
});

describe("getAvailableSkills", () => {
  it("returns 13 skills", () => {
    const skills = getAvailableSkills();
    expect(skills).toHaveLength(13);
  });

  it("includes idea-audit (renamed from new-project-idea)", () => {
    const skills = getAvailableSkills();
    expect(skills).toContain("idea-audit");
    expect(skills).not.toContain("new-project-idea");
  });

  it("includes all expected skills", () => {
    const skills = getAvailableSkills();
    const expected = [
      "agent-audit", "create-pr", "deep-review", "deploy-prep",
      "feature-audit", "find-unused", "generate-tests", "idea-audit",
      "import-skill", "persist-knowledge", "quick-review", "security-check",
      "v0-design",
    ];
    for (const s of expected) {
      expect(skills).toContain(s);
    }
  });
});

describe("getAvailableAgents", () => {
  it("returns 2 agents", () => {
    const agents = getAvailableAgents();
    expect(agents).toHaveLength(2);
  });

  it("includes code-reviewer and review-team", () => {
    const agents = getAvailableAgents();
    expect(agents).toContain("code-reviewer");
    expect(agents).toContain("review-team");
  });
});
