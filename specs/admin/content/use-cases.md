# Content Use Cases

## UC-CONT-01 Admin Curates Media Library

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
- Postconditions:
  - page context có banner behavior mới
- Related domains: `store-setting`
- Priority: `P2`

## UC-CONT-03 Admin Publishes Editorial Articles

- Goal: tạo, chỉnh, và xuất bản bài viết như một knowledge/public content stream.
- Primary actor: `Admin / Content Operator`
- Trigger: admin bắt đầu article compose hoặc article revision.
- Preconditions:
  - article domain đang cho phép draft hoặc published entries
- Success outcome:
  - article trở thành draft hợp lệ hoặc published content hợp lệ
- Business invariants:
  - draft và published là hai business outcomes khác nhau
  - article publication không đồng nghĩa với simple save
- Postconditions:
  - article xuất hiện hoặc không xuất hiện trên public surface theo publication state
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

## UC-CONT-05 Admin Maintains About Narrative

- Goal: giữ phần About như company narrative chính thức của storefront.
- Primary actor: `Admin / Content Operator`
- Trigger: admin cập nhật company introduction hoặc gallery narrative.
- Preconditions:
  - about page tồn tại về mặt content identity
- Success outcome:
  - about narrative phản ánh đúng business story hiện tại
- Business invariants:
  - about narrative khác banner presence
  - gallery là một phần của narrative, không chỉ là attachment bucket
- Postconditions:
  - public about surface có narrative mới
- Priority: `P2`

## UC-CONT-06 Admin Maintains Product Editorial Content

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
