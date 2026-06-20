# Order Scenarios

## SC-ORD-01 Scan Queue And Open Detail

- Context: admin cần xác định order nào cần xử lý ngay.
- Main flow:
  1. Admin mở order queue.
  2. Hệ thống trả về tập order cùng trạng thái và tín hiệu hành động.
  3. Admin scan queue để xác định order cần chú ý.
  4. Admin mở detail của một order.
- Alternate flows:
  - queue có filter/search context và admin thu hẹp tập order cần xem
  - queue có order bị chặn action, admin chỉ dùng row đó như contextual signal
- Exception flows:
  - order id không còn hợp lệ khi admin mở detail
  - queue không trả được dữ liệu nhất quán
- End state:
  - admin vào order detail với đủ bối cảnh để đọc sâu hơn
- Surfaced business rules:
  - queue là nơi ưu tiên xử lý, không phải nơi quyết định lifecycle cuối cùng
  - row state phải đủ để dẫn admin tới đúng quyết định tiếp theo

## SC-ORD-02 Read Order Detail Before Deciding

- Given an operations admin opens a specific order
- When the system presents summary, timeline, customer context, and payment context
- Then the admin understands which operational decisions are available
- And the admin can defer action until the order context is clear enough

## SC-ORD-03 Execute A Valid Order Transition

- Given an order is in a state that allows a specific action
- When the operations admin performs that allowed action
- Then the order moves to the next valid lifecycle state
- And the order timeline reflects that transition without creating a partial state

## SC-ORD-04 Read Customer Purchase History From An Order

- Context: admin cần hiểu order hiện tại trong bối cảnh lịch sử mua hàng của customer.
- Main flow:
  1. Từ order detail, admin mở purchase history của customer liên quan.
  2. Hệ thống resolve cùng một `customerId`.
  3. Hệ thống trả về các order trước đó của customer.
  4. Admin so sánh current order với purchase history để ra quyết định hỗ trợ.
- Alternate flows:
  - customer có ít order và current order gần như là first purchase
  - customer có nhiều order, admin chỉ cần nhìn high-level pattern
- Exception flows:
  - customer mapping không resolve được
  - order history trống
- End state:
  - admin có bối cảnh lịch sử nhưng không thay đổi order state nào
- Surfaced business rules:
  - purchase history là read behavior hỗ trợ decision-making
  - lịch sử mua hàng là một projection của order domain qua customer identity

## SC-ORD-05 Order With Refund Context

- Context: admin đang xử lý một order có refund relevance.
- Main flow:
  1. Admin mở order detail.
  2. Hệ thống chỉ ra order có refund context.
  3. Admin hiểu rằng một số order actions có thể không còn phù hợp.
  4. Admin chuyển sang refund context để đọc decision state nếu cần.
- Alternate flows:
  - refund context chỉ là historical, admin vẫn có thể tiếp tục đọc order như bình thường
- Exception flows:
  - refund state không rõ ràng hoặc conflict với order state hiện tại
- End state:
  - admin biết khi nào phải rời order flow để sang refund flow
- Surfaced business rules:
  - refund không được ẩn khỏi order context
  - order domain phải biết sự tồn tại của refund nhưng không tự quyết refund outcome

## SC-ORD-06 Read Order With Missing Optional Context

- Given an order still exists but some optional context is missing
- When the operations admin reads the order
- Then the admin can still understand the order's operationally relevant facts
- But the admin may defer decisions that require the missing context
