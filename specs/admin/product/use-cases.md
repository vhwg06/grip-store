# Product Use Cases

## UC-PROD-01 Admin Reviews Product Catalog

- Goal: hiểu catalog hiện tại để chọn sản phẩm cần tạo mới, chỉnh sửa, sắp xếp, hoặc kiểm tra.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin mở product catalog view.
- Preconditions:
  - product records tồn tại hoặc catalog đang trống
- Success outcome:
  - admin xác định được product nào cần tác động
- Business invariants:
  - list phải phản ánh trạng thái thương mại của product
  - quick actions không được mâu thuẫn với current product state
- Postconditions:
  - admin có thể mở product detail/editor hoặc category flow
- Related domains: `review`
- Priority: `P1`

## UC-PROD-02 Admin Creates A Product

- Goal: đưa một product mới vào catalog với business meaning đầy đủ.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin bắt đầu một product creation flow.
- Preconditions:
  - admin có quyền tạo product
  - product chưa tồn tại dưới identity thương mại đó
- Success outcome:
  - product mới được tạo ở trạng thái hợp lệ
- Business invariants:
  - product không chỉ là tập field, mà là một sellable catalog entity
  - required commercial meaning phải đầy đủ trước khi product được coi là usable
- Postconditions:
  - product mới trở thành một phần của catalog
- Related domains: `review`
- Priority: `P1`

## UC-PROD-03 Admin Updates Product Commercial State

- Goal: thay đổi nội dung hoặc trạng thái thương mại của product đang có.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin mở product detail để cập nhật.
- Preconditions:
  - product tồn tại
- Success outcome:
  - product phản ánh đúng commercial state mới
- Business invariants:
  - visibility, stock, purchase limit, warning, shared/hot/new/best-seller đều mang business meaning
  - admin không được tạo ra state mâu thuẫn giữa khả năng hiển thị và khả năng bán
- Postconditions:
  - product state mới trở thành base cho catalog behavior tiếp theo
- Related domains: `review`
- Priority: `P1`

## UC-PROD-04 Admin Maintains Category Structure

- Goal: giữ category tree đúng để catalog có cấu trúc thương mại rõ ràng.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin cần thêm, sửa, sắp xếp, hoặc đổi hierarchy của category.
- Preconditions:
  - category tree hiện tại có thể tồn tại hoặc trống
- Success outcome:
  - category structure mới vẫn hợp lệ về mặt nghiệp vụ
- Business invariants:
  - hierarchy không được tạo loop hoặc mâu thuẫn parent-child meaning
  - ordering của category có ý nghĩa browse/discovery
- Postconditions:
  - category tree cập nhật và products tiếp tục gắn được vào category hợp lệ
- Priority: `P1`

## UC-PROD-05 Admin Manages Product-Linked Cards

- Goal: quản lý card hoặc inventory-like artifact gắn với một product.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin đi vào product-linked card flow từ product context.
- Preconditions:
  - product đã tồn tại
- Success outcome:
  - product-linked cards phản ánh đúng context của product đó
- Business invariants:
  - card flow là secondary behavior phụ thuộc product root
  - card không được tách khỏi product context trong behavior interpretation
- Postconditions:
  - product có linked card context nhất quán hơn
- Priority: `P2`

## UC-PROD-06 Admin Reviews Product Health Signals

- Goal: nhận diện product nào đang cần chú ý vì thiếu media, low stock, hidden state, hoặc commercial inconsistency.
- Primary actor: `Admin / Catalog Operator`
- Trigger: admin scan catalog để tìm operational issues.
- Preconditions:
  - catalog có ít nhất một product hoặc empty state hợp lệ
- Success outcome:
  - admin nhận ra product nào cần mở để chỉnh sửa hoặc kiểm tra
- Business invariants:
  - health signals là operational interpretation của product state
  - hidden, low-stock, or missing-media products không đồng nghĩa cùng một problem class
- Postconditions:
  - admin chọn được next action phù hợp cho từng product
- Priority: `P1`
