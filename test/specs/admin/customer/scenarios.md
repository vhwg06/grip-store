# Customer Scenarios

## SC-CUS-01 Search And Open Customer Context

- Context: admin cần tìm một khách hàng để hỗ trợ.
- Main flow:
  1. Admin truy vấn customer list.
  2. Hệ thống trả về customer-centric records.
  3. Admin xác định đúng customer cần đọc.
  4. Admin mở customer context.
- Alternate flows:
  - nhiều record gần giống nhau và admin phải dùng commerce signals để phân biệt
- Exception flows:
  - không tìm thấy customer phù hợp
- End state:
  - admin vào đúng customer root hoặc xác nhận không có customer tương ứng
- Surfaced business rules:
  - customer lookup là lookup cho commerce identity

## SC-CUS-02 Read Customer Summary Then Traverse Commerce Links

- Context: admin đã tìm thấy customer.
- Main flow:
  1. Admin mở customer summary.
  2. Hệ thống hiển thị identity summary và commerce indicators.
  3. Admin chọn mở order history, refund references, hoặc review references.
  4. Hệ thống dẫn admin sang domain liên quan với cùng customer context.
- Alternate flows:
  - customer có order history nhưng chưa từng refund hoặc review
  - customer chỉ có profile summary mà chưa có commerce artifacts
- Exception flows:
  - một liên kết domain con không truy xuất được
- End state:
  - admin vẫn giữ được root understanding về customer dù một artifact cụ thể thiếu
- Surfaced business rules:
  - customer root là entrypoint của commerce understanding, không phải nơi xử lý tất cả hành vi

## SC-CUS-03 Customer With Linked User Account

- Context: customer có liên kết sang user account.
- Main flow:
  1. Admin đọc customer summary.
  2. Hệ thống cho thấy có linked user account.
  3. Admin quyết định ở lại customer domain để xử lý commerce concern hoặc sang user domain để xử lý account concern.
- Alternate flows:
  - customer không có user account nhưng vẫn là customer hợp lệ
- Exception flows:
  - linked user reference không truy cập được
- End state:
  - admin phân biệt đúng hai loại concern trước khi hành động
- Surfaced business rules:
  - customer != user
  - linked identity không làm thay đổi ownership của commerce history

## SC-CUS-04 Read A Customer With Empty Commerce History

- Given a customer record exists without orders, refunds, or reviews
- When the support operator opens that customer
- Then the operator reads an empty commerce history as a valid customer state
- And the operator does not treat the customer record as broken or incomplete

## SC-CUS-05 Handoff From Customer To User Domain

- Given the support operator starts from a commerce-root customer view
- When the actual next action is account control rather than commerce support
- Then the operator moves into the user domain
- And the customer record remains the commerce source of truth
