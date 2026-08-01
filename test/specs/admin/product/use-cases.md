# Catalog Base Use Cases

## UC-CAT-01 Maintain Category Classification

- Goal: tổ chức ProductModel theo classification có thể browse được.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin tạo, sửa, sắp xếp hoặc deactivate Category.
- Preconditions: admin có catalog permission.
- Success outcome: Category hợp lệ được dùng cho assignment mới hoặc được deactivate mà không phá model hiện hữu.
- Business invariants:
  - Category chỉ classification; không sở hữu attribute rules hay template.
  - Category inactive chặn assignment mới nhưng không unpublish, không chặn republish model đang tham chiếu.
  - Category không bị delete.
- Priority: `P1`.

## UC-ATTR-01 Maintain Product Attribute Definitions

- Goal: cung cấp vocabulary typed ổn định cho dữ liệu catalog.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin tạo, chỉnh metadata hoặc deactivate Attribute Definition/EnumValue.
- Preconditions: admin có catalog permission.
- Success outcome: definition hợp lệ để ProductModel dùng đúng value kind.
- Business invariants:
  - Scalar, Enum và Reference có field contract loại trừ nhau.
  - Unit chỉ thuộc Numeric Scalar và compatible unit family.
  - Definition đã được dùng chỉ đổi display name, description hoặc ordering; structural type là immutable.
  - Deactivation chặn usage mới, giữ dữ liệu/reference hiện hữu.
- Priority: `P1`.

## UC-ATTR-02 Maintain Material, Finish and Pack Masters

- Goal: quản lý master data được tham chiếu bằng Product Attribute.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin create/update/deactivate Material, Finish hoặc Pack.
- Preconditions: admin có catalog permission.
- Success outcome: master có thể được selected qua Reference attribute.
- Business invariants:
  - Material/Finish/Pack không có assignment path song song với ProductAttribute.
  - Finish giữ display metadata và swatch/media như master data.
  - Pack là source of truth cho selling unit, quantity và base unit.
  - Deactivation không tự deactivate Variant hiện hữu, không chặn selling/republish reference cũ.
- Priority: `P1`.

## UC-MODEL-01 Create and Define ProductModel

- Goal: tạo mẫu sản phẩm với identity, classification, content và attribute scope rõ ràng.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin tạo ProductModel.
- Preconditions: admin có catalog permission; catalog Big Bang reset đã hoàn tất.
- Success outcome: ProductModel Draft tồn tại để tiếp tục cấu hình.
- Business invariants:
  - mỗi Attribute Definition trong ProductModel thuộc exactly one scope: fixed, dimension, hoặc variant-specific.
  - Measurement là numeric attribute value có unit.
  - ProductModel không delete; chỉ lifecycle transition.
- Priority: `P1`.

## UC-MODEL-02 Maintain Media, Description and Warranty

- Goal: giữ model content đủ cho catalog publication.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin thêm/xóa/reorder images, đặt primary image, sửa description hoặc WarrantySummary.
- Preconditions: ProductModel tồn tại.
- Success outcome: content được lưu trong ProductModel context.
- Business invariants:
  - primary model image khác technical, dimension và Variant image.
  - Active model không được mất primary model image.
  - WarrantySummary chỉ có term và optional note; không có claim workflow.
- Priority: `P1`.

## UC-MODEL-03 Publish, Unpublish and Discontinue ProductModel

- Goal: kiểm soát public lifecycle qua một state machine.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin publish, unpublish hoặc discontinue ProductModel.
- Preconditions: ProductModel tồn tại và admin có permission.
- Success outcome: model ở state đích hợp lệ.
- Business invariants:
  - `Draft -> Active`, `Active -> Inactive`, `Inactive -> Active`; Discontinued terminal.
  - publish đòi name, Category, primary model image và ít nhất one sale-ready Variant.
  - Active model luôn giữ publish invariant sau mọi mutation; backend reject mutation phá invariant và không auto-unpublish.
- Priority: `P1`.

## UC-VAR-01 Configure Variant Dimensions and Values

- Goal: khai báo các option tạo identity Variant cho ProductModel.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin add/reorder dimensions hoặc add/update/deactivate selectable values.
- Preconditions: ProductModel tồn tại; definition không được dùng ở scope khác trong model.
- Success outcome: ProductModel có tập dimension hợp lệ để preview/generate Variant.
- Business invariants:
  - mỗi Variant chọn exactly one allowed value cho mọi dimension; optional dimension không support.
  - preview chỉ trình bày tổ hợp có thể tạo; generate chỉ tạo selected subset và không tự tạo toàn bộ Cartesian product.
  - ProductModel đã có Variant không add/remove/replace dimension; chỉ add selectable value.
  - inactive value không tạo Variant mới nhưng reference lịch sử vẫn giữ.
- Priority: `P1`.

## UC-VAR-02 Create and Maintain Variants

- Goal: tạo Variant hợp lệ từ selected combinations hoặc manual selection.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin preview/generate subset hoặc create one Variant.
- Preconditions: ProductModel và dimensions hợp lệ.
- Success outcome: Variant tồn tại với immutable option selection và optional technical attributes.
- Business invariants:
  - canonical combination unique trong phạm vi ProductModel.
  - selected value identity dùng typed canonical value/master ID, không display text hoặc order.
  - VariantAttributeValue chỉ cho definition model đã khai báo variant-specific.
  - Variant `Active <-> Inactive`, never delete; inactive Variant bị loại khỏi selectable options.
  - thay combination yêu cầu tạo Variant mới và inactivate Variant cũ.
- Priority: `P1`.

## UC-VAR-03 Maintain SKU, SellingPrice and Pack Reference

- Goal: làm Variant sale-ready với commercial data nhất quán.
- Primary actor: `Admin / Catalog Operator`.
- Trigger: admin assign SKU, set selling price hoặc set Pack reference.
- Preconditions: Variant tồn tại.
- Success outcome: Variant có thể đạt sale-ready state.
- Business invariants:
  - non-empty normalized SKU globally unique ngay lúc update và permanently reserved.
  - SellingPrice `amount > 0`, catalog currency, và set bulk atomic.
  - Pack reference là source of truth; Pack dimension tham gia identity, fixed Pack reference không tham gia identity.
  - SellingPrice luôn tính trên selling unit từ Pack reference; inactive Variant vẫn giữ SKU, price và history.
  - Active Variant chưa SKU/price vẫn hợp lệ nhưng không sale-ready.
- Priority: `P1`.

## UC-PUB-01 Browse and Resolve Public Catalog

- Goal: khách tìm ProductModel active và resolve Variant thực sự bán được.
- Primary actor: `Customer`.
- Trigger: customer browse, search, filter, xem detail, chọn options hoặc resolve Variant.
- Preconditions: publicly sellable catalog data tồn tại.
- Success outcome: customer chỉ thấy ProductModel Active và Variant publicly sellable.
- Business invariants:
  - filter chỉ theo Category, Material, Finish và SellingPrice trong phase này.
  - GetAvailableOptions trả option tương thích với at least one publicly sellable Variant.
  - ResolveVariant chỉ resolve exact canonical selected combination của ProductModel.
- Priority: `P1`.
