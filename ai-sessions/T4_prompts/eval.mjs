import { validateExplanation, validateExplainInput } from "./contract.mjs";
import fs from "node:fs";
const res = JSON.parse(fs.readFileSync("results.json", "utf8"));
const rows = []; const agg = {};
for (const j of res) {
  const v = validateExplanation(j.output, j.input);
  const markdown = /[*`#]|^\s*-\s/m.test(j.output);
  const sentences = (j.output.match(/[.!?](\s|$)/g) || []).length;
  const statusFlip = j.input.isAvailable === false && /\bis available\b|\bit is available\b/i.test(j.output.replace(/say (it|the room) (was|is) available/ig, ""));
  rows.push({ prompt: j.prompt, scenario: j.scenario, chars: j.output.length, sentences, markdown, valid: v.ok, why: v.ok ? "" : v.error });
  const a = agg[j.prompt] ??= { passed: 0, total: 0, markdown: 0, avgChars: 0 };
  a.total++; if (v.ok) a.passed++; if (markdown) a.markdown++; a.avgChars += j.output.length / 5;
}
let out = "Prompt comparison: 3 prompts x 5 scenarios, real model claude-sonnet-5-5, each answer checked by validateExplanation() from src/explain/contract.ts\n\n";
for (const r of rows) out += `${r.prompt.padEnd(15)} ${r.scenario.padEnd(22)} chars=${String(r.chars).padStart(3)} sentences=${r.sentences} markdown=${r.markdown ? "yes" : "no "} -> ${r.valid ? "VALID" : "REJECTED: " + r.why}\n`;
out += "\nSummary:\n"; for (const [p, a] of Object.entries(agg)) out += `${p}: ${a.passed}/${a.total} valid, markdown in ${a.markdown}/5, average ${Math.round(a.avgChars)} chars\n`;
fs.writeFileSync("evaluation.txt", out); console.log(out);
