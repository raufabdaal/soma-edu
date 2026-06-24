
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2024-06-24 - [Study Code Copy Accessibility]
**Learning:** Providing an explicit "Copy" button for unique identifiers (like study codes) significantly improves UX by removing manual selection friction. Combining this with a 2-second visual feedback state (checkmark) and proper ARIA labels ensures the interaction is both satisfying and accessible.
**Action:** Always include transient visual feedback and aria-label when implementing "copy to clipboard" interactions. Use useRef to manage feedback timers for reliable cleanup.
