
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2024-05-23 - [Micro-feedback for Clipboard Actions]
**Learning:** Adding a short-lived (e.g., 2s) visual feedback state, such as toggling an icon from 'copy' to 'check', provides immediate and intuitive confirmation for clipboard actions without the need for intrusive toasts or persistent UI changes.
**Action:** Implement icon-toggle feedback for all copy-to-clipboard interactions to enhance perceived responsiveness.
