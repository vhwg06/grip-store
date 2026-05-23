# Grip Store Database Schema Summary

Source: [src/lib/db/schema.ts](/workspaces/grip-store/src/lib/db/schema.ts:1)

## `products`

- Primary key: `id`
- Core columns: `name`, `description`, `price`, `compare_at_price`, `category`, `image`
- Merchandising: `is_hot`, `is_active`, `is_shared`, `sort_order`
- Purchase control: `purchase_limit`, `purchase_warning`, `visibility_level`
- Inventory metrics: `stock_count`, `locked_count`, `sold_count`
- Review metrics: `rating`, `review_count`
- Audit: `created_at`

## `cards`

- Primary key: `id`
- Foreign key: `product_id -> products.id`
- Payload: `card_key`
- Lifecycle: `is_used`, `reserved_order_id`, `reserved_at`, `expires_at`, `used_at`
- Audit: `created_at`

## `orders`

- Primary key: `order_id`
- Product snapshot: `product_id`, `product_name`, `amount`, `quantity`
- Buyer data: `email`, `user_id`, `username`
- Payment and fulfillment: `status`, `trade_no`, `current_payment_id`, `paid_at`, `delivered_at`
- Delivery data: `card_key`, `card_ids`
- Pricing: `points_used`
- Audit: `created_at`

## `login_users`

- Primary key: `user_id`
- Identity: `username`, `email`
- Account state: `points`, `is_blocked`, `desktop_notifications_enabled`
- Activity: `created_at`, `last_login_at`, `last_checkin_at`, `consecutive_days`

## `daily_checkins_v2`

- Primary key: `id`
- Foreign key: `user_id -> login_users.user_id`
- Audit: `created_at`

## `settings`

- Primary key: `key`
- Value storage: `value`
- Audit: `updated_at`

## `reviews`

- Primary key: `id`
- Foreign key: `product_id -> products.id`
- Ownership: `order_id`, `user_id`, `username`
- Review fields: `rating`, `comment`
- Audit: `created_at`

## `categories`

- Primary key: `id`
- Display fields: `name`, `icon`, `sort_order`
- Audit: `created_at`, `updated_at`

## `refund_requests`

- Primary key: `id`
- Target: `order_id`
- Ownership: `user_id`, `username`
- Workflow: `reason`, `status`, `admin_username`, `admin_note`, `processed_at`
- Audit: `created_at`, `updated_at`

## `user_notifications`

- Primary key: `id`
- Foreign key: `user_id -> login_users.user_id`
- Translation payload: `type`, `title_key`, `content_key`, `data`
- State: `is_read`
- Audit: `created_at`

## `admin_messages`

- Primary key: `id`
- Routing: `target_type`, `target_value`
- Message body: `title`, `body`, `sender`
- Audit: `created_at`

## `user_messages`

- Primary key: `id`
- Foreign key: `user_id -> login_users.user_id`
- Message body: `username`, `title`, `body`, `is_read`
- Audit: `created_at`

## `broadcast_messages`

- Primary key: `id`
- Message body: `title`, `body`, `sender`
- Audit: `created_at`

## `broadcast_reads`

- Primary key: `id`
- Foreign keys:
  - `message_id -> broadcast_messages.id`
  - `user_id -> login_users.user_id`
- Audit: `created_at`

## `wishlist_items`

- Primary key: `id`
- Content: `title`, `description`
- Ownership: `user_id`, `username`
- Audit: `created_at`

## `wishlist_votes`

- Primary key: `id`
- Foreign keys:
  - `item_id -> wishlist_items.id`
  - `user_id -> login_users.user_id`
- Audit: `created_at`
