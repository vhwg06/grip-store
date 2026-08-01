# Payment Collection Domain Model

## Core Objects

- `CollectionSource`
- `PayeeIdentity`
- `CollectionInstruction`
- `CollectionReadiness`

## State Concepts

- source `active` vs `inactive`
- source `ready` vs `needs correction`

## Derived Meanings

- a ready source is eligible to be used as a live receive-money instruction
