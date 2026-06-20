# Noty Scenarios

## SC-NOTY-01 Check Readiness Then Send

- Context: admin muốn gửi một push notification ra website-facing surface.
- Main flow:
  1. Admin đọc current outbound readiness.
  2. Hệ thống cho thấy system đang sẵn sàng.
  3. Admin gửi outbound notification.
  4. Hệ thống chấp nhận send behavior.
- Alternate flows:
  - admin cập nhật readiness trước khi gửi
- Exception flows:
  - readiness không đủ nên send behavior bị chặn
- End state:
  - notification được send hoặc bị chặn trước khi send
- Surfaced business rules:
  - readiness là gate của outbound behavior

## SC-NOTY-02 Read Outbound List And History

- Context: admin cần biết outbound notifications đã diễn ra thế nào.
- Main flow:
  1. Admin mở notification list.
  2. Hệ thống trả outbound notifications.
  3. Admin mở history của một notification hoặc một send set.
  4. Hệ thống cho thấy outcome states.
- Alternate flows:
  - list có notification nhưng history của một item còn trống hoặc tối thiểu
- Exception flows:
  - send failure không có đủ trace
- End state:
  - admin hiểu outbound outcome và có thể quyết định bước tiếp theo
- Surfaced business rules:
  - list và history là hai góc nhìn khác nhau của cùng outbound domain
