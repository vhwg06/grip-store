# Refund Scenarios

## SC-REF-01 Read Queue Then Open Evidence

- Context: admin cần chọn refund request để xử lý.
- Main flow:
  1. Admin mở refund queue.
  2. Hệ thống trả pending requests và contextual states.
  3. Admin chọn một request.
  4. Hệ thống mở evidence/context của request đó.
- Alternate flows:
  - queue trống và admin xác nhận không có request cần xử lý
- Exception flows:
  - request không còn khả dụng khi admin mở
- End state:
  - admin vào refund context cụ thể hoặc kết thúc phiên review
- Surfaced business rules:
  - queue là triage surface, evidence là decision surface

## SC-REF-02 Approve After Evidence Review

- Context: evidence hỗ trợ cho refund outcome tích cực.
- Main flow:
  1. Admin đọc order linkage, customer context, payment evidence, prior notes.
  2. Admin kết luận refund nên được approve.
  3. Admin xác nhận decision.
  4. Hệ thống chuyển refund sang approved state.
  5. Linked order context được cập nhật tương ứng.
- Alternate flows:
  - admin bổ sung note decision trước khi approve
- Exception flows:
  - refund không còn ở pending state khi approve được gửi
- End state:
  - refund trở thành request đã được chấp thuận
- Surfaced business rules:
  - approve là một domain decision có hậu quả downstream

## SC-REF-03 Reject After Evidence Review

- Context: evidence không hỗ trợ cho refund outcome tích cực.
- Main flow:
  1. Admin đọc đầy đủ context.
  2. Admin quyết định refund không nên được approve.
  3. Admin xác nhận reject.
  4. Hệ thống chuyển refund sang rejected state và lưu decision context.
- Alternate flows:
  - admin chưa đủ chắc chắn và tạm dừng thay vì ra quyết định
- Exception flows:
  - request đã có final decision trước đó
- End state:
  - refund có final rejected outcome
- Surfaced business rules:
  - reject là final decision outcome cho current request lifecycle

## SC-REF-04 Read A Historical Refund Decision

- Given a refund request already has a final outcome
- When the operations admin opens that refund record
- Then the admin reads it as historical operational evidence
- And the admin does not treat it as pending decision work
