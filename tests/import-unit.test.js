import { describe, it, expect } from "vitest";
import { resolveSource, validateFrontmatter } from "../src/commands/import.js";

describe("resolveSource", () => {
  it("resolves local path starting with ./", () => {
    const result = resolveSource("./my-skill", null);
    expect(result).toEqual({ type: "local", path: "./my-skill" });
  });

  it("resolves local path starting with /", () => {
    const result = resolveSource("/absolute/path", null);
    expect(result).toEqual({ type: "local", path: "/absolute/path" });
  });

  it("resolves local path starting with ../", () => {
    const result = resolveSource("../parent/skill", null);
    expect(result).toEqual({ type: "local", path: "../parent/skill" });
  });

  it("resolves raw HTTPS .md URL", () => {
    const result = resolveSource("https://example.com/SKILL.md", null);
    expect(result).toEqual({ type: "url", url: "https://example.com/SKILL.md" });
  });

  it("rejects HTTP .md URL (not HTTPS)", () => {
    const result = resolveSource("http://example.com/SKILL.md", null);
    expect(result).toBeNull();
  });

  it("resolves GitHub tree URL", () => {
    const result = resolveSource("https://github.com/owner/repo/tree/main/skills/my-skill", null);
    expect(result).not.toBeNull();
    expect(result.type).toBe("github-skill");
    expect(result.owner).toBe("owner");
    expect(result.repo).toBe("repo");
    expect(result.branch).toBe("main");
    expect(result.name).toBe("my-skill");
  });

  it("strips query strings from GitHub tree URL", () => {
    const result = resolveSource("https://github.com/owner/repo/tree/main/skills/name?tab=readme", null);
    expect(result).not.toBeNull();
    expect(result.type).toBe("github-skill");
    expect(result.name).toBe("name");
  });

  it("strips fragment from GitHub tree URL", () => {
    const result = resolveSource("https://github.com/owner/repo/tree/main/skills/name#section", null);
    expect(result).not.toBeNull();
    expect(result.name).toBe("name");
  });

  it("rejects GitHub tree URL with .. in path", () => {
    const result = resolveSource("https://github.com/owner/repo/tree/main/../../secret", null);
    expect(result).toBeNull();
  });

  it("rejects invalid GitHub owner slug", () => {
    const result = resolveSource("https://github.com/owner?inject/repo/tree/main/skills/s", null);
    expect(result).toBeNull();
  });

  it("resolves GitHub repo URL", () => {
    const result = resolveSource("https://github.com/owner/repo", "skill-name");
    expect(result).not.toBeNull();
    expect(result.type).toBe("github-repo");
    expect(result.owner).toBe("owner");
    expect(result.repo).toBe("repo");
    expect(result.skillName).toBe("skill-name");
  });

  it("resolves GitHub repo URL with trailing slash", () => {
    const result = resolveSource("https://github.com/owner/repo/", null);
    expect(result).not.toBeNull();
    expect(result.type).toBe("github-repo");
  });

  it("strips .git suffix from repo URL", () => {
    const result = resolveSource("https://github.com/owner/repo.git", null);
    expect(result).not.toBeNull();
    expect(result.repo).toBe("repo");
  });

  it("resolves owner/repo short form", () => {
    const result = resolveSource("anthropics/skills", "claude-api");
    expect(result).not.toBeNull();
    expect(result.type).toBe("github-repo");
    expect(result.owner).toBe("anthropics");
    expect(result.repo).toBe("skills");
    expect(result.skillName).toBe("claude-api");
  });

  it("rejects invalid owner in short form", () => {
    const result = resolveSource("owner?bad/repo", null);
    expect(result).toBeNull();
  });

  it("returns null for unrecognized input", () => {
    expect(resolveSource("just-a-word", null)).toBeNull();
    expect(resolveSource("", null)).toBeNull();
  });
});

describe("validateFrontmatter", () => {
  it("returns no issues for valid frontmatter", () => {
    const issues = validateFrontmatter({ name: "my-skill", description: "Does things" });
    expect(issues).toEqual([]);
  });

  it("reports missing name", () => {
    const issues = validateFrontmatter({ description: "ok" });
    expect(issues).toContain("Missing 'name' field");
  });

  it("reports missing description", () => {
    const issues = validateFrontmatter({ name: "my-skill" });
    expect(issues).toContain("Missing 'description' field");
  });

  it("reports non-kebab-case name", () => {
    const issues = validateFrontmatter({ name: "MySkill", description: "ok" });
    expect(issues.some((i) => i.includes("not lowercase-kebab-case"))).toBe(true);
  });

  it("reports name exceeding 64 chars", () => {
    const issues = validateFrontmatter({ name: "a".repeat(65), description: "ok" });
    expect(issues.some((i) => i.includes("exceeds 64 characters"))).toBe(true);
  });

  it("reports description exceeding 1024 chars", () => {
    const issues = validateFrontmatter({ name: "my-skill", description: "x".repeat(1025) });
    expect(issues.some((i) => i.includes("exceeds 1024 characters"))).toBe(true);
  });

  it("accepts single-segment kebab name", () => {
    const issues = validateFrontmatter({ name: "skill", description: "ok" });
    expect(issues).toEqual([]);
  });

  it("rejects name with underscores", () => {
    const issues = validateFrontmatter({ name: "my_skill", description: "ok" });
    expect(issues.some((i) => i.includes("not lowercase-kebab-case"))).toBe(true);
  });
});
