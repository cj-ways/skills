#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

const program = new Command();

program
  .name("arcana")
  .description(
    "Universal agent skills CLI — install, manage, and sync skills across Claude Code, Codex CLI, Cursor, and more."
  )
  .version(pkg.version);

program
  .command("init")
  .description("Interactive setup — choose agent, scope, and skills")
  .action(async () => {
    const { runInit } = await import("../src/commands/init.js");
    await runInit();
  });

program
  .command("add [skills...]")
  .description("Add specific skill(s) to the current setup")
  .option("--all", "Add all available skills")
  .option("--agent <agent>", "Target agent: claude, codex, multi", "claude")
  .option("--scope <scope>", "Install scope: project, user", "project")
  .action(async (skills, opts) => {
    const { runAdd } = await import("../src/commands/add.js");
    await runAdd(skills, opts);
  });

program
  .command("remove [skills...]")
  .description("Remove skill(s) from the current setup")
  .action(async (skills) => {
    const { runRemove } = await import("../src/commands/remove.js");
    await runRemove(skills);
  });

program
  .command("list")
  .description("Show installed and available skills")
  .action(async () => {
    const { runList } = await import("../src/commands/list.js");
    await runList();
  });

program
  .command("sync")
  .description(
    "Multi-agent: sync canonical .agents/skills/ to agent-specific directories"
  )
  .action(async () => {
    const { runSync } = await import("../src/commands/sync.js");
    await runSync();
  });

program
  .command("update")
  .description("Update installed skills to the latest version")
  .action(async () => {
    const { runUpdate } = await import("../src/commands/update.js");
    await runUpdate();
  });

program
  .command("use <skill>")
  .description("Print a skill's content to stdout (use without installing)")
  .action(async (skill) => {
    const { runUse } = await import("../src/commands/use.js");
    await runUse(skill);
  });

program.parse();
