# Payment Use Cases

## UC-PAY-01 Admin Reads Payment Info In Order Context

- Goal: hiểu payment-related facts cần thiết khi xử lý một order.
- Primary actor: `Admin / Operations`
- Trigger: admin mở order detail cần đọc payment context.
- Preconditions:
  - order tồn tại
  - payment facts của order có thể được truy xuất đầy đủ hoặc partial
- Success outcome:
  - admin hiểu payment method và payment signals liên quan tới order đó
- Business invariants:
  - payment info ở domain này là operational fact, không phải execution engine
  - absence của một payment detail không được làm order context vô nghĩa
- Postconditions:
  - admin có thêm ngữ cảnh để xử lý order
- Related domains: `order`
- Priority: `P3`

## UC-PAY-02 Admin Reads Payment Context For Refund Decision

- Goal: dùng payment facts để hỗ trợ giải thích refund request.
- Primary actor: `Admin / Operations`
- Trigger: admin mở refund evidence cần payment context.
- Preconditions:
  - refund request tồn tại
- Success outcome:
  - admin hiểu payment signals nào liên quan tới refund decision
- Business invariants:
  - payment context ở đây phục vụ interpretation của refund, không tự quyết refund outcome
- Postconditions:
  - admin có thêm căn cứ để approve hoặc reject refund
- Related domains: `refund`, `order`
- Priority: `P3`

## UC-PAY-03 Admin Distinguishes Payment Information From Payment Execution

- Goal: giữ rõ boundary giữa payment knowledge cần đọc và payment engine behavior.
- Primary actor: `Admin / Operations`
- Trigger: admin cần giải thích payment context trong một operational flow.
- Preconditions:
  - payment information đã được đưa vào order/refund context
- Success outcome:
  - admin dùng payment signals đúng như contextual facts, không hiểu nhầm thành execution control surface
- Business invariants:
  - domain này không sở hữu callback/retry/create payment behavior
- Postconditions:
  - payment domain được giữ ở đúng mức informational/operational context
- Priority: `P3`
