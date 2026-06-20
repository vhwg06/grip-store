# Product Scenarios

## SC-PROD-01 Browse Catalog Then Open Product

- Context: admin cần xác định product nào cần chỉnh sửa.
- Main flow:
  1. Admin mở product catalog.
  2. Hệ thống trả danh sách product cùng commercial signals.
  3. Admin scan hoặc filter catalog.
  4. Admin mở product cụ thể.
- Alternate flows:
  - catalog trống và admin chuyển sang create flow
- Exception flows:
  - product record không còn hợp lệ khi admin mở
- End state:
  - admin vào đúng product context
- Surfaced business rules:
  - list là hành vi browse/triage của catalog operator

## SC-PROD-02 Create Product With Valid Commercial Meaning

- Context: admin cần thêm một sản phẩm mới.
- Main flow:
  1. Admin bắt đầu create flow.
  2. Admin cung cấp các thông tin thương mại cốt lõi.
  3. Hệ thống kiểm tra product có thể được hiểu như sellable catalog entity hay chưa.
  4. Product mới được tạo.
- Alternate flows:
  - product được tạo nhưng vẫn ở trạng thái chưa đủ điều kiện cho một số downstream behavior
- Exception flows:
  - identity hoặc commercial state bị coi là không hợp lệ
- End state:
  - product tồn tại như một thực thể mới trong catalog
- Surfaced business rules:
  - create flow là hành vi tạo entity thương mại, không chỉ là ghi field

## SC-PROD-03 Update Product State

- Context: admin cần đổi trạng thái thương mại của product hiện có.
- Main flow:
  1. Admin mở product detail.
  2. Admin thay đổi một hoặc nhiều yếu tố như visibility, stock, purchase limit, flags.
  3. Hệ thống đánh giá state mới có hợp lệ không.
  4. Product được cập nhật.
- Alternate flows:
  - admin chỉ cập nhật descriptive content mà không ảnh hưởng khả năng bán
- Exception flows:
  - state mới tạo ra mâu thuẫn thương mại và bị từ chối
- End state:
  - product ở commercial state mới hoặc giữ nguyên state cũ
- Surfaced business rules:
  - product state phải có nghĩa nhất quán về availability, presentation, và constraints

## SC-PROD-04 Rework Category Structure

- Context: admin cần tổ chức lại cấu trúc category.
- Main flow:
  1. Admin đọc category structure hiện tại.
  2. Admin thay đổi hierarchy hoặc ordering.
  3. Hệ thống xác nhận structure mới vẫn hợp lệ.
  4. Category tree được chấp nhận.
- Alternate flows:
  - admin chỉ đổi ordering trong cùng một cấp
- Exception flows:
  - hierarchy mới tạo ra cấu trúc không hợp lệ
- End state:
  - catalog có category structure mới
- Surfaced business rules:
  - category là structural behavior của catalog, không chỉ là label

## SC-PROD-05 Review Product Health Before Editing

- Given the catalog operator scans the current catalog
- When the system highlights low-stock, hidden, or missing-media products
- Then the operator can distinguish which product needs commercial editing and which needs editorial enrichment
- And the operator can hand off to the content domain when the problem is editorial rather than commercial
