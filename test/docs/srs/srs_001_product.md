**Big-bang rewrite toàn bộ Catalog & Product theo Domain và Specification mới. Không kế thừa semantic, contract, schema, API, UI hoặc test của luồng cũ.**

Code cũ chỉ được đọc để xác định **phạm vi cần xóa**, không được dùng làm source of truth hay constraint cho thiết kế mới.

# Step 1 — Greenfield Domain & Specification

````md
---
name: catalog-product-greenfield-spec
description: Design and finalize a new Catalog & Product domain and feature specification from first principles, replacing all existing Catalog Base and Legacy Product behavior without migration or compatibility.
---

# Catalog & Product — Greenfield Domain and Specification

## Context

Hệ thống hiện có nhiều implementation Catalog/Product:

- Legacy flat Product.
- Catalog Base.
- Các API, schema, UI và test được xây theo những semantic khác nhau.

Toàn bộ các implementation này được coi là legacy.

Task này là một **big-bang rewrite**.

Không tiếp tục, mở rộng, merge hoặc refactor luồng hiện tại.

Không lấy `catalogbase`, Legacy Product, OpenAPI hiện tại, database schema hiện tại hoặc Figma hiện tại làm nền thiết kế.

---

## 1. Mục tiêu

Thiết kế lại toàn bộ Catalog & Product từ đầu, bao gồm:

- Domain model.
- Aggregate boundaries.
- Business invariants.
- Lifecycle.
- Feature behavior.
- Error contracts.
- Acceptance scenarios.
- Public catalog semantics.
- Administration semantics.

Output của bước này sẽ trở thành source of truth mới cho:

```text
Domain
→ Database
→ OpenAPI
→ Backend
→ Frontend
→ BDD/API/E2E tests
````

Không implementation trong bước này.

---

## 2. Source of Truth

Thứ tự duy nhất:

```text
Approved business requirements
→ Approved product discovery decisions
→ New Domain design
→ New Feature Specification
```

Không dùng làm source of truth:

```text
Existing Catalog Base code
Existing Legacy Product code
Existing database schema
Existing OpenAPI
Existing UI/Figma
Existing tests
Existing production behavior
```

Các artifact cũ chỉ được audit để:

* xác định những gì phải xóa;
* phát hiện consumer liên quan;
* lập removal plan cho bước triển khai sau.

Chúng không được ảnh hưởng đến thiết kế mới.

---

## 3. Rewrite policy

Không thực hiện:

```text
Migration dữ liệu
Backfill
Mapping legacy Product sang ProductModel
Mapping Catalog Base sang model mới
Dual-read
Dual-write
Compatibility API
Legacy adapter
Fallback
Deprecation bridge
Schema conversion
Behavior preservation
```

Khi triển khai:

```text
Delete old flow
Drop old schema
Create new schema
Expose new API
Build new frontend
Replace old tests
```

Dữ liệu Catalog/Product cũ không được bảo toàn.

---

## 4. Domain direction

Thiết kế Domain mới theo semantic:

```text
Catalog
├── Category
├── AttributeDefinition
│   └── AttributeOption[]
├── MasterData
└── ProductModel
    ├── FixedAttributeValues
    ├── ProductMedia[]
    ├── VariantDimension[]
    ├── Variant[]
    └── DefaultVariant
