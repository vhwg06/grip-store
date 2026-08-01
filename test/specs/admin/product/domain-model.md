# Catalog Base Domain Model

## Core Objects

- `Category`
- `ProductAttributeDefinition`
- `EnumValue`
- `Material`
- `Finish`
- `Pack`
- `ProductModel`
- `ProductModelAttributeValue`
- `VariantDimension`
- `VariantSelectedOptionValue`
- `VariantAttributeValue`
- `Variant`
- `SellingPrice`
- `WarrantySummary`
- `ProductImage`

## Attribute Type System

| Field | Valid values | Meaning |
|---|---|---|
| `valueKind` | `Scalar`, `Enum`, `Reference` | Cách một attribute mang giá trị. |
| `dataType` | `Text`, `Number`, `Boolean` | Bắt buộc chỉ khi `valueKind = Scalar`. |
| `referenceTarget` | `Material`, `Finish`, `Pack` | Bắt buộc chỉ khi `valueKind = Reference`. |
| `unitFamily` | domain-defined | Chỉ hợp lệ với `Scalar/Number`. |
| `unit` | domain-defined | Phải thuộc `unitFamily`; được canonicalize trước khi dùng làm identity. |

Không cho phép tổ hợp vô nghĩa như `Reference + Number` hoặc `MaterialReference + unit`.

Display name, description và ordering là display metadata có thể cập nhật. Chúng không thay đổi semantic type của definition.

## Attribute Scopes

Mỗi `ProductAttributeDefinition` được khai báo đúng một scope trong một `ProductModel`:

| Scope | Object | Meaning |
|---|---|---|
| Fixed model value | `ProductModelAttributeValue` | Giá trị chung, Variant kế thừa khi projection. |
| Variant dimension | `VariantDimension` | Tập value khách chọn; tạo combination identity. |
| Variant-specific technical value | `VariantAttributeValue` | Thông số riêng Variant, không tạo identity. |

Một Variant chỉ được lưu `VariantAttributeValue` cho definition mà ProductModel đã khai báo là variant-specific. `Measurement` là `Scalar/Number` có unit, không phải entity riêng.

## Canonical Variant Combination

Combination unique trong phạm vi một `ProductModel` dựa trên toàn bộ Variant dimensions:

| Attribute kind | Canonical value |
|---|---|
| Scalar Text | Unicode NFC, trim outer whitespace, collapse internal whitespace, case-fold |
| Scalar Number | normalized number trong canonical unit của unit family |
| Scalar Boolean | `true` hoặc `false` |
| Enum | `EnumValueId` |
| Reference | `MaterialId`, `FinishId` hoặc `PackId` |

Không dùng display text, thứ tự dimension hay thứ tự selected values. Mỗi Variant chọn đúng một allowed value cho mỗi VariantDimension; optional dimension không thuộc phase này.

## Lifecycle and Integrity

- Category, Attribute Definition, EnumValue, Material, Finish và Pack được deactivate, không delete.
- Deactivation chỉ chặn assignment hoặc combination mới; existing ProductModels/Variants vẫn hiển thị, bán và republish được với reference cũ.
- Definition đã được dùng không đổi `valueKind`, `dataType`, `referenceTarget` hay `unitFamily`; chỉ sửa display name, description hoặc ordering.
- ProductModel: `Draft`, `Active`, `Inactive`, `Discontinued`; `Discontinued` terminal.
- Variant: `Active` hoặc `Inactive`; không delete, selected option values immutable. Đổi combination yêu cầu tạo Variant mới rồi inactive Variant cũ.
- ProductModel có Variant thì không được add, remove hoặc replace VariantDimension. Có thể add selectable value; inactive value không tạo Variant mới.

## Commercial Data

- SKU optional khi cấu hình. Sau trim, empty là absent; non-empty SKU được case-fold và unique toàn catalog ngay khi assign/update.
- SKU của Variant Inactive hoặc ProductModel Discontinued vẫn permanently reserved.
- `SellingPrice = Money(amount, currency)`; `amount > 0` và currency bằng configured catalog currency. Variant Inactive vẫn giữ SKU, SellingPrice và historic data.
- Pack luôn là reference tới Pack master. Pack dimension là selected option; Pack không phải dimension là fixed Variant Pack reference. Pack master là source of truth cho selling unit, quantity và base unit.
- SellingPrice luôn là giá trên selling unit được Pack reference xác định.
- `WarrantySummary` nằm tại ProductModel: term bắt buộc khi set và optional note.

## Publication Projection

- Publish đòi name, Category, primary model image và ít nhất một sale-ready Variant.
- Sale-ready Variant: Active, SKU hợp lệ, SellingPrice hợp lệ.
- Publicly sellable Variant: sale-ready Variant và ProductModel Active.
- Active ProductModel phải luôn giữ publish invariant; mutation phá invariant bị reject, không auto-unpublish.
- Primary model image khác technical, dimension và Variant image; mỗi ProductModel có tối đa một primary model image.
