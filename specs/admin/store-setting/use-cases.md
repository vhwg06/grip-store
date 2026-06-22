# Store Setting Use Cases

## UC-SET-01 Admin Maintains Storefront Identity

- Goal: giữ cho storefront thể hiện đúng identity kinh doanh hiện tại.
- Primary actor: `Admin / Store Operator`
- Trigger: admin cần đổi brand identity hoặc public contact info.
- Preconditions:
  - storefront configuration tồn tại
- Success outcome:
  - storefront identity phản ánh đúng business identity mới
- Business invariants:
  - brand và contact là public business facts
  - identity changes phải được hiểu là thay đổi storefront behavior, không chỉ thay text
- Postconditions:
  - storefront read model mới có hiệu lực
- Priority: `P1`

## UC-SET-02 Admin Composes Homepage Surface

- Goal: quyết định storefront homepage đang ưu tiên giới thiệu nội dung gì.
- Primary actor: `Admin / Store Operator`
- Trigger: admin cần thay đổi block order, enablement, hoặc composition emphasis.
- Preconditions:
  - homepage composition domains đã tồn tại
- Success outcome:
  - homepage composition mới phản ánh đúng business priority
- Business invariants:
  - block order là publishing decision
  - enabled/disabled blocks thay đổi homepage presence semantics
  - homepage composition không được hiểu như arbitrary UI arrangement
- Postconditions:
  - homepage read model thay đổi
- Priority: `P1`

## UC-SET-03 Admin Controls Public Discovery And Visibility Rules

- Status: removed from the active `/admin/settings` scope in the simplification pass. Discovery, wishlist, check-in, no-index, and related legacy flags are no longer administered from this surface.

- Goal: điều chỉnh cách storefront được discover và cách một số capability xuất hiện công khai.
- Primary actor: `Admin / Store Operator`
- Trigger: admin cần thay đổi visibility/discovery-related flags.
- Preconditions:
  - store settings hiện tại có các flags tương ứng
- Success outcome:
  - discovery-facing behavior mới của storefront được xác lập
- Business invariants:
  - các flags như no-index, wishlist, checkin, refund reclaim cards đều mang behavioral meaning
  - visibility rules không phải display preference đơn thuần
- Postconditions:
  - storefront public behavior có thể thay đổi
- Priority: `P1`

## UC-SET-04 Admin Maintains Storefront Support And Footer Presence

- Goal: kiểm soát các điểm chạm hỗ trợ và navigation/public references trên storefront.
- Primary actor: `Admin / Store Operator`
- Trigger: admin cập nhật footer, social, hoặc floating support.
- Preconditions:
  - storefront có các support/contact touchpoints
- Success outcome:
  - support and footer presence phản ánh đúng operational/public expectations
- Business invariants:
  - support touchpoints là public operational commitments
  - footer structure là storefront information architecture concern
- Postconditions:
  - public support/navigation presence được cập nhật
- Priority: `P1`

## UC-SET-05 Admin Maintains Banner And About Presence Through Store Settings

- Status: replaced. Banner enablement now belongs to banner management. About ownership now belongs to article flow.

- Goal: kiểm soát các reference thuộc banner/about trong phạm vi storefront behavior.
- Primary actor: `Admin / Store Operator`
- Trigger: admin cần thay đổi cách banner/about xuất hiện như một phần của storefront configuration.
- Preconditions:
  - banner/about references đã tồn tại ở public surface
- Success outcome:
  - storefront phản ánh đúng presence rules của banner/about
- Business invariants:
  - ở entity này, banner/about được nhìn như storefront presence concern
  - article/FAQ governance không thuộc use case này
- Postconditions:
  - storefront presence logic mới có hiệu lực
- Priority: `P2`

## UC-SET-06 Admin Maintains Registry And Legacy Storefront Commitments

- Status: removed from the active `/admin/settings` scope in the simplification pass. Registry and legacy controls are no longer administered from this surface.

- Goal: giữ các storefront commitments cũ hoặc registry-related commitments ở trạng thái đúng với business policy hiện tại.
- Primary actor: `Admin / Store Operator`
- Trigger: admin thay đổi registry hoặc legacy-facing settings.
- Preconditions:
  - storefront đang có registry hoặc legacy commitments cần duy trì
- Success outcome:
  - storefront tiếp tục phản ánh đúng commitment policy hiện tại
- Business invariants:
  - registry/legacy flags là policy behavior, không phải metadata rời rạc
- Postconditions:
  - storefront commitment behavior thay đổi hoặc được xác nhận giữ nguyên
- Priority: `P2`
