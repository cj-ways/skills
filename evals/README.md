# Arcana Skill Evaluations (Layer 2)

AI-driven tests that verify Arcana's skills actually perform as claimed.

## How It Works

Each scenario is a self-contained directory with:
- A planted codebase (files with known issues)
- A manifest describing what the skill should find
- Expected outcomes with pass/fail criteria

The eval runner invokes Claude Code with the target skill against each scenario and grades the output.

## Running Evals

```bash
node evals/run-eval.js                        # run all scenarios
node evals/run-eval.js --skill security-check  # run scenarios for one skill
node evals/run-eval.js --scenario sql-injection # run one specific scenario
```

## Scenario Structure

```
evals/scenarios/<scenario-name>/
  manifest.json    — metadata, target skill, expected findings
  src/             — planted codebase
```

### manifest.json

```json
{
  "name": "sql-injection-express",
  "skill": "security-check",
  "description": "Express app with SQL injection vulnerabilities",
  "expected": [
    {
      "id": "sql-inject-1",
      "description": "Raw SQL query with string interpolation in users.js",
      "file": "src/routes/users.js",
      "severity": "critical",
      "mustFind": true
    }
  ],
  "falsePositives": [
    {
      "id": "fp-1",
      "description": "Parameterized query in posts.js is safe",
      "file": "src/routes/posts.js",
      "mustNotFlag": true
    }
  ]
}
```

## Grading

Each scenario produces:
- **Detection rate**: % of `mustFind` items found
- **False positive rate**: % of `mustNotFlag` items incorrectly flagged
- **Overall**: PASS (100% detection, 0% false positives), PARTIAL, or FAIL

## Notes

- Non-deterministic — run 3+ times per scenario for reliable results
- Expensive — each run invokes Claude
- Manual invocation only — not in CI, not published to npm
- Results tracked in `evals/results/` for trend analysis
