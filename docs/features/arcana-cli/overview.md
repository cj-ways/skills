# Arcana CLI — Overview

## What It Is

A CLI tool that installs, manages, and syncs curated agent skills across Claude Code and Codex CLI. Published on npm as `@cj-ways/arcana`.

## Architecture

Entry point: `bin/arcana.js` (Commander.js). 9 commands, 3 utility modules, 4 dependencies (commander, inquirer, chalk, fs-extra).

### Skill Categories

**Development Workflow** (lifecycle order):

| Phase | Skill | Purpose |
|-------|-------|---------|
| Ideate | `idea-audit` | Validate project idea, competitive analysis, scaffold |
| Validate | `feature-audit` | Interactive business audit — gaps, competitors, roadmap |
| Design | `v0-design` | Generate optimized v0.dev prompts for UI |
| Test | `generate-tests` | Auto-generate tests matching existing patterns |
| Review | `quick-review` / `deep-review` | Code review (single-pass or 3 parallel reviewers) |
| Ship | `create-pr` then `deploy-prep` | PR creation, release checklists |

**Toolkit** (use anytime):

| Skill | Purpose |
|-------|---------|
| `security-check` | Scan for secrets, vulnerabilities, dependency issues |
| `find-unused` | Dead code detection with confidence tiers |
| `persist-knowledge` | Save patterns and conventions to project docs |
| `agent-audit` | Audit agent configuration against best practices |
| `import-skill` | Bring external skills into the Arcana ecosystem |

### Supported Agents

| Agent | Skills directory | Detection |
|-------|-----------------|-----------|
| Claude Code | `.claude/skills/` | `CLAUDE.md` or `.claude/` exists |
| Codex CLI | `.agents/skills/` | `AGENTS.md` or `.codex/` exists |
| Multi (both) | `.agents/skills/` (canonical) | 2+ agents detected |

Multi-agent mode uses `.agents/skills/` as the canonical source and mirrors to `.claude/skills/`.
