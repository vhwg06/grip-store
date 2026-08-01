# Review Domain Model

## Core Objects

- `Review`
- `ReviewModerationState`
- `ReviewContext`
- `ReviewStats`

## Relationships

- `Review` references `productId`
- `Review` references `orderId`
- `Review` references `customerId`
- `Review` may include attachments

## State Notes

- visibility/public ordering do backend quyết định
- `FEATURED` là moderation/public projection state, không phải FE decoration
