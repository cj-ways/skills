#!/usr/bin/env node

/**
 * Arcana Layer 2 Eval Runner
 *
 * Invokes Claude Code with an Arcana skill against a planted scenario,
 * then grades the output against the manifest's expected findings.
 *
 * Usage:
 *   node evals/run-eval.js                          # list all scenarios
 *   node evals/run-eval.js --scenario <name>        # run one scenario
 *   node evals/run-eval.js --skill <skill>          # run all scenarios for a skill
 *   node evals/run-eval.js --scenario <name> --run  # actually invoke claude
 *
 * Without --run, it validates the scenario setup and shows what would be tested.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCENARIOS_DIR = join(__dirname, "scenarios");
const RESULTS_DIR = join(__dirname, "results");

function loadManifest(scenarioName) {
  const manifestPath = join(SCENARIOS_DIR, scenarioName, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error(`  No manifest.json in scenarios/${scenarioName}`);
    return null;
  }
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

function listScenarios() {
  if (!existsSync(SCENARIOS_DIR)) return [];
  return readdirSync(SCENARIOS_DIR).filter((name) => {
    return existsSync(join(SCENARIOS_DIR, name, "manifest.json"));
  });
}

function validateScenario(manifest) {
  const issues = [];

  if (!manifest.name) issues.push("Missing 'name'");
  if (!manifest.skill) issues.push("Missing 'skill'");
  if (!manifest.expected || !Array.isArray(manifest.expected)) {
    issues.push("Missing or invalid 'expected' array");
  }

  for (const exp of manifest.expected || []) {
    if (!exp.id) issues.push(`Expected item missing 'id'`);
    if (!exp.description) issues.push(`Expected item '${exp.id}' missing 'description'`);
  }

  return issues;
}

function gradeOutput(output, manifest) {
  const results = {
    scenario: manifest.name,
    skill: manifest.skill,
    timestamp: new Date().toISOString(),
    found: [],
    missed: [],
    falsePositives: [],
    clean: [],
  };

  const outputLower = output.toLowerCase();

  // Check expected findings
  for (const exp of manifest.expected || []) {
    // Search for evidence that the finding was reported
    // Look for file references, description keywords, or the specific issue
    const indicators = [
      exp.file,
      exp.description?.toLowerCase(),
      exp.id?.replace(/-/g, " "),
    ].filter(Boolean);

    const found = indicators.some((indicator) =>
      outputLower.includes(indicator.toLowerCase())
    );

    if (found) {
      results.found.push(exp.id);
    } else {
      results.missed.push(exp.id);
    }
  }

  // Check false positives
  for (const fp of manifest.falsePositives || []) {
    // If the file is mentioned in a negative/warning context, it's a false positive
    // Simple heuristic: if the file appears near words like "issue", "vulnerability", "unused", "dead"
    const flagWords = ["issue", "vulnerability", "vuln", "unused", "dead", "orphan", "flag", "warning", "risk"];
    const fileRef = fp.file?.toLowerCase() || "";

    // Find all occurrences of the file in output
    let flagged = false;
    if (fileRef) {
      const idx = outputLower.indexOf(fileRef.toLowerCase());
      if (idx !== -1) {
        // Check surrounding context (200 chars around the reference)
        const context = outputLower.slice(Math.max(0, idx - 100), idx + fileRef.length + 100);
        flagged = flagWords.some((w) => context.includes(w));
      }
    }

    if (flagged) {
      results.falsePositives.push(fp.id);
    } else {
      results.clean.push(fp.id);
    }
  }

  // Calculate scores
  const totalExpected = (manifest.expected || []).length;
  const totalFP = (manifest.falsePositives || []).length;

  results.detectionRate = totalExpected > 0 ? results.found.length / totalExpected : 1;
  results.falsePositiveRate = totalFP > 0 ? results.falsePositives.length / totalFP : 0;

  if (results.detectionRate === 1 && results.falsePositiveRate === 0) {
    results.grade = "PASS";
  } else if (results.detectionRate >= 0.8 && results.falsePositiveRate <= 0.2) {
    results.grade = "PARTIAL";
  } else {
    results.grade = "FAIL";
  }

  return results;
}

function saveResults(results) {
  if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });
  const filename = `${results.scenario}_${Date.now()}.json`;
  writeFileSync(join(RESULTS_DIR, filename), JSON.stringify(results, null, 2));
  return filename;
}

function printResults(results) {
  const emoji = results.grade === "PASS" ? "✓" : results.grade === "PARTIAL" ? "~" : "✗";
  console.log(`\n  ${emoji} ${results.scenario} — ${results.grade}`);
  console.log(`    Detection: ${(results.detectionRate * 100).toFixed(0)}% (${results.found.length}/${results.found.length + results.missed.length})`);
  console.log(`    False positives: ${(results.falsePositiveRate * 100).toFixed(0)}% (${results.falsePositives.length}/${results.falsePositives.length + results.clean.length})`);

  if (results.missed.length > 0) {
    console.log(`    Missed: ${results.missed.join(", ")}`);
  }
  if (results.falsePositives.length > 0) {
    console.log(`    False positives: ${results.falsePositives.join(", ")}`);
  }
}

// --- Main ---

const args = process.argv.slice(2);
const scenarioFlag = args.indexOf("--scenario");
const skillFlag = args.indexOf("--skill");
const shouldRun = args.includes("--run");
const targetScenario = scenarioFlag !== -1 ? args[scenarioFlag + 1] : null;
const targetSkill = skillFlag !== -1 ? args[skillFlag + 1] : null;

let scenarios = listScenarios();

if (targetScenario) {
  scenarios = scenarios.filter((s) => s === targetScenario);
}

if (targetSkill) {
  scenarios = scenarios.filter((s) => {
    const m = loadManifest(s);
    return m && m.skill === targetSkill;
  });
}

if (scenarios.length === 0) {
  console.log("\n  No matching scenarios found.\n");
  console.log("  Available scenarios:");
  for (const s of listScenarios()) {
    const m = loadManifest(s);
    console.log(`    ${s} (${m?.skill}) — ${m?.description || "no description"}`);
  }
  process.exit(0);
}

console.log(`\n✦ Arcana Skill Eval\n`);

for (const scenarioName of scenarios) {
  const manifest = loadManifest(scenarioName);
  if (!manifest) continue;

  const issues = validateScenario(manifest);
  if (issues.length > 0) {
    console.log(`  ✗ ${scenarioName} — invalid manifest:`);
    for (const issue of issues) console.log(`    - ${issue}`);
    continue;
  }

  const scenarioDir = join(SCENARIOS_DIR, scenarioName);

  console.log(`  ${manifest.name} (skill: ${manifest.skill})`);
  console.log(`    ${manifest.description}`);
  console.log(`    Expected: ${manifest.expected.length} findings, ${(manifest.falsePositives || []).length} false-positive traps`);

  if (!shouldRun) {
    console.log(`    → Dry run. Add --run to invoke Claude Code.\n`);
    continue;
  }

  // Invoke Claude Code with the skill
  console.log(`    → Running /${manifest.skill} in ${scenarioDir}...`);

  try {
    const skillContent = readFileSync(
      join(__dirname, "..", "skills", manifest.skill, "SKILL.md"),
      "utf-8"
    );

    const output = execSync(
      `claude -p "You are running in ${scenarioDir}. Run the following skill against this codebase and report all findings:\n\n${skillContent}" --cwd "${scenarioDir}" --max-turns 10`,
      {
        encoding: "utf-8",
        timeout: 120000,
        env: { ...process.env, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
      }
    );

    const results = gradeOutput(output, manifest);
    printResults(results);

    const filename = saveResults(results);
    console.log(`    Results saved: evals/results/${filename}\n`);
  } catch (err) {
    console.log(`    ✗ Error: ${err.message}\n`);
  }
}

if (!shouldRun) {
  console.log(`  Run with --run to invoke Claude Code against scenarios.\n`);
}
