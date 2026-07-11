# Store Setting Scenarios

## SC-SET-01 Change Storefront Contact Info

- Context: business muốn đổi thông tin liên hệ của cửa hàng.
- Main flow:
  1. Admin đọc current storefront contact info.
  2. Admin thay đổi contact facts.
  3. Hệ thống xác nhận contact info mới.
- Alternate flows:
  - None
- Exception flows:
  - contact data mới không hợp lệ
- End state:
  - storefront contact info mới được chấp nhận hoặc bị giữ nguyên
- Surfaced business rules:
  - contact update là thay đổi business presentation of the store

## SC-SET-02 Recompose Homepage Priorities

- Context: business muốn đổi trọng tâm của homepage.
- Main flow:
  1. Admin đọc current homepage composition.
  2. Admin đổi block priority hoặc bật/tắt một block.
  3. Hệ thống đánh giá composition mới.
  4. Homepage presence rules mới được chấp nhận.
- Alternate flows:
  - admin chỉ đổi ordering trong các block đang active
- Exception flows:
  - composition mới tạo ra ordering/uniqueness conflict
- End state:
  - homepage behavior thay đổi hoặc bị giữ nguyên
- Surfaced business rules:
  - homepage composition là behavior design của storefront, không chỉ là layout editing

## SC-SET-03 Toggle Discovery And Visibility Behavior

- Context: admin muốn thay đổi cách storefront được discover hoặc cách capability xuất hiện.
- Main flow:
  1. Admin chọn một visibility/discovery rule cần thay đổi.
  2. Hệ thống hiểu rule đó ảnh hưởng public behavior nào.
  3. Rule mới được chấp nhận.
- Alternate flows:
  - admin thay đổi nhiều related flags như một grouped decision
- Exception flows:
  - combination của rules mới tạo ra business conflict
- End state:
  - discovery/visibility behavior của storefront thay đổi
- Surfaced business rules:
  - visibility flags mang behavioral meaning, không phải cosmetic settings

## SC-SET-04 Change Registry Or Legacy Commitment Behavior

- Given the storefront still carries registry or legacy commitments
- When the store operator changes those commitment rules
- Then the storefront reflects the new policy commitment
- And related legacy behavior is either preserved intentionally or retired intentionally
