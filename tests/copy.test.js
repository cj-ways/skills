import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import fsExtra from "fs-extra";
import { copySkills, copyAgents, renameExistingSkill, mirrorSkills } from "../src/utils/copy.js";
import { getPackageSkillsDir, getPackageAgentsDir } from "../src/utils/paths.js";

const TMP = join(import.meta.dirname, ".tmp-test");

beforeEach(() => {
  fsExtra.ensureDirSync(TMP);
});

afterEach(() => {
  fsExtra.removeSync(TMP);
});

describe("copySkills", () => {
  it("installs a valid skill", () => {
    const target = join(TMP, "skills");
    const results = copySkills(["find-unused"], target);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ name: "find-unused", status: "installed" });
    expect(fsExtra.existsSync(join(target, "find-unused", "SKILL.md"))).toBe(true);
  });

  it("adds arcana marker to installed skill", () => {
    const target = join(TMP, "skills");
    copySkills(["find-unused"], target);

    const content = fsExtra.readFileSync(join(target, "find-unused", "SKILL.md"), "utf-8");
    expect(content).toContain("<!-- arcana-managed -->");
  });

  it("marker is placed after frontmatter, not inside it", () => {
    const target = join(TMP, "skills");
    copySkills(["find-unused"], target);

    const content = fsExtra.readFileSync(join(target, "find-unused", "SKILL.md"), "utf-8");
    const fmEnd = content.indexOf("---", content.indexOf("---") + 3);
    const markerPos = content.indexOf("<!-- arcana-managed -->");
    expect(markerPos).toBeGreaterThan(fmEnd);
  });

  it("returns not found for nonexistent skill", () => {
    const target = join(TMP, "skills");
    const results = copySkills(["nonexistent-skill"], target);

    expect(results).toEqual([{ name: "nonexistent-skill", status: "not found" }]);
  });

  it("detects conflict with non-arcana skill", () => {
    const target = join(TMP, "skills");
    const customDir = join(target, "find-unused");
    fsExtra.ensureDirSync(customDir);
    fsExtra.writeFileSync(join(customDir, "SKILL.md"), "---\nname: my-custom-skill\n---\n# Custom");

    const results = copySkills(["find-unused"], target);
    expect(results[0].status).toBe("conflict");
  });

  it("overwrites conflict when force is true", () => {
    const target = join(TMP, "skills");
    const customDir = join(target, "find-unused");
    fsExtra.ensureDirSync(customDir);
    fsExtra.writeFileSync(join(customDir, "SKILL.md"), "---\nname: my-custom-skill\n---\n# Custom");

    const results = copySkills(["find-unused"], target, { force: true });
    expect(results[0].status).toBe("installed");
  });

  it("overwrites arcana-managed skill without conflict", () => {
    const target = join(TMP, "skills");
    // First install
    copySkills(["find-unused"], target);
    // Second install should not conflict
    const results = copySkills(["find-unused"], target);
    expect(results[0].status).toBe("installed");
  });

  it("handles multiple skills at once", () => {
    const target = join(TMP, "skills");
    const results = copySkills(["find-unused", "create-pr", "nonexistent"], target);

    expect(results).toHaveLength(3);
    expect(results[0].status).toBe("installed");
    expect(results[1].status).toBe("installed");
    expect(results[2].status).toBe("not found");
  });
});

describe("copyAgents", () => {
  it("installs a valid agent", () => {
    const target = join(TMP, "agents");
    const results = copyAgents(["code-reviewer"], target);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ name: "code-reviewer", status: "installed" });
    expect(fsExtra.existsSync(join(target, "code-reviewer.md"))).toBe(true);
  });

  it("adds marker to installed agent", () => {
    const target = join(TMP, "agents");
    copyAgents(["code-reviewer"], target);

    const content = fsExtra.readFileSync(join(target, "code-reviewer.md"), "utf-8");
    expect(content).toContain("<!-- arcana-managed -->");
  });

  it("returns empty array when targetAgentsDir is null", () => {
    const results = copyAgents(["code-reviewer"], null);
    expect(results).toEqual([]);
  });

  it("returns not found for nonexistent agent", () => {
    const target = join(TMP, "agents");
    const results = copyAgents(["nonexistent-agent"], target);
    expect(results).toEqual([{ name: "nonexistent-agent", status: "not found" }]);
  });
});

describe("addMarker (via copySkills)", () => {
  it("does not duplicate marker on re-install", () => {
    const target = join(TMP, "skills");
    copySkills(["find-unused"], target);
    copySkills(["find-unused"], target);

    const content = fsExtra.readFileSync(join(target, "find-unused", "SKILL.md"), "utf-8");
    const markerCount = (content.match(/<!-- arcana-managed -->/g) || []).length;
    expect(markerCount).toBe(1);
  });

  it("preserves content with --- in code blocks", () => {
    const target = join(TMP, "skills");
    copySkills(["deploy-prep"], target);

    const content = fsExtra.readFileSync(join(target, "deploy-prep", "SKILL.md"), "utf-8");
    // Should have marker
    expect(content).toContain("<!-- arcana-managed -->");
    // Frontmatter should still be valid (name field present)
    expect(content).toMatch(/^---\nname: deploy-prep/);
  });
});

describe("renameExistingSkill", () => {
  it("renames skill directory and updates frontmatter", () => {
    const skillsDir = join(TMP, "skills");
    const skillDir = join(skillsDir, "old-skill");
    fsExtra.ensureDirSync(skillDir);
    fsExtra.writeFileSync(join(skillDir, "SKILL.md"), "---\nname: old-skill\ndescription: 'test'\n---\n# Old");

    const result = renameExistingSkill(skillsDir, "old-skill", "new-skill");
    expect(result).toBe(true);
    expect(fsExtra.existsSync(join(skillsDir, "new-skill", "SKILL.md"))).toBe(true);
    expect(fsExtra.existsSync(join(skillsDir, "old-skill"))).toBe(false);

    const content = fsExtra.readFileSync(join(skillsDir, "new-skill", "SKILL.md"), "utf-8");
    expect(content).toContain("name: new-skill");
    expect(content).not.toContain("name: old-skill");
  });

  it("returns false if source does not exist", () => {
    const result = renameExistingSkill(TMP, "nonexistent", "new-name");
    expect(result).toBe(false);
  });

  it("returns false if destination already exists", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "old-skill"));
    fsExtra.writeFileSync(join(skillsDir, "old-skill", "SKILL.md"), "---\nname: old-skill\n---\n");
    fsExtra.ensureDirSync(join(skillsDir, "new-skill"));

    const result = renameExistingSkill(skillsDir, "old-skill", "new-skill");
    expect(result).toBe(false);
  });
});

describe("mirrorSkills", () => {
  it("copies canonical to all mirror targets", () => {
    const canonical = join(TMP, "canonical");
    const mirror1 = join(TMP, "mirror1");
    const mirror2 = join(TMP, "mirror2");

    fsExtra.ensureDirSync(join(canonical, "test-skill"));
    fsExtra.writeFileSync(join(canonical, "test-skill", "SKILL.md"), "# test");

    const results = mirrorSkills(canonical, [mirror1, mirror2]);
    expect(results).toHaveLength(2);
    expect(fsExtra.existsSync(join(mirror1, "test-skill", "SKILL.md"))).toBe(true);
    expect(fsExtra.existsSync(join(mirror2, "test-skill", "SKILL.md"))).toBe(true);
  });
});
