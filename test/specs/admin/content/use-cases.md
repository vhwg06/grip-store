# Content Use Cases

## UC-CONT-01 Admin Curates Media Library

- Status: route ownership removed. Shared media selection/upload remains as internal content tooling inside banners, articles, product editor, and other contextual flows.

- Goal: giữ một thư viện media có thể tái sử dụng an toàn trên nhiều bề mặt nội dung.
- Primary actor: `Admin / Content Operator`
- Trigger: admin cần upload, tìm, chọn, hoặc loại bỏ một asset.
- Preconditions:
  - media library tồn tại
- Success outcome:
  - asset mới được thêm vào library hoặc asset cũ được truy xuất đúng ngữ cảnh
- Business invariants:
  - asset đang được dùng không được biến mất khỏi các bề mặt đang tham chiếu
  - media library là nguồn dùng chung, không thuộc riêng banner hay article
- Postconditions:
  - admin có thể dùng asset cho banner, article, about, FAQ, product content
- Priority: `P2`

## UC-CONT-02 Admin Maintains Banner Presence

- Goal: quyết định banner nào đang đại diện cho một page context cụ thể.
- Primary actor: `Admin / Content Operator`
- Trigger: admin cần thêm, thay, bật, tắt, hoặc sắp xếp banner.
- Preconditions:
  - page context đã tồn tại về mặt nội dung hoặc storefront presence
- Success outcome:
  - active banner set phản ánh đúng thông điệp cần hiển thị cho page đó
- Business invariants:
  - banner là public-facing presence artifact
  - thứ tự banner mang meaning về ưu tiên hiển thị
  - page-level enable/disable belongs to banner management, not store settings
- Postconditions:
  - page context có banner behavior mới
- Priority: `P2`

## UC-CONT-03 Admin Publishes Editorial Articles

- Goal: Tạo, chỉnh sửa và xuất bản bài viết dưới dạng Markdown hoặc HTML trực quan.
- Primary actor: `Admin / Content Operator`
- Trigger: Admin bắt đầu soạn thảo hoặc chỉnh sửa bài viết.
- Preconditions:
  - Hệ thống cho phép soạn thảo bản nháp (Draft) hoặc xuất bản (Published).
- Success outcome:
  - Bài viết được lưu trữ và xuất bản thành công trên storefront.
- Business invariants:
  - Hỗ trợ cả 2 chế độ soạn thảo: **Visual (WYSIWYG)** dành cho người dùng không rành công nghệ, và **Markdown (Mã nguồn)**.
  - Hỗ trợ dán hình ảnh trực tiếp (`Ctrl+V`) vào vị trí con trỏ chuột trong cả hai chế độ soạn thảo để tự động upload lên Cloudflare R2 và chèn ảnh.
- Postconditions:
  - Storefront tự động nhận diện định dạng (HTML hoặc Markdown) và hiển thị chính xác bài viết.
- Priority: `P2`

## UC-CONT-04 Admin Maintains FAQ Knowledge

- Goal: giữ tập FAQ phản ánh đúng knowledge mà storefront cần trả lời công khai.
- Primary actor: `Admin / Content Operator`
- Trigger: admin cần thêm, sửa, bật/tắt, hoặc sắp xếp FAQ.
- Preconditions:
  - FAQ set tồn tại hoặc đang rỗng
- Success outcome:
  - FAQ set mới phản ánh đúng public knowledge state
- Business invariants:
  - FAQ order có nghĩa đối với cách người dùng tiếp cận thông tin
  - inactive FAQ không nên bị hiểu là public answer
- Postconditions:
  - public knowledge surface thay đổi
- Priority: `P2`

## UC-CONT-05 Admin Links Article to About Us Page

- Goal: gán một article làm nguồn sở hữu cho public About page ngay trong article flow.
- Primary actor: `Admin / Content Operator`
- Trigger: admin chọn hoặc bỏ chọn cờ "use this article as About" trong article editor.
- Preconditions:
  - article đang được tạo mới hoặc chỉnh sửa
- Success outcome:
  - public About page phản ánh đúng article hiện đang được chỉ định
- Business invariants:
  - chỉ một article có thể sở hữu About tại một thời điểm
  - chuyển ownership sang article khác phải tự động thu hồi owner cũ
  - xóa owner hiện tại phải làm public About mất assignment tương ứng
- Postconditions:
  - storefront About đọc từ article ownership, không đọc từ standalone About admin page
- Priority: `P2`

## UC-CONT-06 Admin Maintains Product Editorial Content

- Status: standalone route ownership removed. Product editorial/media is maintained from the product editor context; shared media components remain internal.

- Goal: làm giàu product detail bằng media và rich content mà không đổi commercial state.
- Primary actor: `Admin / Content Operator`
- Supporting actors: `Admin / Catalog Operator`
- Trigger: admin cần chỉnh intro/detail content hoặc gallery của một product.
- Preconditions:
  - product đã tồn tại
- Success outcome:
  - product có editorial context mới mà không làm lệch catalog ownership
- Business invariants:
  - editorial content không thay thế commercial catalog rules
  - product-linked content vẫn phải bám theo product identity
- Postconditions:
  - product public reading experience có content context mới
- Related domains: `product`
- Priority: `P2`

## UC-CONT-07 Admin Previews Article Content

- Goal: Xem trước bài viết (kể cả bản nháp Draft) trên giao diện mô phỏng storefront trước khi xuất bản.
- Primary actor: `Admin / Content Operator`
- Trigger: Admin bấm vào nút "Preview" của một bài viết trên trang quản lý hoặc chỉnh sửa bài viết.
- Preconditions:
  - Bài viết đang được soạn thảo hoặc hiển thị trong danh sách bài viết.
- Success outcome:
  - Mở một modal xem trước hiển thị đúng định dạng Markdown và giao diện storefront thực tế của bài viết.
- Business invariants:
  - Hiển thị đầy đủ tiêu đề, ảnh bìa, và nội dung bài viết.
  - Không thay đổi trạng thái xuất bản (Published/Draft) của bài viết khi xem trước.
- Postconditions:
  - Đóng modal xem trước để quay lại màn hình làm việc trước đó.
- Priority: `P2`
