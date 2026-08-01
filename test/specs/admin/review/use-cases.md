# Review Use Cases

## UC-REV-01 Admin Reviews Moderation Queue

- Goal: xác định review nào cần moderation và review nào đã ở public-eligible state.
- Primary actor: `Admin / Moderator`
- Trigger: admin mở moderation queue.
- Preconditions:
  - reviews tồn tại hoặc queue trống hợp lệ
- Success outcome:
  - admin hiểu distribution của moderation states và chọn được review cần xử lý
- Business invariants:
  - queue phải phản ánh moderation state thật
  - queue stats phải có business meaning, không chỉ là counters trang trí
- Postconditions:
  - admin có thể mở review context chi tiết
- Related domains: `product`, `customer`, `order`
- Priority: `P2`

## UC-REV-02 Admin Moderates A Single Review

- Goal: đưa một review sang state phù hợp với business moderation policy.
- Primary actor: `Admin / Moderator`
- Trigger: admin chọn approve, hide, delete, hoặc feature cho một review.
- Preconditions:
  - review tồn tại
  - admin đã đọc đủ context
- Success outcome:
  - review chuyển sang moderation outcome phù hợp
- Business invariants:
  - approve, hide, delete, feature không đồng nghĩa nhau
  - moderation state mang hậu quả public visibility thực
- Postconditions:
  - review state được cập nhật hoặc giữ nguyên nếu decision bị từ chối
- Related domains: `product`, `customer`, `order`
- Priority: `P2`

## UC-REV-03 Admin Bulk Publishes Eligible Reviews

- Goal: xử lý nhiều review pending cùng lúc khi chúng cùng đủ điều kiện public.
- Primary actor: `Admin / Moderator`
- Trigger: admin chọn nhiều review và submit bulk publish.
- Preconditions:
  - có nhiều review ở state phù hợp cho bulk publish
- Success outcome:
  - tập review hợp lệ được chuyển sang public-eligible outcome
- Business invariants:
  - bulk action không được bỏ qua validation của từng review
  - invalid members không được âm thầm tạo inconsistent result
- Postconditions:
  - queue state thay đổi cho các review được chấp nhận
- Priority: `P2`

## UC-REV-04 Admin Reads Review Context Before Moderation

- Goal: hiểu product, customer, order, attachments liên quan trước khi quyết định moderation.
- Primary actor: `Admin / Moderator`
- Trigger: admin mở review context panel/detail.
- Preconditions:
  - review tồn tại
- Success outcome:
  - admin hiểu review đang nói về giao dịch nào và có bằng chứng gì
- Business invariants:
  - review context là bước bắt buộc để moderation có nghĩa
  - missing context phải được hiển thị như missing context, không được đoán
- Postconditions:
  - admin sẵn sàng ra quyết định moderation
- Related domains: `product`, `customer`, `order`
- Priority: `P2`

## UC-REV-05 Admin Removes A Review From The Moderation Surface

- Goal: loại bỏ một review khỏi moderation surface khi review đó không nên tiếp tục tồn tại như review artifact.
- Primary actor: `Admin / Moderator`
- Trigger: admin quyết định review cần bị xóa thay vì chỉ ẩn.
- Preconditions:
  - review tồn tại
  - admin đã đọc đủ context để biết hide là chưa đủ
- Success outcome:
  - review không còn tồn tại như moderation artifact đang xét
- Business invariants:
  - delete khác hide vì delete chấm dứt artifact hiện tại thay vì chỉ đổi public meaning
- Postconditions:
  - moderation queue thay đổi theo removal outcome
- Related domains: `product`, `customer`, `order`
- Priority: `P2`
