# cj-skills

Battle-tested Claude Code plugin with reusable skills and agents that work on **any project**.

7 skills + 1 agent covering auditing, code review, PR creation, dead code detection, knowledge persistence, deployment prep, and project scaffolding.

## Install

```bash
# Add the marketplace
/plugin marketplace add cj-ways/cj-skills

# Install (choose your scope)
/plugin install cj-skills@cj-ways-cj-skills --scope project   # shared with team (default)
/plugin install cj-skills@cj-ways-cj-skills --scope user      # personal, all projects
/plugin install cj-skills@cj-ways-cj-skills --scope local     # personal, this project only
```

## Skills

| Skill | Invoke | Description |
|-------|--------|-------------|
| **agent-audit** | `/cj-skills:agent-audit` | Audit Claude Code config (skills, hooks, permissions, memory) against latest best practices |
| **feature-audit** | `/cj-skills:feature-audit auth` | Interactive business audit — gaps, competitor analysis, improvements, roadmap |
| **new-project-idea** | `/cj-skills:new-project-idea "todo app"` | Analyze idea critically, scaffold project with CLAUDE.md, PLAN.md, OpenSpec |
| **find-unused** | `/cj-skills:find-unused` | Find dead code: unused exports, orphaned files, dead dependencies (TS, Go, Python, Rust) |
| **persist-knowledge** | `/cj-skills:persist-knowledge` | Auto-save discovered patterns/conventions to CLAUDE.md, MEMORY.md, .claude/rules/ |
| **create-pr** | `/cj-skills:create-pr` | Create PR/MR with auto-generated title, description, and affected areas (GitHub + GitLab) |
| **deploy-prep** | `/cj-skills:deploy-prep` | Release analysis — env vars, migrations, schema changes, deployment checklists |

## Agent

| Agent | Description |
|-------|-------------|
| **code-reviewer** | Zero-context code review with multi-pass methodology. PASS / NOTES / NEEDS CHANGES verdict. |

The code reviewer triggers automatically when you ask for a code review, or can be invoked directly.

## Scope Guide

| Scope | When to use |
|-------|-------------|
| `--scope project` | Team projects — skills are shared via `.claude/settings.json` in git |
| `--scope user` | Personal use — available across all your projects |
| `--scope local` | Trying it out — gitignored, won't affect teammates |

## Aliases

Want to invoke a skill with a custom name? Create a thin wrapper:

```bash
mkdir -p ~/.claude/skills/dead-code  # or .claude/skills/ for project-level
```

```markdown
# ~/.claude/skills/dead-code/SKILL.md
---
name: dead-code
description: Alias for find-unused. Finds dead code in any project.
---
Run /cj-skills:find-unused with these arguments: $ARGUMENTS
```

### Common alias examples

| Alias | Points to | Create at |
|-------|-----------|-----------|
| `/dead-code` | `find-unused` | `~/.claude/skills/dead-code/SKILL.md` |
| `/review` | `code-reviewer` agent | `~/.claude/skills/review/SKILL.md` |
| `/pr` | `create-pr` | `~/.claude/skills/pr/SKILL.md` |
| `/release` | `deploy-prep` | `~/.claude/skills/release/SKILL.md` |
| `/save` | `persist-knowledge` | `~/.claude/skills/save/SKILL.md` |

## License

MIT
