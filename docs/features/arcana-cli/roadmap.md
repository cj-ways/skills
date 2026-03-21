# Arcana CLI — Roadmap

> Last updated: 2026-03-21

## Planned

### Skills

**Real-world testing of `import-skill` quality pipeline** — Approved
The CLI import command and adaptation skill both work. Needs iteration on edge cases from real usage: skills with `---` in content, non-standard frontmatter, oversized skills, multi-file skills with references/.

### Testing

**Layer 2 eval execution** — Approved
Framework and 3 scenarios exist in `evals/`. Needs actual `--run` execution against Claude to validate detection rates and establish baselines. Run 3+ times per scenario for reliability.

### CLI Polish

**`--verbose`/`--debug` flag** — Proposed
Global flag that shows fetch URLs, HTTP status, and detailed errors. Useful for debugging import failures and network issues.

**`--dry-run` for init, add, sync** — Proposed
Preview changes before applying. Builds trust with new users.

**`--json` output for list, info, doctor** — Proposed
Enable CI integration and scripting.

**Error messages audit** — Proposed
Ensure all errors suggest a fix action.

---

## Completed

### v1.7.x (2026-03-21)

**`skill-scout` skill** — 14th skill. Scouts major providers for skills matching the current project.

**`arcana import` CLI command** — Fetch skills from GitHub, URLs, or local paths. 10th CLI command. Uses native fetch() (no curl dependency).

**`import-skill` rewrite** — Refocused on quality adaptation pipeline (audit, assess, adapt, verify).

**Shared frontmatter parser** — Extracted to `src/utils/frontmatter.js`. Eliminated duplicate implementations in info.js and import.js.

**Exit code fixes** — `add` exits 1 on unknown skills, `remove` exits 1 with no args.

**Update auto-sync with --clean** — Stale skills removed from mirrors after migrations.

**marketplace.json version fix** — Release script now catches nested `plugins[0].version` field.

**curl replaced with fetch()** — No system dependency, better error handling, proxy support.

**README accuracy** — Import command added to commands section, skill count updated to 14.

### v1.6.x (2026-03-20)

**Doctor integrity check** — Hash installed skills against package source.

**Layer 2 eval framework** — 3 scenarios (security-check, find-unused, generate-tests).

**Layer 1 unit tests** — 177 tests across 7 suites. Vitest. CI on Node 20/22.

**WORKFLOW.md** — Skill lifecycle guide.

**Drop Cursor/Gemini support** — Focus on Claude Code + Codex CLI.

**Migration system** — `migrations.json` handles renames/removals.

**Rename `new-project-idea` to `idea-audit`** — First migration.

**`allowed-tools` on all skills** — Comma-separated format.

**README rewrite** — Why-first, workflow split, quantified SkillsBench claims.

**Release script** — `scripts/release.js` bumps all version fields.

**Bug fixes** — Frontmatter parsing, rules conflict detection, update triggers sync.

---

## Dropped

**Publish skills to third-party marketplaces (skills.sh, SkillsMP)** — Dropped 2026-03-20
Arcana is a self-contained toolkit. `import-skill` is the bridge. Claude Code's native plugin system (`.claude-plugin/marketplace.json`) remains supported as a distribution channel.

**Enterprise features** — Dropped 2026-03-20
Wrong stage.

**Additional agent support (Copilot, Antigravity, Windsurf)** — Dropped 2026-03-20
Focus on Claude Code + Codex CLI first.

---

## Competitive Intelligence

> Updated: 2026-03-21

- **Ecosystem scale**: 350,000+ skills in 2 months. 85% of tested skills made output worse (40/47). Industry consensus: 20-30 curated skills max.
- **Security crisis**: 13.4% of scanned skills have critical issues (Snyk). ClawHub incident: 1,184 malicious skills. Arcana's hand-authored, npm-provenance approach is a genuine differentiator.
- **skills.sh (Vercel)**: 83K+ skills, dominant directory. Backed by Vercel/Stripe/Prisma. Distribution infrastructure, not content — complementary to Arcana.
- **Name conflict**: `medy-gribkov/arcana` — 74 skills, 15 categories, visible on LobeHub. Same name, similar concept. The `@cj-ways/arcana` npm scope protects the package, but brand confusion is possible.
- **Anthropic official skills** (`anthropics/skills`): Reference skills for creative/technical tasks. Could expand into workflow territory (code review, security). Monitor.
- **Claude Code plugin marketplace**: Native distribution via `/plugin`. Arcana already participates via `.claude-plugin/marketplace.json`.
- **OpenAI Codex catalog**: 35 curated skills, 13K GitHub stars. Small — leaves room for Arcana's workflow skills.
- **Nobody competes on quality.** Market still in quantity phase. Arcana's SkillsBench data (7,308 trajectories) is unique.

## Audit History

- 2026-03-20: Initial feature audit. 13 universal + 4 feature-specific perspectives. Full competitive landscape. Shipped v1.6.0 with all roadmap items.
- 2026-03-21: Re-audit. 16 findings (9 fixed, 3 noted, 4 pass). Shipped v1.7.0 (skill-scout), v1.7.1 (version fix). Codebase in strong shape — remaining items are polish.
- 2026-03-21: Deep self-audit. 12 fixes: agents rewritten as thin wrappers (skills: field), Gotchas added to create-pr + agent-audit, doc drift fixed (version, counts, dead links), competitive intel updated (350K ecosystem, name conflict, security crisis), code quality fixes (dead check, marker consistency), disable-model-invocation on 4 skills.
