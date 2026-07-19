# Design QA

## Reference and target

- Reference defect capture: `/tmp/codex-remote-attachments/019f728f-4260-71c3-b98c-5bfe2a1a4254/A3FA279B-9162-4B74-A68E-C22C94909756/1-写真1.jpg`
- Rendered implementation: `/tmp/new-era-mobile-web-closed.png`
- Composer-open state: `/tmp/new-era-mobile-web-composer-open.png`
- Side-by-side comparison: `/tmp/new-era-mobile-before-after.png`
- Viewport: `390 × 844`
- Route and state: `/web?slide=8`, WEB mode, branching slide

## Pass 1 findings

- P1: The branching panel inherited the desktop two-column slide grid, placing choices beyond the right edge on mobile.
- P1: The always-visible comment composer covered the stamp controls and reduced the usable presentation area.

## Corrections

- Changed the mobile WEB branching slide to a single-column layout and constrained the four choices to a responsive two-by-two grid.
- Removed inherited mobile positioning, sizing, and transforms from the branch panel so its full bounds remain inside the viewport.
- Replaced the persistent mobile composer with an accessible chat trigger that opens a dismissible bottom sheet.
- Kept the four stamp actions visible and separate from the chat trigger.

## Verification

- Document scroll width: `390px` at a `390px` viewport.
- Branch panel bounds after animation: `x=14px`, `right=376px`.
- All four choice buttons remain within `x=26px` and `right=364px`.
- Composer initial state: hidden, non-interactive, `aria-expanded=false`.
- Composer opened state: visible bottom sheet within `x=12px` and `right=378px`, `aria-expanded=true`.
- Close action restores the hidden state.
- Console errors: none.
- Visual fidelity retained: Japanese headline hierarchy, black/yellow palette, two-by-two choice rhythm, QR participation rail, slide counter, and stamp actions.

## Final result

passed
