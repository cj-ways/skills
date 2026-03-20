# Arcana CLI — Boundaries

What Arcana does NOT do, and why.

## Not a Marketplace

Arcana does not publish skills to external registries. `import-skill` is the bridge for bringing external skills in.

**Why:** Quality control. Arcana's skills are hand-authored against SkillsBench data.

## Not a Universal Agent Manager

Supports Claude Code and Codex CLI only.

**Why:** Focus. Two agents done well beats five done poorly.

## No Enterprise Features

No SSO, SCIM, team management, or private registries.

**Why:** Wrong stage. Single-maintainer project focused on skill quality.

## No Telemetry

No usage data, crash reports, or analytics.

**Why:** Unnecessary at current scale.

## No Auto-Generated Skills

All 13 skills are manually authored.

**Why:** SkillsBench: self-generated skills = -1.3pp. Hand-authored = +16.2pp.

## No Windows Support

Unix paths only (macOS and Linux).

**Why:** Target audience uses macOS/Linux.
