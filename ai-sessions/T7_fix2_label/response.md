I changed only `src/components/ExplainPanel.tsx`. I read `AGENTS.md` first and followed it. I haven't run tests, typecheck, lint or build, so none of this is verified.

**What changed**
- **Result box:** it now has `data-source={result.source}`, which is `"model"` or `"fallback"`.
- **Heading:**
  - `model` keeps "AI-generated explanation (mock model) — not a booking confirmation".
  - `fallback` shows "Standard explanation (not AI-generated) — not a booking confirmation".
- **Note:** for `fallback`, the old fixed note is replaced by a new `fallbackNote(result.error)` helper in the same file. The helper matches the exact strings from `explainAvailability.ts` by prefix:

| `result.error` starts with | Note |
|---|---|
| `Model timed out` | The model did not answer in time. |
| `Invalid model output:` | The model's answer was rejected by validation. |
| `Invalid input:` | The request could not be sent to the model. |
| anything else, or no error | The model is unavailable. |

- **Unchanged:** colours, layout and classes, and no other file.

**Things you didn't ask for**
- The `fallbackNote` helper is a small addition to the file. I added it instead of nesting conditionals in the JSX.
- Matching is by prefix on the current error strings, so changing those strings in `explainAvailability.ts` would send the note to the default "The model is unavailable."
- A model that throws its own error, such as the `error` mock mode, gets the default note.
- I didn't add tests. `AGENTS.md` asks for focused regression tests, and you limited this change to one file. The `data-source` attribute is there so a test can use it.

Before this change is accepted, `AGENTS.md` requires `npx vitest run`, `npm run typecheck`, `npm run lint` and `npm run build` to pass. It also requires a manual AC6 check at desktop width and 375 px.
