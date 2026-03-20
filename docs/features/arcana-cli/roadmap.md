# Arcana CLI — Roadmap

> Last updated: 2026-03-20

## Planned

### Testing

**Layer 1: CLI unit tests** — Approved
Test framework covering: copy.js, migrations.json processing, sync logic. Deterministic, fast, runs in CI.

**Layer 2: Skill evaluation framework** — Approved
AI-driven tests in `evals/` directory. Planted scenarios tested against skills. Manual invocation only, excluded from npm package.

### Security

**`doctor` integrity check** — Approved
Hash installed skills against package versions. Report local modifications.

### Skills

**Develop `import-skill`** — Approved
Currently a draft. Needs real quality adaptation pipeline implementation.

### Documentation

**Workflow guide (`WORKFLOW.md`)** — Approved
Shows how skills chain together through a development lifecycle.

---

## Completed

**Drop Cursor and Gemini support** — 2026-03-20
Focus on Claude Code + Codex CLI. Multi-agent architecture preserved.

**Migration system (`migrations.json`)** — 2026-03-20
Handles skill renames and removals across versions.

**Rename `new-project-idea` to `idea-audit`** — 2026-03-20
Consistent with `*-audit` naming family.

**`allowed-tools` on all 13 skills** — 2026-03-20
Standardized comma-separated format.

**README rewrite** — 2026-03-20
Why-first positioning, workflow split, quantified SkillsBench claims.

**Release script** — 2026-03-20
`scripts/release.js` bumps version across 3 files.

**Bug fixes** — 2026-03-20
Frontmatter parsing, rules conflict detection, update triggers sync.

---

## Dropped

**Publish skills to external marketplaces** — Dropped 2026-03-20
Arcana is a self-contained toolkit. `import-skill` is the bridge for external skills.

**Enterprise features (SSO, teams, audit logs)** — Dropped 2026-03-20
Wrong stage.

**Additional agent support (Copilot, Antigravity, Windsurf)** — Dropped 2026-03-20
Focus on Claude Code + Codex CLI first.

---

## Competitive Intelligence

- **skills.sh (Vercel)**: 89K+ skills, 2.4M+ installs, 43+ agents. Dominant distribution.
- **Nobody competes on quality.** SkillsBench-backed curation is Arcana's moat.
- **Platform-native skill systems maturing.** Arcana's value is curated content + multi-agent sync.

## Audit History

- 2026-03-20: Initial feature audit. 13 universal + 4 feature-specific perspectives.