```

Derived behavior:

```text
VariantIdentity
SaleReadiness
PublishReadiness
CombinationPreview
PublicProductProjection
```

Semantic bắt buộc:

```text
ProductModel = sản phẩm được khách hàng nhìn thấy
Variant      = đơn vị bán thực tế
SKU          = commercial identity của Variant
```

Không tồn tại flat Product.

---

## 5. Domain capabilities phải được thiết kế

### Catalog classification

* Category hierarchy.
* Ordering.
* Activation/deactivation.
* Category chỉ classification.
* Category không sở hữu Attribute schema.
* Không Product Template.
* Không Category Template.

### Attribute schema

Attribute Definition phải hỗ trợ:

```text
Text
Number
Boolean
Enum
MasterReference
```

Enum phải dùng stable option:

```text
code
label
position
swatch
active
```

Không dùng raw string array làm identity.

### Master Data

Scope ban đầu:

```text
Material
Finish
Pack
```

Master Data chỉ chứa shared reference values.

### ProductModel

Phải thiết kế rõ:

```text
name
slug
description
category
fixed attributes
fixed pack
measurements
warranty summary
media
variant dimensions
variants
default variant
lifecycle
```

Lifecycle tối thiểu:

```text
Draft → Active → Discontinued
```

Mỗi transition là business command, không phải generic status patch.

### Attribute scopes

Mỗi Attribute Definition chỉ được dùng tại một scope trên cùng ProductModel:

```text
Fixed Attribute
Variant Dimension
Variant Technical Value
```

Scope conflict là Domain error.

### Variant Dimension

Phải có:

```text
definition
position
allowed values
```

Display order không được ảnh hưởng Variant identity.

### Variant

Phải có:

```text
SKU
selected options
technical values
current selling price
currency
pack
status
canonical identity
media assignment
```

Variant phải chọn đủ đúng tập Dimension của ProductModel.

### Canonical identity

Backend tự tính canonical combination.

Client không cung cấp canonical value làm source of truth.

Identity phải ổn định trước các thay đổi:

* label;
* display order;
* casing;
* whitespace;
* measurement representation.

Enum dùng option code.

Master reference dùng stable identity.

Number quy đổi về canonical unit.

### Default Variant

ProductModel phải có Variant mặc định để storefront không tự đoán:

* option ban đầu;
* giá mặc định;
* media mặc định;
* SKU mặc định.

### Product và Variant media

Media thuộc ProductModel.

Media có thể được assign cho nhiều Variant cùng ProductModel.

ProductModel có primary media chung.

Variant có thể có primary media riêng.

Không có Variant media thì fallback về Product media.

### Readiness

Phải thiết kế:

```text
Variant sale readiness
Product publish readiness
```

Readiness là derived state, không phải percentage persisted.

Mỗi issue phải có stable code và target rõ ràng.

---

## 6. Product discovery additions phải được hấp thụ

Thiết kế mới phải chủ động xem xét và chốt các pattern sau:

### Từ Shopify

* Product-centric administration workspace.
* Inline Variant operations.
* Bulk Variant operations.
* Variant-specific media.
* Friendly operator terminology.

### Từ Akeneo

* Phân biệt common attributes và Variant attributes.
* Stable Attribute Option identity.
* Continuous readiness/completeness feedback.
* Reusable catalog configuration.

### Từ commercetools

* ProductModel và sellable Variant phân biệt rõ.
* Default/master Variant.
* Combination uniqueness.
* Task-oriented lifecycle operations.
* Storefront projection rõ ràng.

### Từ Adobe Commerce

* Tách Dimension configuration khỏi Variant generation.
* Preview combinations trước khi persist.
* Cho phép generate một phần Cartesian product.
* Bulk apply common values sau khi generate.

Không copy:

```text
Product Type
Family
Family Variant
Attribute Set
Multi-level Product Model
Full staged/current publishing engine
Inventory inside Catalog
Pricing rule engine
```

---

## 7. Feature Specification phải được viết từ đầu

Không sửa hoặc merge spec cũ.

Tạo một specification mới hoàn toàn.

Cấu trúc bắt buộc:

```text
1. Purpose
2. Scope
3. Terminology
4. Actors
5. Domain model
6. Aggregate boundaries
7. Entity semantics
8. Value objects
9. Attribute scopes
10. Product lifecycle
11. Variant lifecycle
12. Canonical Variant identity
13. Variant generation
14. Combination limit policy
15. Media behavior
16. Default Variant behavior
17. Sale readiness
18. Publish readiness
19. Catalog administration
20. Product administration
21. Public Catalog behavior
22. Concurrency guarantees
23. Error contracts
24. Acceptance scenarios
25. Non-goals
```

Không dùng wording, ID hoặc scenario cũ nếu chúng mang semantic legacy.

---

## 8. Feature set bắt buộc

### Catalog configuration

* Manage Category.
* Manage Attribute Definition.
* Manage Attribute Option.
* Manage Material.
* Manage Finish.
* Manage Pack.
* Activate/deactivate without breaking historical references.

### Product administration

* Create Draft ProductModel.
* Update ProductModel information.
* Assign fixed attributes.
* Configure Variant Dimensions.
* Preview combinations.
* Generate selected Variants.
* Create individual Variant.
* Configure SKU, price, currency, pack and status.
* Select Default Variant.
* Manage Product and Variant media.
* Preview storefront projection.
* Evaluate publish readiness.
* Publish ProductModel.
* Discontinue ProductModel.

### Variant operations

* Bulk set price.
* Bulk set status.
* Bulk set pack.
* Bulk assign media.
* Partial batch result with explicit success/failure semantics.

### Public Catalog

* List Active ProductModels.
* Get ProductModel detail.
* Render ordered Dimensions and Options.
* Resolve Variant from selected options.
* Use Default Variant as initial projection.
* Return current selling information.
* Switch media based on Variant selection.

Inventory availability is outside this Domain.

---

## 9. Variant generation behavior

Tách thành ba use case:

```text
PreviewVariantCombinations
GenerateVariants
CreateVariant
```

### Preview

* Không persist.
* Tính Cartesian product.
* Trả existing/new/excluded combinations.
* Trả canonical preview.
* Trả warning hoặc limit violation.

### Generate

* Chỉ persist combinations được chọn.
* Không bắt buộc tạo toàn bộ Cartesian product.
* Retry phải idempotent.
* Existing combination không làm fail cả batch.
* Mỗi Variant vẫn được validate độc lập.

### Manual create

* Tạo một Variant cụ thể.
* Trùng canonical identity trả Domain error.

---

## 10. Combination policy

Thiết kế configurable policy:

```text
warning threshold
hard limit
maximum persisted Variants
```

Spec phải phân biệt:

* số Cartesian combinations;
* số combinations được chọn;
* số Variants đã persist.

Không lấy giới hạn của product khác làm mặc định mà không có quyết định business.

---

## 11. Error contracts

Định nghĩa error code mới từ Domain mới.

Tối thiểu:

```text
CATEGORY_NOT_FOUND
CATEGORY_INACTIVE

