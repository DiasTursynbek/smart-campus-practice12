# Review: "Explain availability" (mock LLM adapter)

I found no blocking defects. There are four medium findings, mainly that the output validator is weaker than AC2 and AC5 imply.

**Evidence base:** I read `README.md`, `AGENTS.md` and the applied sources. I did not run `vitest`, `typecheck`, `lint` or `build`, because I had no shell. `AGENTS.md` review gate 1 therefore remains unverified. The test results below are my reading of the code, not executed output.

## Acceptance criteria

| AC | Verdict |
|---|---|
| AC1 | **Confirmed by reading.** In `src/availability.ts` the branch order and conditions are identical, and only `code` was added to each return. The existing `availability.test.ts` is untouched and asserts only `status`. |
| AC2 | **Partly met.** Status polarity and clock times are checked (F1 and F2). |
| AC3 | **Met, with limits.** `validateExplainInput` rejects empty, over-long and malformed input. That input comes from fixtures and the already-validated time fields, not from free text. |
| AC4 | **Partly met.** Timeout, error and invalid output fall back safely. There is no code path or test for an unavailable key (F4). |
| AC5 | **Partly met.** The generated text is marked, but fallback text is mislabelled (F3). |

Security looks fine. There are no keys or network calls, React escapes the output, and the prompt escapes `<` and keeps the data inside `<data>`. A hostile room label is only theoretical here, because labels come from `sampleData.ts`.

## Findings

### F1. Medium, confirmed by reading: the explanation can state the wrong reason or invent booking details
- **File:** `src/explain/contract.ts`, `validateExplanation`.
- **Evidence:** it checks only (a) available/unavailable wording, (b) at most two sentences, (c) `HH:MM` tokens. It never checks that the stated reason matches `reasonCode`. It also never checks for invented names, durations or numbers.
- **Verification:** these should return `ok: true` against the current code:
  - `validateExplanation('Not available because it overlaps the "Physics Exam" booking.', overlapInput)`
  - `validateExplanation("Not available because the room is blocked.", overlapInput)`
  - `validateExplanation("The room is booked.", availableInput)`. None of `unavailable`, `not available` or `blocked` appears, so this passes.
- **Recommendation:**
  - Require one keyword per `reasonCode`, for example `overlap`, `blocked` or `120`.
  - Reject digits that aren't the supplied start or end.
  - Reject quoted strings.
  - Optionally reject `booked`, `occupied` and `free` for available decisions.

### F2. Medium, confirmed by reading: word-matching gives false rejections and the test passes for the wrong reason
- **File:** `src/explain/contract.ts`.
- **Evidence:**
  - The scan runs over the whole text, including the echoed room label. The "hostile room label" test in `explain.test.ts` passes only because the mock echoes a label containing "available", and the validator then reads that as a contradiction. A legitimately named room such as "Blocked Rehearsal Room" would be rejected the same way for an available decision.
  - `isn't available` is not removed by `.replace(/\bnot available\b/…)`, so for an unavailable decision it is read as "available".
  - A model writing `9:30` for start `09:30` is rejected as an unsupplied time.
  - A label such as "Dr. Lee Lab" splits into extra sentences and breaks the two-sentence limit.
- **Recommendation:** strip `roomLabel` from the text before scanning, handle `n't`, normalise times, and count sentences after removing the label.

### F3. Medium, confirmed by reading: fallback text is shown as "AI-generated" (AC5)
- **File:** `src/components/ExplainPanel.tsx:63-65`.
- **Evidence:** the header "AI-generated explanation (mock model)" is shown for every result. For `source === "fallback"` the text is a fixed template, not model output. Invalid-input fallbacks also say "Model unavailable", which is misleading.
- **Verification:** choose mode `error` or `invalid` and click the button. The header still says "AI-generated".
- **Recommendation:** make the header conditional, for example "Standard explanation (not AI-generated)" when `source === "fallback"`. Use a different note for invalid input.

### F4. Medium, gap: no unavailable-key scenario (AC4)
- **Files:** `src/explain/adapters.ts` and the tests.
- **Evidence:** `MockMode` has `normal`, `slow`, `error` and `invalid` only, and no test covers a missing key. `explainAvailability` would handle a thrown error, but that is not demonstrated.
- **Recommendation:** add a `"no-key"` mock mode that throws a typed error. Add one test asserting the fallback.

### F5. Low, hypothesis: a stale explanation can flash after the decision changes
- **File:** `src/components/ExplainPanel.tsx:19-26`.
- **Evidence:** the reset runs in `useEffect`, after paint. For one frame the old explanation can appear beside a different `ResultPanel` decision.
- **Verification:** use `act` and a DOM test, or watch the screen while changing the end time after an explanation appears.
- **Recommendation:** store the `input` key alongside `result` and render only when they match. Alternatively use `key={reasonCode+start+end+roomLabel}` on `ExplainPanel`.

### F6. Low: demo controls shipped in the user-facing UI
- **File:** `src/components/ExplainPanel.tsx`, the mock-mode `<select>`.
- **Evidence:** an end user sees "error" and "invalid" options. `AGENTS.md` says to keep the existing UI and not add features. The feature itself is requested, but the dropdown is test scaffolding.
- **Recommendation:** gate it with `import.meta.env.DEV`, or remove it and test via the adapter.

### F7. Low, hypothesis: adapter edge cases in `explainAvailability`
- **File:** `src/explain/explainAvailability.ts`.
- **Evidence:**
  - If an adapter returns a non-Promise, `pending.catch` throws a `TypeError`. The result is still a fallback, but `error` gets a confusing message.
  - An adapter that rejects synchronously on abort could, depending on microtask order, win the race. The error would read "Aborted" instead of "timed out". With the current async mock the timeout wins, so the test is fine.
- **Recommendation:** wrap with `Promise.resolve(adapter.generate(...))`.

### F8. Low: test and documentation gaps
- No test asserts the `code` values `NO_ROOM`, `INVALID_RANGE` or `TOO_LONG`. `availability.test.ts` has no `code` assertions.
- There are no UI tests for AC5 labelling or for the stale-response guard.
- `README.md` (Architecture) and `AGENTS.md` (Structure, Constraints) don't mention `src/explain/`. `AGENTS.md` still says "Do not add features… no external services". Record the feature and the rule that a real adapter must be server-side and needs separate approval.
- The factory-style `createMockAdapter` sits close to the `AGENTS.md` "avoid Factory without need" rule. I judged it justified, because it selects behaviour by mode.

## What to run before accepting
Run `npx vitest run`, `npm run typecheck`, `npm run lint` and `npm run build`, then check AC6 at 375 px and desktop. Add the F1, F2 and F3 repro cases as regression tests.
