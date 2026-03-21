import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import fsExtra from "fs-extra";
import { isInsideProject, detectExistingAgents, suggestAgent } from "../src/utils/detect.js";

const TMP = join(import.meta.dirname, ".tmp-test-detect");

beforeEach(() => {
  fsExtra.ensureDirSync(TMP);
});

afterEach(() => {
  fsExtra.removeSync(TMP);
});

describe("isInsideProject", () => {
  it("returns true when .git exists", () => {
    fsExtra.ensureDirSync(join(TMP, ".git"));
    expect(isInsideProject(TMP)).toBe(true);
  });

  it("returns false when .git does not exist", () => {
    expect(isInsideProject(TMP)).toBe(false);
  });
});

describe("detectExistingAgents", () => {
  it("detects claude from CLAUDE.md", () => {
    fsExtra.writeFileSync(join(TMP, "CLAUDE.md"), "# Claude");
    const agents = detectExistingAgents(TMP);
    expect(agents.claude).toBe(true);
    expect(agents.codex).toBe(false);
    expect(agents.multi).toBe(false);
  });

  it("detects claude from .claude directory", () => {
    fsExtra.ensureDirSync(join(TMP, ".claude"));
    const agents = detectExistingAgents(TMP);
    expect(agents.claude).toBe(true);
  });

  it("detects codex from AGENTS.md", () => {
    fsExtra.writeFileSync(join(TMP, "AGENTS.md"), "# Agents");
    const agents = detectExistingAgents(TMP);
    expect(agents.codex).toBe(true);
    expect(agents.claude).toBe(false);
  });

  it("detects codex from .codex directory", () => {
    fsExtra.ensureDirSync(join(TMP, ".codex"));
    const agents = detectExistingAgents(TMP);
    expect(agents.codex).toBe(true);
  });

  it("detects multi from .agents/skills", () => {
    fsExtra.ensureDirSync(join(TMP, ".agents", "skills"));
    const agents = detectExistingAgents(TMP);
    expect(agents.multi).toBe(true);
  });

  it("returns all false for empty directory", () => {
    const agents = detectExistingAgents(TMP);
    expect(agents.claude).toBe(false);
    expect(agents.codex).toBe(false);
    expect(agents.multi).toBe(false);
  });
});

describe("suggestAgent", () => {
  it("returns 'multi' when .agents/skills exists", () => {
    fsExtra.ensureDirSync(join(TMP, ".agents", "skills"));
    expect(suggestAgent(TMP)).toBe("multi");
  });

  it("returns 'multi' when both claude and codex detected", () => {
    fsExtra.writeFileSync(join(TMP, "CLAUDE.md"), "");
    fsExtra.writeFileSync(join(TMP, "AGENTS.md"), "");
    expect(suggestAgent(TMP)).toBe("multi");
  });

  it("returns 'codex' when only codex detected", () => {
    fsExtra.writeFileSync(join(TMP, "AGENTS.md"), "");
    expect(suggestAgent(TMP)).toBe("codex");
  });

  it("returns 'claude' when only claude detected", () => {
    fsExtra.ensureDirSync(join(TMP, ".claude"));
    expect(suggestAgent(TMP)).toBe("claude");
  });

  it("returns 'claude' as default for empty directory", () => {
    expect(suggestAgent(TMP)).toBe("claude");
  });

  it("multi flag takes priority over claude+codex", () => {
    fsExtra.ensureDirSync(join(TMP, ".agents", "skills"));
    fsExtra.writeFileSync(join(TMP, "CLAUDE.md"), "");
    fsExtra.writeFileSync(join(TMP, "AGENTS.md"), "");
    expect(suggestAgent(TMP)).toBe("multi");
  });
});
