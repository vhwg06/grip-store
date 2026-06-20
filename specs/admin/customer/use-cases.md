# Customer Use Cases

## UC-CUS-01 Admin Finds A Customer Record

- Goal: tìm đúng khách hàng cần hỗ trợ hoặc cần điều tra.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin cần tra cứu một khách hàng theo thông tin nhận diện hoặc dấu vết giao dịch.
- Preconditions:
  - customer records tồn tại trong hệ thống
- Success outcome:
  - admin xác định được đúng customer record
- Business invariants:
  - customer là commerce identity, không phải chỉ là account row
  - customer record vẫn hợp lệ dù chưa từng phát sinh order
- Postconditions:
  - admin có thể mở customer context sâu hơn
- Related domains: `order`, `refund`, `review`, `user`
- Priority: `P1`

## UC-CUS-02 Admin Reads Customer Profile Summary

- Goal: hiểu customer này là ai trong bối cảnh commerce của hệ thống.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin mở customer record cụ thể.
- Preconditions:
  - customer record đã được xác định
- Success outcome:
  - admin thấy được identity summary và các chỉ dấu commerce quan trọng
- Business invariants:
  - profile summary không cần đồng nghĩa với full account management
  - customer profile phải đủ để định hướng admin sang order/refund/review context
- Postconditions:
  - chưa thay đổi state nào
- Related domains: `order`, `refund`, `review`
- Priority: `P1`

## UC-CUS-03 Admin Reads Customer Commerce Context

- Goal: hiểu toàn bộ ngữ cảnh commerce của customer để hỗ trợ xử lý.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin cần biết lịch sử mua hàng, refund references, review references của customer.
- Preconditions:
  - customer đã được resolve
- Success outcome:
  - admin thấy được customer-linked order history và các liên kết domain liên quan
- Business invariants:
  - customer root chỉ điều hướng tới commerce artifacts, không sở hữu state machine của chúng
  - absence của một loại artifact không làm customer record mất hiệu lực
- Postconditions:
  - admin có thể chuyển sang domain cụ thể để xử lý tiếp
- Related domains: `order`, `refund`, `review`
- Priority: `P1`

## UC-CUS-04 Admin Distinguishes Customer From User Account

- Goal: tránh nhầm lẫn giữa commerce identity và account/system identity.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin nhìn thấy customer có hoặc không có linked user account.
- Preconditions:
  - có thể tồn tại liên kết customer-user
- Success outcome:
  - admin hiểu khi nào cần ở lại customer domain, khi nào cần chuyển sang user domain
- Business invariants:
  - customer và user có thể liên kết nhưng không đồng nhất
  - commerce history bám theo customer, không bám theo user management view
- Postconditions:
  - domain boundary được giữ rõ trong decision-making
- Related domains: `user`
- Priority: `P1`

## UC-CUS-05 Admin Reads A Customer With No Commerce History

- Goal: xác nhận một customer vẫn là customer hợp lệ ngay cả khi chưa có order, refund, hay review history.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin mở một customer record nhưng không thấy commerce artifacts đi kèm.
- Preconditions:
  - customer record đã được xác định
- Success outcome:
  - admin hiểu đây là empty commerce history hợp lệ, không phải record lỗi
- Business invariants:
  - customer root có thể tồn tại trước commerce activity
  - absence of commerce history không làm mất identity validity của customer
- Postconditions:
  - admin có thể dừng ở customer root hoặc chuyển sang user domain nếu concern thực tế là account-level
- Related domains: `user`
- Priority: `P1`
