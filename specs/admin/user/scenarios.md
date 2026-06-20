# User Scenarios

## SC-USER-01 Search Then Read Account

- Context: admin cần xác định một account cụ thể.
- Main flow:
  1. Admin mở user management surface.
  2. Hệ thống trả paginated account list.
  3. Admin tìm và chọn một account.
  4. Hệ thống hiển thị account state.
- Alternate flows:
  - admin phải lọc/search nhiều lần trước khi ra đúng account
- Exception flows:
  - account không còn hợp lệ khi mở
- End state:
  - admin vào đúng account context
- Surfaced business rules:
  - account lookup phục vụ system/account management

## SC-USER-02 Change Account State

- Context: admin cần block/unblock hoặc đổi points.
- Main flow:
  1. Admin đọc current account state.
  2. Admin quyết định thay đổi account-level control.
  3. Hệ thống đánh giá action có hợp lệ không.
  4. Account state được cập nhật.
- Alternate flows:
  - admin quyết định không mutate sau khi đọc context
- Exception flows:
  - state change bị từ chối vì account đã đổi trước đó hoặc không còn phù hợp
- End state:
  - account state mới được chấp nhận hoặc state cũ được giữ nguyên
- Surfaced business rules:
  - account management là hành vi riêng với commerce handling

## SC-USER-03 Handoff To Customer Domain

- Context: admin nhận ra vấn đề thực tế nằm ở commerce history chứ không phải account state.
- Main flow:
  1. Admin đọc account.
  2. Hệ thống cho thấy linked customer context nếu có.
  3. Admin chuyển sang customer root để tiếp tục xử lý.
- Alternate flows:
  - account không có linked customer và admin dừng ở user domain
- Exception flows:
  - customer link tồn tại nhưng không truy cập được
- End state:
  - admin đứng ở domain phù hợp với concern đang xử lý
- Surfaced business rules:
  - user domain không được nuốt luôn customer domain

## SC-USER-04 Keep Commerce Support Out Of Account Control

- Given the admin is looking at an account-level issue
- When the actual question turns out to be about order, refund, or review history
- Then the admin moves into the customer-led commerce context
- And the admin does not misuse account controls as a substitute for commerce support