ATTRIBUTE_DEFINITION_NOT_FOUND
ATTRIBUTE_DEFINITION_INACTIVE
ATTRIBUTE_DEFINITION_SEMANTIC_IMMUTABLE
ATTRIBUTE_OPTION_NOT_FOUND
ATTRIBUTE_OPTION_INACTIVE
ATTRIBUTE_OPTION_IN_USE
ATTRIBUTE_SCOPE_CONFLICT

MASTER_NOT_FOUND
MASTER_INACTIVE
MASTER_KIND_MISMATCH

PRODUCT_MODEL_NOT_FOUND
PRODUCT_MODEL_NOT_DRAFT
PRODUCT_MODEL_NOT_ACTIVE
INVALID_PRODUCT_LIFECYCLE_TRANSITION
PRODUCT_SLUG_ALREADY_EXISTS

VARIANT_DIMENSION_DUPLICATED
VARIANT_DIMENSION_LOCKED
INVALID_DIMENSION_VALUE
MISSING_DIMENSION_VALUE
UNEXPECTED_DIMENSION_VALUE

SKU_ALREADY_EXISTS
DUPLICATE_VARIANT_COMBINATION
VARIANT_NOT_SALE_READY
DEFAULT_VARIANT_REQUIRED
DEFAULT_VARIANT_NOT_SALE_READY

MISSING_PRIMARY_MEDIA
INVALID_VARIANT_MEDIA_ASSIGNMENT

