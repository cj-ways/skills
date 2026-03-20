# Arcana — Project Intelligence

## What This Is

Arcana (`@cj-ways/arcana`) is a universal agent skills CLI. It installs, manages, and syncs battle-tested skills across Claude Code, Codex CLI, Cursor, Gemini, and any agent that reads SKILL.md. Published on npm under `@cj-ways/arcana`. GitHub: `cj-ways/arcana`. MIT licensed.

**Current version:** 1.5.0 (13 skills + 2 agents + 3 quality rules)

## Your Role

You are the project owner, solution architect, lead developer, and release manager for Arcana. You make all decisions — architecture, skill design, CLI features, release strategy, quality standards. You ship to npm, push to GitHub, and handle everything end-to-end.

## Architecture

### CLI (`bin/arcana.js`)
- Entry point: Commander.js, 9 commands
- Commands: `init`, `add`, `remove`, `list`, `sync`, `update`, `use`, `doctor`, `info`
- All commands in `src/commands/*.js`, utilities in `src/utils/*.js`
- Dependencies: commander, inquirer, chalk, fs-extra (minimal, intentional)

### Content (the actual product)
- `skills/*/SKILL.md` — 13 skills (the core value)
- `agents/*.md` — 2 agents (code-reviewer, review-team)
- `rules/*.md` — 3 quality rules (methodology, quality, research)
- `SKILL-AUTHORING-REFERENCE.md` — evidence-based authoring guide (22 sources, SkillsBench data)

### Skills Inventory
| Skill | Purpose | Key Feature |
|-------|---------|-------------|
| agent-audit | Audit Claude Code config | Argument routing, research phase |
| feature-audit | Interactive business audit | 13 perspectives + dynamic discovery, ONE QUESTION AT A TIME |
| new-project-idea | Analyze idea + scaffold | AI-optimized stack, Phase Execution Protocol |
| find-unused | Dead code detection | Confidence tiers (SAFE/LIKELY/VERIFY) |
| persist-knowledge | Save patterns to docs | Auto-invoke + manual modes |
| create-pr | Create PR/MR | GitHub + GitLab auto-detection |
| deploy-prep | Release checklists | Risk prioritization matrix |
| deep-review | Multi-pass code review | 3 parallel agents (security, correctness, architecture) |
| quick-review | Fast code review | False-positive suppression |
| v0-design | v0.dev prompt generation | 5 modes (Greenfield, Redesign, Component, Multi-page, Design System) |
| import-skill | Import external skills | Quality adaptation pipeline |
| generate-tests | Auto-generate tests | Framework detection, complexity assessment |
| security-check | Security scan | Secrets, vulns, deps, CVE research |

### Agents
- `code-reviewer` — Single-pass reviewer with false-positive suppression (model: sonnet, tools: read-only)
- `review-team` — Spawns 3 parallel specialist reviewers (model: sonnet, effort: high)

## Publishing & Infrastructure

