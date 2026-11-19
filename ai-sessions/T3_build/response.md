I added the optional explanation feature, but nothing has been run. I couldn't run commands, so the tests, typecheck, lint and build are still unchecked. Please run `npx vitest run`, `npm run typecheck`, `npm run lint` and `npm run build`. I haven't verified anything on desktop or at 375 px width either.

## Changed files
**Edited**
- `src/types.ts`: added `ReasonCode` and a `code: ReasonCode` field on both `Decision` variants.
- `src/availability.ts`: each return now carries its matching code. No condition, order or message text changed. The edits are the added `code` fields, plus two returns (INVALID_RANGE and ROOM_BLOCKED) that I split across lines for length.
- `src/App.tsx`: builds an `ExplainInput` from the decision and renders `<ExplainPanel>` under `ResultPanel` only when a decision exists. Times are normalised with `minutesToLabel`.

**New**
- `src/explain/contract.ts`: `ExplainInput`, the two limits, `validateExplainInput` and `validateExplanation`, as you specified. It also exports `REASON_CODES`. Input checks are defensive against wrong runtime types.
- `src/explain/prompt.ts`: `SYSTEM_INSTRUCTION` and `buildPrompt`. The user message is the input as JSON inside `<data>…</data>`.
- `src/explain/adapters.ts`: `LlmAdapter` and `createMockAdapter` with the four modes. It carries the comment that a real adapter must run server-side. No real adapter was added.
- `src/explain/explainAvailability.ts`: validates input first. It runs the call under an AbortController plus a race against the timeout, then validates the output. Any failure returns a fallback sentence chosen by reason code. It works on a copy of the input.
- `src/components/ExplainPanel.tsx`: the button, the "Generating explanation…" state, the labelled mock-behaviour select, the separate result box, and the fallback note. It clears the explanation and ignores in-flight results when the decision changes.
- `src/explain/explain.test.ts`: tests for every case you listed.

## Not asked for, or worth knowing
- **Rule conflict:** `AGENTS.md` says "do not add features" and "keep the existing UI". I followed your explicit contract over it, as the task said.
- **Slow-mode timeout:** the timeout also fires if an adapter ignores the abort signal. A late rejection is swallowed so it can't become an unhandled rejection.
- **Escaped `<` in the prompt:** I escape `<` as `\u003c` in the prompt JSON so a room label can't close the `<data>` tag.
- **Room label in the mock text:** the mock "normal" text includes the room label. A hostile label that says "available" is therefore rejected by validation and replaced with the fallback, and the status never changes. It is tested.
- **Blocked-room label false positive:** a room whose name contains the word "blocked" would also be rejected when the room is available.
- **No-room label:** if no room is selected, the app sends the label "No room selected", because empty labels are rejected.
- **Fallback sentences:** the fallbacks don't use the room label. For an unknown reason code, the fallback is "No explanation could be generated for this request."
- **Not touched:** `package.json`, existing test assertions and fixtures, and the existing UI texts.
