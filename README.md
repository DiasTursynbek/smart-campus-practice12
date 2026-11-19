# AI-Driven Software Engineering — Practice #12

**Build a small AI-enabled feature: "Explain availability" with agentic code review**

- Student: Tursynbek Dias, ID 24B032073
- Class time: Thursday 14:00–17:00 (practice lesson: November 19, 2026)
- AI tool: Claude Code 2.1.322 (Anthropic), model Claude Sonnet 5.5 (`claude-sonnet-5-5`)
- Live demo (Bolt.new publish): https://smart-campus-room-av-x5kd.bolt.host
- Bolt.new project: https://bolt.new/p/71832307
- Report: [report/Practice12_Tursynbek_Dias.pdf](report/Practice12_Tursynbek_Dias.pdf)

## What was built
The Smart Campus Room Availability Checker got an optional **Explain availability** button. The deterministic checker (`checkAvailability`) still decides Available / Unavailable; the LLM only explains that decision and can never change it.

- Mock LLM adapter (no API key in the browser): modes `normal`, `slow`, `error`, `invalid`.
- Input validation (empty / >60 chars / bad time / code mismatch) and output validation (≤280 chars, ≤2 sentences, agrees with status and reason, only the supplied times).
- 3 s timeout and a labelled deterministic fallback ("Standard explanation (not AI-generated)").
- Explanation shown in a separate box: "not a booking confirmation".

## Results
| Check | Result |
|---|---|
| Old booking tests | 27 / 27 pass (rules unchanged) |
| New LLM-feature tests | 26 / 26 pass |
| Type check, lint, build | pass |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Browser test cases | 9 / 9, status never changed by the explanation |
| Agentic review | 8 findings evaluated; 2 fixes (validator, fallback label) |

## Repository structure
```
project/              final source (React + TypeScript + Vite)
  src/explain/        contract.ts, prompt.ts, adapters.ts, explainAvailability.ts, explain.test.ts
  src/components/ExplainPanel.tsx
  README.md, AGENTS.md
baseline_checkpoint/  the project before any change (Task 1)
report/               Practice12_Tursynbek_Dias.pdf (Tasks 1–7, test cases, review report, reflection)
screenshots/          UI test cases, flow diagram, terminal evidence, live demo
evidence/             raw outputs: checks, diffs, prompt comparison, review verification
ai-sessions/          prompts, responses and metadata of every Claude Code session
```

## Run
```bash
cd project
npm install
npm run dev          # http://localhost:5173
npx vitest run       # 53 tests
npm run typecheck && npm run lint && npm run build
```

All data is fictional. No login, database, secrets or personal data.
