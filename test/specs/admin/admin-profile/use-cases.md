# Admin Profile Use Cases

## UC-APRO-01 Admin Reads Own Profile Identity

- Goal: xác nhận current admin identity đang được trình bày đúng.
- Primary actor: `Admin / Current Operator`
- Trigger: admin mở self-profile surface.
- Preconditions:
  - current admin đã được xác thực
- Success outcome:
  - admin thấy được username, display name, email, role signals liên quan
- Business invariants:
  - self-profile là identity/trust surface, không phải user administration table
- Priority: `P3`

## UC-APRO-02 Admin Maintains Own Display Identity

- Goal: cập nhật cách current admin được nhận diện trong hệ thống vận hành.
- Primary actor: `Admin / Current Operator`
- Trigger: admin thay đổi display identity fields.
- Preconditions:
  - current admin profile đang truy cập được
- Success outcome:
  - display identity mới được chấp nhận cho current admin
- Business invariants:
  - self-identity change không đồng nghĩa với permission change
- Priority: `P3`

## UC-APRO-03 Admin Maintains Security Posture

- Goal: giữ current admin account ở trạng thái đáng tin cậy.
- Primary actor: `Admin / Current Operator`
- Trigger: admin xem password hygiene, 2FA, backup methods.
- Preconditions:
  - current admin profile tồn tại
- Success outcome:
  - admin biết account đang an toàn hay cần can thiệp
- Business invariants:
  - 2FA, backup contact, password change đều là security posture behaviors
- Priority: `P3`

## UC-APRO-04 Admin Reviews Recent Access Trust

- Goal: xác minh các phiên truy cập gần đây có còn đáng tin cậy không.
- Primary actor: `Admin / Current Operator`
- Trigger: admin đọc recent access log trong self-profile.
- Preconditions:
  - hệ thống có thể cung cấp recent access context
- Success outcome:
  - admin hiểu session/device nào là expected hoặc bất thường
- Business invariants:
  - recent access là trust signal, không phải simple activity decoration
- Priority: `P3`
