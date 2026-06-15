
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2025-05-15 - [Study Code Copy Feedback]
**Learning:** Providing immediate visual feedback (e.g., icon toggle to checkmark) after copying sensitive or important codes to the clipboard significantly reduces user uncertainty during onboarding and account linking processes.
**Action:** Always implement a 2-second visual feedback state (e.g., icon change or "Copied!" tooltip) for all "Copy to Clipboard" interactions.
