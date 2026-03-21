import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

function readJSON(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf-8"));
}

describe("version consistency", () => {
  const pkg = readJSON("package.json");
  const plugin = readJSON(".claude-plugin/plugin.json");
  const marketplace = readJSON(".claude-plugin/marketplace.json");

  it("package.json version is a valid semver", () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("plugin.json version matches package.json", () => {
    expect(plugin.version).toBe(pkg.version);
  });

  it("marketplace.json top-level version matches package.json", () => {
    expect(marketplace.version).toBe(pkg.version);
  });

  it("marketplace.json plugins[0].version matches package.json", () => {
    expect(marketplace.plugins[0].version).toBe(pkg.version);
  });

  it("plugin.json has required fields", () => {
    expect(plugin.name).toBeDefined();
    expect(plugin.description).toBeDefined();
    expect(plugin.author).toBeDefined();
    expect(plugin.license).toBeDefined();
  });

  it("marketplace.json has required structure", () => {
    expect(marketplace.name).toBeDefined();
    expect(marketplace.owner).toBeDefined();
    expect(marketplace.plugins).toBeInstanceOf(Array);
    expect(marketplace.plugins.length).toBeGreaterThan(0);
    expect(marketplace.plugins[0].source).toBeDefined();
    expect(marketplace.plugins[0].source.type).toBe("github");
  });
});
