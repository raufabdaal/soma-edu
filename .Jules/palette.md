
## 2024-05-22 - [Accessible Interactive Question Blocks]
**Learning:** Standardizing interactive lesson questions as ARIA radiogroups with live regions for feedback ensures screen reader users can navigate and receive immediate confirmation of their answers.
**Action:** Use role="radiogroup" and role="radio" with aria-live="polite" for all multiple-choice components in the lesson player.

## 2026-06-28 - [Accessible Clipboard Feedback in Headless Environments]
**Learning:** When verifying clipboard functionality with Playwright in headless CI/sandbox environments, permissions for 'clipboard-read' and 'clipboard-write' must be explicitly granted in the browser context to avoid 'NotAllowedError'.
**Action:** Use `browser.new_context(permissions=['clipboard-read', 'clipboard-write'])` in Playwright verification scripts.