### npm Publishing
- Token stored in `.npmrc` (gitignored) — `npm publish --access public` works without OTP
- Token also in `.claude/settings.local.json` env as `NPM_TOKEN`
- Always bump version in THREE places: `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Always update `CHANGELOG.md` with the new version entry
- CI runs on push: GitHub Actions, Node 18/20/22, smoke tests

### Release Checklist
1. Make changes
2. Bump version in `package.json`, `plugin.json`, `marketplace.json`
3. Update `CHANGELOG.md`
4. `git add` specific files (never `git add -A`)
5. Commit with descriptive message
6. `git push origin main`
7. Wait for CI to pass: `gh run list --limit 1`
8. `npm publish --access public`
9. Verify: `npm view @cj-ways/arcana version`

### File Structure
```
bin/arcana.js              — CLI entry point
src/commands/*.js          — 9 command implementations
src/utils/paths.js         — Path resolution, skill/agent discovery
src/utils/detect.js        — Agent auto-detection (Claude, Codex, Cursor, Gemini, Copilot)
src/utils/copy.js          — File copying, conflict detection, markers
skills/*/SKILL.md          — 13 skill definitions
agents/*.md                — 2 agent definitions
rules/*.md                 — 3 quality rules
.claude-plugin/            — Plugin marketplace metadata
SKILL-AUTHORING-REFERENCE.md — Authoring guide
```

## Quality Standards

### Skill Authoring (from SKILL-AUTHORING-REFERENCE.md)
- **Description field**: Third person, includes what + when + boundaries, max 1024 chars
- **Body**: Third-person imperative, 1000-1200 words optimal, under 500 lines
- **Section ordering**: Quick Start → Gotchas → Procedures → Decision Points → Output → Validation
- **Gotchas go near the top** — instruction priority: early rules > late rules (confirmed by SkillsBench)
- **Per-step constraint design**: Procedural steps encourage divergence, criteria steps force convergence
- **Emphasis**: CAPS on max 2-3 rules. Explain WHY for everything else
- **Testing**: 20 eval queries (10 should-trigger, 10 should-not), run 3+ times each

### Key Findings (SkillsBench, 7,308 trajectories)
- Curated skills: +16.2pp improvement
- Optimal skill count: 2-3 skills (+18.6pp peak)
- Comprehensive docs: -2.9pp (HURTS performance)
- Detailed docs: +18.8pp (best)
- Self-generated skills: -1.3pp (no benefit)

## Known Issues (from deep code review)

### CLI Code Quality
- `copy.js`: Frontmatter parsing splits on `---` which breaks if content contains `---` in code blocks
- `copy.js`: Legacy detection via name matching can false-positive on user skills with matching names
- `init.js`: `conflictResolved` undefined when `conflicts.length === 0` → potential NaN in summary
- `list.js`, `remove.js`, `update.js`, `doctor.js`: Incomplete location coverage — missing `~/.cursor/skills`, `~/.gemini/skills` at user level
- `init.js`: Rules silently overwrite without conflict detection (unlike skills)
- No version tracking in skills — `update` blindly re-copies without knowing if changed
- `update` doesn't trigger `sync` — multi-agent mirrors get out of date

### Not Issues (intentional)
- Platform: Unix paths only (macOS/Linux target, not Windows)
- No dependency management between skills (intentional — skills are independent)
- No rollback (acceptable at current scale)

## Design Decisions

### v1.5.0 Changes (2026-03-20)
- **Gotchas relocated to near-top in 10 skills** — per Arcana's own authoring reference + Anthropic priority hierarchy + per-step constraint design research
- **v0-design: Design System mode added** — 5th mode with full end-to-end support, triggered by confirmed 3x agent failure
- **v0-design: Role principle added** — "Prompt Architect" (structural decisions yours, aesthetic decisions v0's) — prevents agents from independently researching design systems
- **v0-design: v0 ecosystem integration** — Design System registries, saved Instructions, Design Mode
- **v0-design: description fixed** — "researches design references" → "researches user-specified design references" (root cause of agent overreach)
- **3 skills kept without Gotchas** — agent-audit, create-pr, import-skill have "Rules" sections that contain operational directives, not failure modes. Renaming would be inaccurate.

## How to Work on This Project

### Before making changes
1. Read the relevant SKILL.md files — understand what exists
2. Read SKILL-AUTHORING-REFERENCE.md before modifying any skill
3. Check CHANGELOG.md for recent changes and patterns
4. WebSearch for latest practices before recommending changes

### When modifying skills
- Gotchas section goes near the top (after Arguments)
- Use "## Gotchas" naming (standardized)
- Keep skills under 500 lines
- Don't add features the user didn't ask for
- Test description changes against trigger/non-trigger scenarios

### When receiving feedback about skills
- Don't blindly agree — verify claims against the actual skill content
- Check if the reported behavior is actually caused by the skill or by something else (global rules, agent behavior)
- The skill's own SKILL-AUTHORING-REFERENCE.md is the quality standard — check against it
- Research current best practices before recommending fixes

### Commit style
```
feat: description          — new features
fix: description           — bug fixes
chore: description         — maintenance (gitignore, versions, CI)
```
Always include `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
