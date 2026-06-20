# Store Setting Scenarios

## SC-SET-01 Change Storefront Identity

- Context: business cần đổi cách storefront tự giới thiệu với khách hàng.
- Main flow:
  1. Admin đọc current storefront identity.
  2. Admin thay đổi brand/contact facts.
  3. Hệ thống xác nhận storefront identity mới.
- Alternate flows:
  - admin chỉ đổi contact mà không đổi brand
- Exception flows:
  - identity data mới không đủ để trở thành public business fact
- End state:
  - storefront identity mới được chấp nhận hoặc bị giữ nguyên
- Surfaced business rules:
  - identity update là thay đổi business presentation of the store

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
