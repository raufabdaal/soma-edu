
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2025-05-15 - [Accessible Clipboard Feedback]
**Learning:** Providing immediate visual (icon swap) and auditory (aria-live) feedback for clipboard actions significantly improves the confidence of users, especially those using assistive technologies, that their action was successful.
**Action:** Always pair `navigator.clipboard` actions with a success state and an `aria-live` announcement.
