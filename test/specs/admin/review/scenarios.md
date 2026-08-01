# Review Scenarios

## SC-REV-01 Queue Scan Then Context Read

- Context: admin cần chọn review cần moderation.
- Main flow:
  1. Admin mở moderation queue.
  2. Hệ thống trả review states và queue stats.
  3. Admin chọn một review cần đọc kỹ hơn.
  4. Context panel/detail hiển thị product, customer, order, attachments.
- Alternate flows:
  - admin dùng stats để ưu tiên một nhóm review cụ thể
- Exception flows:
  - review context bị thiếu một reference quan trọng
- End state:
  - admin có đủ bối cảnh để chọn action moderation
- Surfaced business rules:
  - queue là moderation entrypoint, context mới là nơi hiểu substance của review

## SC-REV-02 Approve A Review

- Given a moderator has enough review context to allow public visibility
- When the moderator approves the review
- Then the review becomes public-eligible content
- And the approval outcome is distinct from hide, feature, or delete

## SC-REV-03 Hide A Review

- Given a moderator has enough review context to remove public visibility
- When the moderator hides the review
- Then the review stops acting as public-visible feedback
- And the hide outcome is distinct from approve, feature, or delete

## SC-REV-04 Feature A Review

- Given a review is already suitable for public visibility
- When the moderator features the review
- Then the review gains elevated public prominence
- And the feature outcome does not replace the underlying moderation decision

## SC-REV-05 Bulk Publish A Review Set

- Context: admin muốn xử lý nhiều review pending cùng lúc.
- Main flow:
  1. Admin chọn một tập review.
  2. Hệ thống kiểm tra từng review có đủ điều kiện bulk publish không.
  3. Hệ thống áp dụng outcome cho các review hợp lệ.
- Alternate flows:
  - chỉ một phần selection là hợp lệ
- Exception flows:
  - selection không chứa review nào đủ điều kiện
- End state:
  - review set được cập nhật theo policy hợp lệ
- Surfaced business rules:
  - bulk publish là hành vi convenience, không phá individual moderation rules

## SC-REV-06 Remove A Review From The Moderation Surface

- Given a moderator determines a review should no longer remain as a review artifact
- When the moderator deletes the review
- Then the review disappears from the moderation surface
- And the outcome is not interpreted as the same behavior as hiding the review
