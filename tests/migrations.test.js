import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import fsExtra from "fs-extra";
import { readFileSync } from "fs";

const TMP = join(import.meta.dirname, ".tmp-test-migrations");

// We can't easily import the private functions from update.js,
// so we test migrations.json format validity and the migration logic inline.

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
        // The 'to' skill should exist
        expect(fsExtra.existsSync(join(skillsDir, m.to, "SKILL.md"))).toBe(true);
        // The 'from' skill should NOT exist
        expect(fsExtra.existsSync(join(skillsDir, m.from))).toBe(false);
      }
    }
  });
});

describe("migration apply logic", () => {
  // Simulate the migration logic from update.js

  function applyMigrations(locations, migrations) {
    let applied = 0;
    for (const migration of migrations) {
      if (migration.type === "rename") {
        for (const loc of locations) {
          if (!fsExtra.existsSync(loc.skills)) continue;
          const oldDir = join(loc.skills, migration.from);
          const newDir = join(loc.skills, migration.to);
          if (fsExtra.existsSync(join(oldDir, "SKILL.md")) && !fsExtra.existsSync(newDir)) {
            fsExtra.removeSync(oldDir);
            applied++;
          }
        }
      } else if (migration.type === "remove") {
        for (const loc of locations) {
          if (!fsExtra.existsSync(loc.skills)) continue;
          const oldDir = join(loc.skills, migration.from);
          if (fsExtra.existsSync(oldDir)) {
            fsExtra.removeSync(oldDir);
            applied++;
          }
        }
      }
    }
    return applied;
  }

  it("removes old skill directory on rename migration", () => {
    const skillsDir = join(TMP, "skills");
    fsExtra.ensureDirSync(join(skillsDir, "old-name"));
    fsExtra.writeFileSync(join(skillsDir, "old-name", "SKILL.md"), "---\nname: old-name\n---\n");

    const applied = applyMigrations(
      [{ skills: skillsDir }],
      [{ type: "rename", from: "old-name", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(1);
    expect(fsExtra.existsSync(join(skillsDir, "old-name"))).toBe(false);
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
    // Old dir should still exist since we didn't migrate
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

  it("applies across multiple locations", () => {
    const loc1 = join(TMP, "loc1", "skills");
    const loc2 = join(TMP, "loc2", "skills");
    fsExtra.ensureDirSync(join(loc1, "old-name"));
    fsExtra.writeFileSync(join(loc1, "old-name", "SKILL.md"), "test");
    fsExtra.ensureDirSync(join(loc2, "old-name"));
    fsExtra.writeFileSync(join(loc2, "old-name", "SKILL.md"), "test");

    const applied = applyMigrations(
      [{ skills: loc1 }, { skills: loc2 }],
      [{ type: "rename", from: "old-name", to: "new-name", since: "2.0.0" }]
    );

    expect(applied).toBe(2);
  });
});
