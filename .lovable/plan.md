## Goal
Make Ask Naman accurate, harder to break, and nicer to use — without changing the floating-bubble format.

## 1. Knowledge upgrade (biggest win)
Right now the system prompt is a thin bio. Replace it with a structured "Naman knowledge pack" derived from the actual site content so answers match what's on the page.

- Create `supabase/functions/ask-naman/knowledge.ts` exporting one long string with sections:
  - **Profile** — bio paragraph from About, education, CGPA, location, contact, links.
  - **Skills** — grouped Languages / Frameworks / Tools / Concepts.
  - **Experience** — all 5 cards (Arista Vault, Smart Eye, Yi Co-Chair, Talent Carve, Agaamin) with dates, location, and the exact bullets.
  - **Projects** — DriveSafe-IND, Winlytics, Smart Wildfire Robot with tech tags, metrics, and outcome (TechSparx 2nd place, 0.648 mAP, etc.).
  - **Achievements** — Runner-Up TechSparx, Yi Co-Chair, Google PM cert.
  - **Tone guide** — dry, witty, factual; never invent salary/availability; recommend resume/LinkedIn when unsure.
- Import it into `index.ts` and use as the system prompt.

## 2. Guardrails
- **Rate limit**: max 8 messages per session per 10 min (track in memory by `sessionId`; return 429 with a friendly message).
- **Input cap**: reject prompts >1000 chars with a clear error.
- **Refusal scope**: system prompt instructs the bot to decline questions unrelated to Naman / his work / hiring, and to redirect to email.
- **No PII echo**: never repeat phone numbers or addresses even if asked.

## 3. UX polish
- **Textarea** instead of `<input>`: auto-grow, Enter to send, Shift+Enter for newline.
- **Reset conversation** button in the header (trash icon) — clears `messages` and rotates `sessionId`.
- **Copy** button on each assistant bubble.
- **Stop** button while streaming (aborts via `AbortController`).
- **Error toast** via existing `sonner` when fetch fails or backend returns 429/402.
- **Persist** the open conversation in `sessionStorage` so accidental panel close doesn't wipe it.
- **Suggested follow-ups**: after each answer, show 2 quick chips ("Tell me about DriveSafe", "How can I contact him?"). Hardcoded list, rotates by topic keyword.

## 4. Identity / polish
- Replace the `Sparkles` icon on the launcher with the project's `Logo` N mark so the bot feels like Naman, not a generic AI widget.
- Header subtitle changes from "AI · may be wrong" to "Trained on Naman's portfolio · may be wrong".

## 5. Stats integration (already partly there)
- Make sure `chatbot_logs` continues to capture: prompt, response, session_id, message_count, UA, referrer. No schema change needed.
- Add `error` column (text, nullable) so failed calls show up in `/stats` instead of vanishing. One migration.

## Out of scope (ask before adding)
- Tool calling (e.g. "open my resume", "navigate to /work").
- Vector search / RAG — knowledge is small enough to fit in a system prompt.
- Multi-language support.
- Voice input/output.

## Technical notes
- Files touched: `src/components/AskNaman.tsx`, `supabase/functions/ask-naman/index.ts`, new `supabase/functions/ask-naman/knowledge.ts`, one migration for `chatbot_logs.error`.
- No new dependencies; uses existing `react-markdown`, `sonner`, `lucide-react`, Lovable AI Gateway.
- Rate limit is in-memory per edge instance — good enough for portfolio traffic; if abuse appears we move it to a DB table.

Want me to do all five sections, or pick a subset (e.g. just #1 knowledge + #3 UX)?
