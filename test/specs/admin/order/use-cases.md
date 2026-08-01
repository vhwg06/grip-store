# Order Use Cases

## UC-ORD-01 Admin Reviews Order Queue

- Goal: xác định order nào cần được xử lý tiếp và order nào chỉ cần theo dõi.
- Primary actor: `Admin / Operations`
- Supporting actors: `Customer`
- Trigger: admin mở order queue để xử lý vận hành trong ngày.
- Preconditions:
  - order đã tồn tại trong hệ thống
  - admin có quyền xem order operations
- Success outcome:
  - admin hiểu được trạng thái hiện tại của từng order
  - admin xác định được order nào cần mở detail
- Business invariants:
  - order queue là projection của server state, không phải kết quả FE tự suy diễn
  - action availability phải phản ánh business state hiện tại của order
  - queue phải cho phép phân biệt order bình thường với order có refund context hoặc trạng thái chặn
- Postconditions:
  - không thay đổi order state
  - admin có thể chuyển sang order detail hoặc customer purchase history
- Related domains: `customer`, `refund`, `payment`
- Priority: `P1`

## UC-ORD-02 Admin Examines Order Detail Before Acting

- Goal: đọc đầy đủ ngữ cảnh của một order trước khi ra quyết định vận hành.
- Primary actor: `Admin / Operations`
- Supporting actors: `Customer`
- Trigger: admin mở một order cụ thể từ queue hoặc từ customer purchase history.
- Preconditions:
  - order tồn tại
  - admin có thể truy cập detail của order đó
- Success outcome:
  - admin thấy được summary, items, shipping, payment info, timeline, note context
  - admin hiểu action nào được phép hoặc bị chặn
- Business invariants:
  - order detail là nguồn ngữ cảnh đầy đủ để ra quyết định, không chỉ là bản sao của list row
  - timeline phải thể hiện business progression của order
  - thông tin payment ở entity này chỉ là operational context
- Postconditions:
  - order state chưa đổi nếu admin chưa submit action
  - order có thể dẫn sang refund context hoặc customer context
- Related domains: `customer`, `refund`, `payment`
- Priority: `P1`

## UC-ORD-03 Admin Performs An Allowed Order Transition

- Goal: thay đổi order từ trạng thái hiện tại sang trạng thái vận hành kế tiếp hợp lệ.
- Primary actor: `Admin / Operations`
- Trigger: admin chọn một action hợp lệ từ order detail hoặc list.
- Preconditions:
  - order đang ở trạng thái cho phép action đó
  - admin đã đọc đủ ngữ cảnh để quyết định
- Success outcome:
  - order chuyển sang state mới hợp lệ
  - timeline và derived outputs phản ánh đúng transition vừa xảy ra
- Business invariants:
  - không phải mọi action đều hợp lệ trên mọi state
  - action hợp lệ phải được quyết định bởi order lifecycle rules
  - failed transition không được tạo ra partial state
- Postconditions:
  - order state thay đổi hoặc bị giữ nguyên nếu backend từ chối
  - history của order phải vẫn đọc được theo trình tự nghiệp vụ
- Related domains: `refund`, `payment`
- Priority: `P1`

## UC-ORD-04 Admin Reads Purchase History For A Customer

- Goal: hiểu lịch sử mua hàng của một customer để hỗ trợ xử lý order hiện tại hoặc ra quyết định hỗ trợ.
- Primary actor: `Admin / Operations`
- Supporting actors: `Customer`
- Trigger: admin truy cập purchase history từ customer context hoặc order detail.
- Preconditions:
  - customer đã được nhận diện
  - customer có hoặc không có order history
- Success outcome:
  - admin thấy được tập order gắn với cùng customer
  - admin hiểu current order nằm ở đâu trong bối cảnh lịch sử mua hàng
- Business invariants:
  - purchase history là behavior thuộc order domain, không thuộc ownership của customer root
  - absence of history vẫn là kết quả hợp lệ
  - purchase history không tự thay đổi order states
- Postconditions:
  - không đổi state nào
  - admin có thêm ngữ cảnh để quay lại order detail hoặc customer root
- Related domains: `customer`
- Priority: `P1`

## UC-ORD-05 Admin Verifies Refund Relevance On An Order

- Goal: biết order có đang hoặc đã đi qua refund flow hay không trước khi tiếp tục xử lý order.
- Primary actor: `Admin / Operations`
- Trigger: admin cần quyết định action trên một order có refund context.
- Preconditions:
  - order tồn tại
  - refund signals của order có thể được truy xuất
- Success outcome:
  - admin biết order đang không có refund, đang chờ refund decision, hay đã bị ảnh hưởng bởi refund outcome
- Business invariants:
  - refund context có thể chặn hoặc thay đổi cách diễn giải order actions
  - refund awareness trong order domain không đồng nghĩa order domain sở hữu refund decision
- Postconditions:
  - admin được dẫn tiếp sang refund context nếu cần
- Related domains: `refund`, `payment`
- Priority: `P2`

## UC-ORD-06 Admin Reads An Order Even When Operational Data Is Incomplete

- Goal: vẫn hiểu được order enough to act safely khi một phần dữ liệu phụ trợ không đầy đủ.
- Primary actor: `Admin / Operations`
- Trigger: admin mở một order có missing optional context.
- Preconditions:
  - order record vẫn tồn tại
- Success outcome:
  - admin vẫn hiểu được operationally relevant facts của order
- Business invariants:
  - missing optional context không được làm hỏng khả năng đọc order
  - incomplete context có thể chặn một số quyết định nhưng không được làm order vô nghĩa
- Postconditions:
  - admin tiếp tục đọc, tạm dừng, hoặc chuyển sang domain khác tùy mức thiếu context
- Priority: `P2`
