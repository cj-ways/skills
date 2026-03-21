import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import fsExtra from "fs-extra";
import { readFileSync } from "fs";
import { loadMigrations, applyMigrations } from "../src/utils/migrations.js";

const TMP = join(import.meta.dirname, ".tmp-test-migrations");

beforeEach(() => {
  fsExtra.ensureDirSync(TMP);
});

afterEach(() => {
  fsExtra.removeSync(TMP);
});

describe("migrations.json", () => {
  it("exists and is valid JSON", () => {
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const content = readFileSync(migrationsPath, "utf-8");
    const data = JSON.parse(content);

    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("migrations");
    expect(Array.isArray(data.migrations)).toBe(true);
  });

  it("has version 1", () => {
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));
    expect(data.version).toBe(1);
  });

  it("each migration has required fields", () => {
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));

    for (const m of data.migrations) {
      expect(m).toHaveProperty("type");
      expect(["rename", "remove"]).toContain(m.type);
      expect(m).toHaveProperty("since");
      expect(m.since).toMatch(/^\d+\.\d+\.\d+$/);

      if (m.type === "rename") {
        expect(m).toHaveProperty("from");
        expect(m).toHaveProperty("to");
        expect(m.from).not.toBe(m.to);
      }

      if (m.type === "remove") {
        expect(m).toHaveProperty("from");
      }
    }
  });

  it("contains the new-project-idea → idea-audit rename", () => {
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));

    const rename = data.migrations.find(
      (m) => m.type === "rename" && m.from === "new-project-idea" && m.to === "idea-audit"
    );
    expect(rename).toBeDefined();
    expect(rename.since).toBe("1.6.0");
  });

  it("renamed skill directory actually exists", () => {
    const skillsDir = join(import.meta.dirname, "..", "skills");
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const data = JSON.parse(readFileSync(migrationsPath, "utf-8"));

    for (const m of data.migrations) {
      if (m.type === "rename") {
        expect(fsExtra.existsSync(join(skillsDir, m.to, "SKILL.md"))).toBe(true);
        expect(fsExtra.existsSync(join(skillsDir, m.from))).toBe(false);
      }
    }
  });
});

describe("loadMigrations", () => {
  it("loads valid migrations.json", () => {
    const migrationsPath = join(import.meta.dirname, "..", "migrations.json");
    const migrations = loadMigrations(migrationsPath);
    expect(Array.isArray(migrations)).toBe(true);
    expect(migrations.length).toBeGreaterThan(0);
  });

  it("returns empty array for missing file", () => {
    const migrations = loadMigrations(join(TMP, "nonexistent.json"));
    expect(migrations).toEqual([]);
  });

  it("returns empty array for malformed JSON", () => {
    const bad = join(TMP, "bad.json");
    fsExtra.writeFileSync(bad, "not json at all");
    const migrations = loadMigrations(bad);
    expect(migrations).toEqual([]);
  });

  it("returns empty array when migrations key is missing", () => {
    const noMigrations = join(TMP, "no-migrations.json");
    fsExtra.writeFileSync(noMigrations, JSON.stringify({ version: 1 }));
    const migrations = loadMigrations(noMigrations);
    expect(migrations).toEqual([]);
  });
});

describe("applyMigrations (real production function)", () => {
  it("renames skill directory via moveSync (not just delete)", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "old-name"));
    fsExtra.writeFileSync(join(skillsDir, "old-name", "SKILL.md"), "---\nname: old-name\n---\n# Content");

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "old-name", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(1);
    // Old directory should be gone
    expect(fsExtra.existsSync(join(skillsDir, "old-name"))).toBe(false);
    // New directory should exist with the original content
    expect(fsExtra.existsSync(join(skillsDir, "new-name", "SKILL.md"))).toBe(true);
    const content = fsExtra.readFileSync(join(skillsDir, "new-name", "SKILL.md"), "utf-8");
    expect(content).toContain("# Content");
  });

  it("skips rename if old skill doesn't exist", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(skillsDir);

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "nonexistent", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
  });

  it("skips rename if new skill already exists", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "old-name"));
    fsExtra.writeFileSync(join(skillsDir, "old-name", "SKILL.md"), "---\nname: old-name\n---\n");
    fsExtra.ensureDirSync(join(skillsDir, "new-name"));

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "old-name", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
    expect(fsExtra.existsSync(join(skillsDir, "old-name"))).toBe(true);
  });

  it("handles remove migration", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "deprecated-skill"));
    fsExtra.writeFileSync(join(skillsDir, "deprecated-skill", "SKILL.md"), "---\nname: deprecated\n---\n");

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "remove", from: "deprecated-skill", since: "2.0.0" }]
    );

    expect(applied).toBe(1);
    expect(fsExtra.existsSync(join(skillsDir, "deprecated-skill"))).toBe(false);
  });

  it("applies across multiple locations and preserves content", () => {
    const loc1 = join(TMP, "loc1", "skills");
    const loc2 = join(TMP, "loc2", "skills");
    fsExtra.ensureDirSync(join(loc1, "old-name"));
    fsExtra.writeFileSync(join(loc1, "old-name", "SKILL.md"), "---\nname: old-name\n---\nloc1 content");
    fsExtra.ensureDirSync(join(loc2, "old-name"));
    fsExtra.writeFileSync(join(loc2, "old-name", "SKILL.md"), "---\nname: old-name\n---\nloc2 content");

    const applied = applyMigrations(
      [{ skills: loc1 }, { skills: loc2 }],
      [{ type: "rename", from: "old-name", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(2);
    expect(fsExtra.existsSync(join(loc1, "new-name", "SKILL.md"))).toBe(true);
    expect(fsExtra.existsSync(join(loc2, "new-name", "SKILL.md"))).toBe(true);
    expect(fsExtra.readFileSync(join(loc1, "new-name", "SKILL.md"), "utf-8")).toContain("loc1 content");
    expect(fsExtra.readFileSync(join(loc2, "new-name", "SKILL.md"), "utf-8")).toContain("loc2 content");
  });

  it("rejects path-traversal slugs in migration.from", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(skillsDir);

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "../escape", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
  });

  it("rejects path-traversal slugs in migration.to", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "old-name"));
    fsExtra.writeFileSync(join(skillsDir, "old-name", "SKILL.md"), "test");

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "old-name", to: "../escape", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
    // Original should still exist
    expect(fsExtra.existsSync(join(skillsDir, "old-name", "SKILL.md"))).toBe(true);
  });

  it("skips migration with invalid slug containing dots", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(skillsDir);

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "remove", from: "../../etc", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
  });

  it("skips when skills directory does not exist", () => {
    const applied = applyMigrations(
      [{ skills: join(TMP, "nonexistent") }],
      [{ type: "rename", from: "old", to: "new", since: "2.0.0" }]
    );

    expect(applied).toBe(0);
  });
});
