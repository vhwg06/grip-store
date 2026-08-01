# Admin Profile Domain Model

## Core Objects

- `AdminProfile`
- `DisplayIdentity`
- `SecurityPosture`
- `RecentAccessRecord`

## State Concepts

- 2FA `enabled` vs `disabled`
- session `trusted` vs `needs review`

## Derived Meanings

- recent access is an operational trust signal
- self-profile changes affect the current operator's identity surface only
