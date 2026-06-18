# Figma Review: Admin Order Operations

Status: PASS WITH GAPS for Phase 1 on 2026-06-18

Review basis:

- Figma file: `GRIP-Website Design`
- Page: `Admin CMS - Media Workflows`
- Reviewed frames:
  - `Admin / Orders` (`281:10025`)
  - `Admin / Refunds` (`281:10052`)
- `Admin / Order Detail` (`281:10349`)
- Review method: inspected live frame text/content, not inferred from spec

Screenshot evidence:

- [orders.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders.png)
- [orders-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders-updated.png)
- [orders-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/orders-stronger.png)
- [refunds.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds.png)
- [refunds-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds-updated.png)
- [refunds-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/refunds-stronger.png)
- [order-detail.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail.png)
- [order-detail-updated.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail-updated.png)
- [order-detail-stronger.png](/Users/cynus/Desktop/grip-store/tmp/figma-audit/order-detail-stronger.png)

Route verdict summary:

- `/admin/orders`: `Strong`
- `/admin/refunds`: `Strong`
- `/admin/orders/[id]`: `Strong`

## Evidence Observed In Figma

### Orders

- Title: `Order Management`
- Subtitle references payment, fulfillment, customer status, search
- Frame now shows concrete queue controls and row-state separation:
  - search field
  - status chips
  - explicit row cards
  - `Mark delivered` and `Open detail` CTAs
  - disabled-action language for unpaid rows
  - export scope note
  - loading banner
  - empty-result card
  - inline mutation-error note

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows scan/filter controls, row-to-detail handoff, allowed actions, blocked actions, export scope, and separate loading/empty/error surfaces without collapsing them into one summary block.

### Refunds

- Title: `Refund Requests`
- Subtitle references reclaim points, notes, approve/reject
- Frame names the moderation intent, but still reads as overview-level rather than a fully detailed decision flow

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows queue, evidence card, approve/reject controls, admin-note boundary, reclaim semantics, and error-state language in one decision surface.

### Order Detail

- Title: `Order Detail`
- Subtitle: `Inspect one order deeply: items, history, customer data, shipping, payment, and status actions.`
- Evidence present:
  - `Mark paid`
  - `Mark delivered`
  - `Cancel order`
  - `Update note`
  - timeline entries such as `created`, `payment verified`, `packing started`, `Awaiting pickup`
- This frame is materially more specific than the list-level screens

Verdict:

- Strong enough for route-level workflow coverage. The frame now shows blocked mutation state, note box with save boundary, timeline split, and route-safe fallback language around the detail surface.

## Use Case Coverage Check

- [x] Order detail separates read context from mutation actions at a high level
- [x] Timeline/status information is represented
- [x] Refunds are called out as a separate operator concern
- [x] Order list shows row UI, handoff, blocked actions, and list-state coverage
- [x] Refund approval/rejection safeguards and validation states are visible at route level
- [x] Detail screen shows blocked state, note handling, and route-safe fallback
- [x] Mutation and state boundaries are explicit enough at route level across list, detail, and refund flows

## Gate Result

Pass with gaps for Phase 1, no route-level blocker remains inside this module.

Reason:

- All three scoped routes now have route-specific workflow evidence in the frame itself.
- Residual gaps are polish-level density and implementation detail, not missing route-level workflow proof.

## Follow-up Constraints

- Backend owns allowed state transitions, refund eligibility, derived order/refund status, and timeline composition.
- Phase 2 tests must verify server-driven order/refund outcomes rather than FE-calculated state changes.