VARIANT_COMBINATION_LIMIT_EXCEEDED
PRODUCT_NOT_PUBLISHABLE
STALE_PRODUCT_MODEL
```

Không map từ error code legacy.

---

## 12. Acceptance scenarios

Acceptance scenarios phải được viết mới từ business journey.

Ưu tiên:

```text
P1 — Manage Catalog configuration
P1 — Create Draft ProductModel
P1 — Configure fixed attributes
P1 — Configure Variant Dimensions
P1 — Preview Variant combinations
P1 — Generate selected Variants
P1 — Configure sale-ready Variant
P1 — Configure Default Variant
P1 — Manage Product and Variant media
P1 — Publish ProductModel
P1 — Public Product detail and Variant resolution

P2 — Bulk Variant operations
P2 — Admin storefront preview
P2 — Discontinue ProductModel

P3 — Reordering and operational enhancements
```

Scenario không được dựa trên endpoint hoặc screen hiện tại.

---

## 13. Audit legacy artifacts

Agent vẫn phải đọc code/spec/API/UI cũ, nhưng chỉ sau khi Domain và Spec mới đã được draft độc lập.

Mục đích audit:

```text
Identify files to delete
Identify routes to remove
Identify tables to drop
Identify consumers that will break
Identify test suites to replace
Identify unrelated modules referencing legacy Product
```

Không tạo capability matrix kiểu:

```text
Current behavior → preserve or adapt
```

Chỉ tạo:

```text
Legacy artifact → removal impact
```

Ví dụ:

| Legacy artifact        | Current consumers | Required action            |
| ---------------------- | ----------------- | -------------------------- |
| `products` table       | cart, review      | Drop and rewrite consumers |
| legacy `/products` API | storefront        | Remove and replace         |
| `catalogbase` schema   | admin FE          | Drop and replace           |
| legacy product tests   | CI                | Delete and replace         |

---

## 14. Non-goals

Không thực hiện trong Step 1:

```text
Database design chi tiết
OpenAPI design
Backend implementation
Frontend implementation
Figma
Migration
Data preservation
Compatibility
Test implementation
```

Step 1 chỉ chốt Domain và Feature Specification mới.

---

## 15. Expected output

Agent phải trả:

1. New Domain model.
2. Aggregate and ownership decisions.
3. Domain invariants.
4. Lifecycle contracts.
5. Feature Specification mới hoàn toàn.
6. Stable error contracts.
7. Acceptance scenario set.
8. Traceability từ business requirement đến scenario.
9. Open decisions cần phê duyệt.
10. Legacy removal impact report.

Không trả:

```text
Spec delta
Compatibility plan
Migration plan
Mapping plan
Reuse plan
Existing API gap analysis
```

---

## 16. Completion criteria

Step 1 chỉ hoàn thành khi:

* Có một Domain Catalog & Product mới hoàn toàn.
* Không có semantic Legacy Product.
* Không có dependency vào Catalog Base hiện tại.
* Không có behavior được giữ chỉ vì code hiện tại đã implement.
* Discovery additions đã được chốt thành Domain hoặc Feature behavior cụ thể.
* Tất cả invariant có acceptance scenario.
* Mọi điểm chưa quyết định được liệt kê để review.
* Legacy artifacts chỉ xuất hiện trong removal impact report.
* Chưa có thay đổi code, API, DB, UI hoặc test.

---

## Final rule

> Thiết kế hệ thống mà team sẽ xây nếu hôm nay chưa tồn tại bất kỳ Catalog hoặc Product implementation nào. Sau khi Domain và Spec mới được duyệt, xóa toàn bộ implementation cũ và xây lại theo specification mới.

````

Chốt lại bản chất:

```text
Không phải:
Catalog Base + bổ sung discovery + bỏ Legacy Product

Mà là:
Business requirements + discovery
→ Domain mới
→ Spec mới
→ xóa cả Catalog Base lẫn Legacy Product
→ xây lại toàn bộ
````

`catalogbase` hiện tại cũng là legacy trong scope này, không phải canonical foundation.
