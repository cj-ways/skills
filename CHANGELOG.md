# Changelog

## [1.1.0] - 2026-03-18

### Added
- `arcana doctor` command — validate installation health and sync status
- `arcana info <skill>` command — show skill metadata without full content
- Global error handler — friendly messages instead of stack traces
- `--dry-run` support detection in init
- Existing installation detection in init (warns before overwriting)
- User-level skill search in remove command
- CHANGELOG.md

### Fixed
- `arcana add` with no arguments no longer silently installs everything
- `--agent invalid` now shows clear error instead of silently defaulting to claude
- AGENTS.md skill discovery block now lists actual skill names
- Skill/agent lists now discovered dynamically from filesystem (no hardcoded arrays)
- `remove` now searches user-level directories too
- `use` error message now shows dynamic skill list
- `sync` uses path.relative() for cross-platform paths
- Exit codes: commands now exit non-zero on failure

### Removed
- Empty templates/ directory
- Dead `getHomeDir()` export
- Unused `detectExistingAgents` import in add.js

## [1.0.1] - 2026-03-18
- Fix bin path for npm (remove ./ prefix)

## [1.0.0] - 2026-03-18
- Initial release: 7 skills + 1 agent + CLI
