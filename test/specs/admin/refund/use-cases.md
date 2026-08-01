# Refund Use Cases

## UC-REF-01 Admin Reviews Refund Queue

- Goal: xác định refund request nào cần xử lý và request nào chỉ cần theo dõi.
- Primary actor: `Admin / Operations`
- Trigger: admin mở refund queue.
- Preconditions:
  - có refund requests hoặc queue trống hợp lệ
- Success outcome:
  - admin hiểu request nào đang chờ decision
- Business invariants:
  - refund queue là một operational decision surface
  - request đã có decision không được bị hiểu như request còn pending
- Postconditions:
  - admin có thể mở refund evidence
- Related domains: `order`, `customer`, `payment`
- Priority: `P2`

## UC-REF-02 Admin Reads Refund Evidence Before Deciding

- Goal: đọc đủ dữ kiện cần thiết trước khi approve hoặc reject.
- Primary actor: `Admin / Operations`
- Trigger: admin mở một refund request cụ thể.
- Preconditions:
  - refund request tồn tại
- Success outcome:
  - admin hiểu order linkage, customer linkage, evidence, previous notes, payment context nếu có
- Business invariants:
  - refund decision không được ra chỉ từ queue row
  - evidence review là bước nghiệp vụ bắt buộc trước decision
- Postconditions:
  - admin sẵn sàng approve hoặc reject
- Related domains: `order`, `customer`, `payment`
- Priority: `P2`

## UC-REF-03 Admin Approves A Refund

- Goal: chấp nhận refund request khi dữ kiện hỗ trợ cho refund outcome đó.
- Primary actor: `Admin / Operations`
- Trigger: admin xác nhận approve.
- Preconditions:
  - refund request đang ở trạng thái có thể approve
  - admin đã đọc đủ evidence
- Success outcome:
  - refund chuyển sang approved outcome
  - linked order context phản ánh được refund decision
- Business invariants:
  - approved refund là decision domain outcome, không chỉ là status label
  - duplicate approve không được tạo extra transition
- Postconditions:
  - refund không còn ở trạng thái chờ decision
- Related domains: `order`, `payment`
- Priority: `P2`

## UC-REF-04 Admin Rejects A Refund

- Goal: từ chối refund request khi dữ kiện không đủ hoặc không phù hợp.
- Primary actor: `Admin / Operations`
- Trigger: admin xác nhận reject.
- Preconditions:
  - refund request đang ở trạng thái có thể reject
  - admin đã đọc đủ evidence
- Success outcome:
  - refund chuyển sang rejected outcome
- Business invariants:
  - reject phải kết thúc pending decision state
  - rejected refund vẫn phải để lại decision history
- Postconditions:
  - refund không còn ở trạng thái chờ decision
- Related domains: `order`, `payment`
- Priority: `P2`

## UC-REF-05 Admin Reviews A Refund That Is Already Decided

- Goal: hiểu historical refund outcome trước khi xử lý downstream operational questions.
- Primary actor: `Admin / Operations`
- Trigger: admin mở một refund request đã không còn pending.
- Preconditions:
  - refund request tồn tại
- Success outcome:
  - admin hiểu request đã được approve hay reject và tại sao
- Business invariants:
  - decided refunds vẫn là operational evidence
  - historical decision không được đọc như pending work
- Postconditions:
  - admin dùng historical outcome để giải thích order/customer context
- Priority: `P2`
