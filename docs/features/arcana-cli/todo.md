# Arcana CLI — Todo

> Last updated: 2026-03-21

## Completed

- [x] Fix marketplace.json nested plugin version not updated by release script
- [x] Add `--provenance` to npm publish in release checklist
- [x] Extract shared frontmatter parser (was duplicated in info.js and import.js)
- [x] Fix `arcana add` exits 0 on unknown skills (now exits 1)
- [x] Fix `arcana remove` exits 0 with no args (now exits 1)
- [x] Fix update auto-sync not cleaning stale mirrors (now passes --clean)
- [x] Replace curl with native fetch() in import command
- [x] Add `arcana import` to README commands section

## Medium Priority

- [ ] Add `--verbose`/`--debug` flag for troubleshooting (shows fetch URLs, HTTP status, errors)
- [ ] Error messages audit: ensure all errors suggest a fix action
- [ ] Consider `--dry-run` for init, add, sync commands
- [ ] Consider `--json` output for list, info, doctor (CI integration)

## Low Priority

- [ ] Add test case for frontmatter with `---` in description values
- [ ] Add test for GitHub API rate limiting / timeout in import.js
- [ ] Mock network calls in import tests to avoid CI flakiness
- [ ] Consider extracting `getPackageRoot()` utility (migration path resolution is indirect)
