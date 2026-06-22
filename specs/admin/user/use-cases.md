# User Use Cases

## UC-USER-01 Admin Finds An Account

- Goal: xác định account nào cần được kiểm tra hoặc quản trị.
- Primary actor: `Admin / Support`
- Trigger: admin mở user management surface.
- Preconditions:
  - user accounts tồn tại hoặc list trống hợp lệ
- Success outcome:
  - admin xác định được account cần xem
- Business invariants:
  - user view là account/system view, không phải commerce root
- Postconditions:
  - admin có thể mở account info hoặc thực hiện management action
- Related domains: `customer`
- Priority: `P2`

## UC-USER-02 Admin Reads Account State

- Goal: hiểu account đang ở trạng thái nào trong hệ thống.
- Primary actor: `Admin / Support`
- Trigger: admin mở user info.
- Preconditions:
  - user account tồn tại
- Success outcome:
  - admin thấy được identity, last activity, blocked state
- Business invariants:
  - account state phải được diễn giải như system/account concern
  - account view không thay thế cho customer commerce context
- Postconditions:
  - admin sẵn sàng đưa ra account-level decision
- Priority: `P2`

## UC-USER-03 Admin Manages Account State

- Goal: thay đổi account state ở phạm vi admin được phép.
- Primary actor: `Admin / Support`
- Trigger: admin cần block/unblock hoặc xác nhận account-control posture.
- Preconditions:
  - account đang ở trạng thái có thể được quản trị
- Success outcome:
  - account state mới được chấp nhận
- Business invariants:
  - block state là account-level control
  - account mutation không được bị hiểu là chỉnh sửa commerce history
- Postconditions:
  - account state thay đổi hoặc bị giữ nguyên nếu không hợp lệ
- Priority: `P2`

## UC-USER-04 Admin Traverses From User To Customer Context

- Goal: khi concern chuyển từ account sang commerce, admin đi đúng sang customer root.
- Primary actor: `Admin / Support`
- Trigger: admin nhận ra vấn đề đang xem là commerce concern thay vì account concern.
- Preconditions:
  - linked customer context tồn tại hoặc có thể thiếu
- Success outcome:
  - admin rời user domain đúng lúc và sang customer domain khi cần
- Business invariants:
  - user-to-customer traversal là boundary handoff
  - không phải mọi user đều phải có customer root
- Postconditions:
  - admin ở đúng domain để xử lý tiếp
- Related domains: `customer`
- Priority: `P2`

## UC-USER-05 Admin Distinguishes Account Control From Commerce Support

- Goal: tránh dùng account-management actions để giải quyết commerce issues.
- Primary actor: `Admin / Support`
- Trigger: admin đang xem account nhưng concern thực tế phát sinh từ order/refund/review history.
- Preconditions:
  - account đã được xác định
- Success outcome:
  - admin chọn đúng domain kế tiếp thay vì cố xử lý commerce concern trong account view
- Business invariants:
  - account control và commerce support là hai behavior classes khác nhau
- Priority: `P2`
