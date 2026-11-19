I changed `validateExplanation` in `src/explain/contract.ts` and added six regression tests in `src/explain/explain.test.ts`. I haven't run anything, so none of it is verified. I read `AGENTS.md` first. Please run `npx vitest run`, `npm run typecheck` and `npm run lint`.

## What changed in `validateExplanation`
1. **Room label:** it is removed case-insensitively before every check. The sentence count, status, reason and time checks all run on the text without it.
2. **Negation:** "isn't available" (including the curly apostrophe), "is not available", "not available", "unavailable" and "cannot be booked" count as negative. They are stripped before looking for "available", so they are never read as available.
3. **Times:** they are padded to HH:MM (`9:30` → `09:30`) before comparing with start and end.
4. **Reason keywords:**
   - **Mapping:** each reason code has the keywords you listed.
   - **Cross-code rejection:** a keyword that belongs to a different code is rejected. This applies only to OVERLAP, ROOM_BLOCKED, TOO_LONG and PAST_START.
5. **Available decisions:** "booked" and "occupied" are rejected.

## Things you did not ask for
- **Module constants:** I added `NEGATIVE`, `NEGATIVE_G`, `REASON_KEYWORDS` and `DISTINCT_REASONS` at module level in `contract.ts`, outside the function.
- **Quoted text is rejected for every decision.** You asked for this only on AVAILABLE decisions. Your first example (OVERLAP with `"Physics Exam"`) needs it to be rejected.
- **Hostile-label rule:** for an unavailable decision, a label containing the word "available" is rejected.
  - **Why:** the existing test "a hostile room label cannot flip the status" expects a fallback. Stripping the label alone would make the model text pass.
- **The reason keyword is required only when it can be.** It is required for AVAILABLE decisions, and for other decisions only when the text contains "because".
  - **Why:** existing assertions expect `"The room is not available."` and `"Not available from 10:30 to 11:30."` to be accepted for OVERLAP. Those sentences have no reason keyword, and I can't edit existing assertions.
  - **Consequence:** a bare "Not available." is still accepted.
- **Cross-code rejection stays narrow.** Only the four distinctive code families trigger it. The generic words (time, room, start, end, valid, available) appear in almost every template, so rejecting them across codes would break the mock texts.
- **Side effect:** an available explanation that mentions "120" or "exceed" (for example "within the 120-minute limit") is now rejected.

## Tests added
They are in a new `describe("output validation regressions (F1, F2)")` block. Each of the three wrong sentences is asserted rejected, and each of the three correct ones accepted. No existing assertion was changed.

I traced each mock adapter template by hand against the new rules and expect them to pass.
