# Payment Collection Use Cases

## UC-PCOL-01 Admin Reads Collection Sources

- Goal: hiểu những nguồn nhận tiền nào đang được cấu hình cho doanh nghiệp.
- Primary actor: `Admin / Finance Operator`
- Trigger: admin mở payment collect surface.
- Preconditions:
  - collection sources đã tồn tại hoặc có trạng thái rỗng hợp lệ
- Success outcome:
  - admin biết source nào active, inactive, hoặc cần hoàn thiện
- Business invariants:
  - collection source là receive-money channel, không phải payment event
- Priority: `P3`

## UC-PCOL-02 Admin Maintains Payee Identity

- Goal: đảm bảo người nhận tiền và thông tin định danh nhận tiền là đúng.
- Primary actor: `Admin / Finance Operator`
- Trigger: admin cập nhật payee identity.
- Preconditions:
  - collection surface truy cập được
- Success outcome:
  - payee identity mới được chấp nhận
- Business invariants:
  - payee identity là business fact của receive-money setup
- Priority: `P3`

## UC-PCOL-03 Admin Maintains QR Or Transfer Collection Setup

- Goal: duy trì QR hoặc transfer instructions mà storefront/checkout có thể dựa vào.
- Primary actor: `Admin / Finance Operator`
- Trigger: admin thay đổi bank number, collection link, hoặc QR representation.
- Preconditions:
  - collection source đã được chọn
- Success outcome:
  - source collection mới trở thành cấu hình hợp lệ
- Business invariants:
  - invalid collection setup không được trở thành live receive-money instruction
- Priority: `P3`

## UC-PCOL-04 Admin Verifies Collection Readiness

- Goal: biết collection setup đã đủ sẵn sàng cho live use hay chưa.
- Primary actor: `Admin / Finance Operator`
- Trigger: admin đọc warning, preview, hay readiness signals.
- Preconditions:
  - collection configuration hiện tại có thể được đánh giá
- Success outcome:
  - admin hiểu source nào sẵn sàng và source nào cần sửa
- Business invariants:
  - readiness là business gate trước live use
- Priority: `P3`
