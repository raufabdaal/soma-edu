
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2026-06-22 - [Refined Copy-to-Clipboard Feedback]
**Learning:** When adding micro-interactions like "Copy to Clipboard", implementing a robust feedback loop with timeout cleanup (via `useRef`) prevents potential memory leaks and ensures UI consistency even during rapid interactions or component unmounts.
**Action:** Always wrap `setTimeout` for UI feedback in a `useRef` and include a cleanup in `useEffect`.
