
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2026-06-25 - [Copy to Clipboard Feedback Pattern]
**Learning:** Providing immediate visual feedback (e.g., swapping a copy icon for a checkmark) and updating ARIA labels for 2 seconds after a clipboard action significantly improves the perceived responsiveness and accessibility of the "Study Code" sharing process.
**Action:** Use a 2-second `copied` state with `useRef` for timeout management when implementing clipboard features.
