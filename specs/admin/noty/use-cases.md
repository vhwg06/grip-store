# Noty Use Cases

## UC-NOTY-01 Admin Maintains Outbound Notification Readiness

- Goal: giữ cho hệ thống sẵn sàng thực hiện outbound push notification.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin kiểm tra hoặc thay đổi outbound notification readiness.
- Preconditions:
  - notification channels/settings đã được khai báo ở mức domain này
- Success outcome:
  - hệ thống ở trạng thái sẵn sàng hoặc admin hiểu rõ vì sao chưa sẵn sàng
- Business invariants:
  - readiness khác với send history
  - channel readiness là precondition cho outbound behavior
- Postconditions:
  - admin có thể đi tiếp sang send behavior
- Priority: `P3`

## UC-NOTY-02 Admin Sends A Website Push Notification

- Goal: đưa một outbound notification lên website-facing surface.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin chủ động gửi một push notification.
- Preconditions:
  - notification readiness hợp lệ
- Success outcome:
  - notification được chấp nhận cho send behavior
- Business invariants:
  - outbound notification là publish/send behavior, không phải inbox mutation
  - send outcome phải có dấu vết trong notification history
- Postconditions:
  - notification xuất hiện trong list/history theo outcome phù hợp
- Priority: `P3`

## UC-NOTY-03 Admin Reads Notification List

- Goal: xem tập outbound notifications đã được tạo hoặc gửi.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin cần đọc list outbound notifications.
- Preconditions:
  - notification domain đã có records hoặc list trống hợp lệ
- Success outcome:
  - admin hiểu được những notification nào đang tồn tại trong outbound domain
- Business invariants:
  - list không đồng nghĩa history
  - notification list chỉ mô tả outbound artifacts
- Postconditions:
  - admin có thể mở history hoặc re-evaluate readiness
- Priority: `P3`

## UC-NOTY-04 Admin Reads Notification Send History

- Goal: hiểu outbound notification đã thành công hay thất bại như thế nào.
- Primary actor: `Admin / Support / Operations`
- Trigger: admin cần đọc history của send behavior.
- Preconditions:
  - đã có hoặc có thể chưa có send attempts
- Success outcome:
  - admin biết notification nào đã gửi, failed, hoặc chưa hoàn tất như mong đợi
- Business invariants:
  - failure phải để lại operational trace
  - history là hậu quả của outbound behavior, không phải cấu hình
- Postconditions:
  - admin có thêm dữ kiện để gửi lại hoặc chỉnh readiness
- Priority: `P3`
