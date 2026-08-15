# GRIP — Catalog Admin UI/UX Research

**Status:** Final  
**Scope:** Admin surface of the Catalog module  
**Primary admin job:** Create, configure, preview, publish, and maintain a Product  
**Design philosophy:** Simple surface over a richer Catalog domain  
**Research mode:** UI/UX reference research, not domain authority

---

## 1. Research objective

This research answers:

> How should a non-commerce expert create and maintain a GRIP product without being forced to understand Catalog architecture?

The Catalog SRS/domain remains authoritative.

This document only researches how to expose that domain through a simple Admin experience.

---

# 2. Current GRIP Catalog model

The current Catalog capability includes:

```text
Catalog
├── Product Model
├── Variant
├── Variant Generation
├── Bulk Variant
├── Master Data
├── Public Query
└── Preview
```

Important existing semantics:

```text
Public listing
→ ProductModel projection

Public detail
→ ProductModel + customer configuration
→ resolves a Variant

Default Variant
→ controls initial public projection

ProductModel media
→ fallback

Variant media
→ optional override

Fixed/shared attributes
→ ProductModel

Variant Dimensions
→ participate in Variant identity

Master Data
→ Material / Finish / Pack

Variant Generation
→ combination preview + selected generation/manual creation

Bulk Variant
→ price / status / Pack / media

SKU
→ globally unique
```

Out of scope includes:

```text
inventory / availability
promotion
checkout
order
payment
full revision workflow
advanced staged publishing
```

---

# 3. Core design problem

The Admin domain vocabulary is richer than the user's mental model.

Domain:

```text
ProductModel
Variant Dimension
Variant Generation
Bulk Variant
Master Data
Default Variant
Public Projection
```

A novice merchant/admin should instead think:

```text
Sản phẩm
Lựa chọn
Phiên bản
Thông tin sản phẩm
Phiên bản hiển thị đầu tiên
Xem trước
Hiển thị trên cửa hàng
```

Therefore the UI must provide a **translation layer** between domain semantics and merchant language.

---

# 4. Research strategy

No single external commerce product matches GRIP's Catalog model.

Different references are useful for different interaction problems.

Recommended research stack:

```text
Squarespace
→ overall Product Workspace simplicity

Wix
→ novice vocabulary / progressive disclosure

Square
→ option sets + variant generation behavior

Shopify
→ contextual bulk editing + public preview

WooCommerce
→ default variation + product/variant media relationship
```

No external product is a domain authority.

GRIP decides the final interaction architecture.

---

# 5. Primary visual reference — Squarespace Product Editor

Squarespace is the strongest overall reference for **simple object-first editing**.

Useful characteristics:

- product is edited in one clear workspace;
- product information stays in product context;
- variants stay inside the product instead of becoming a separate application;
- publication/visibility is a property of the product;
- relatively low navigation depth;
- relatively restrained visual hierarchy.

References:
- Squarespace Help — Add products to your store
- Squarespace Help — Adding product variants
- Squarespace Help — Product images

### GRIP lesson

Put the user directly into the Product they are editing.

Do not create a dashboard about the process of creating the Product.

---

# 6. Wix — vocabulary and optional complexity

Wix is useful for how it speaks to non-expert merchants.

Examples of novice-friendly concepts:

```text
Basic info
Pricing
Images
Product options
Additional information
```

The user is not forced to understand PIM/catalog terminology.

Reference:
- Wix Stores — Adding a physical product
- Wix Stores — Adding product options

### GRIP lesson

Use everyday business language.

Do not expose:

```text
Product Model
Variant Dimension
Master Data
Variant Generation
```

as primary UI labels.

---

# 7. Square — Variant Dimensions and generation

Square's strongest match with GRIP is the options-to-variations flow.

Mental model:

```text
Option set: Color
→ Red / Blue / Green

Option set: Size
→ S / M / L

↓
generated variations
```

Square also supports reviewing generated combinations.

Reference:
- Square Support — Item options

### GRIP lesson

A user should define familiar options first, then see the resulting combinations.

The system handles the combinatorial model.

---

# 8. Shopify — contextual Bulk Variant editing

Shopify keeps variant editing inside the Product context.

Patterns worth using:

```text
variant table
checkbox selection
bulk edit
column-based editing
```

Reference:
- Shopify Help — Editing variants

### GRIP lesson

Bulk Variant is an **action on selected variants**, not a destination in navigation.

Do not create:

```text
Catalog
├── Products
├── Variant Generation
└── Bulk Variant
```

for novice admins.

---

# 9. WooCommerce — Default Variant and media behavior

WooCommerce provides a useful reference for:

- selecting a default variation after variations exist;
- parent product media as the initial presentation;
- variation-specific media when a variation is selected.

Reference:
- WooCommerce — Variable Product documentation

### GRIP lesson

`Default Variant` should be expressed through customer consequence:

```text
Phiên bản hiển thị đầu tiên
```

not technical vocabulary.

Variant media should clearly communicate fallback behavior.

---

# 10. Product is the primary object

The main Admin object is:

```text
Product
```

not:

```text
Product Model configuration workflow
```

Preferred navigation:

```text
Sản phẩm
↓
Open product
↓
Product Workspace
```

The user edits the object itself.

Avoid intermediate dashboards such as:

```text
Product setup progress
Product readiness center
Variant generation center
Master data center
```

unless future evidence proves they are necessary.

---

# 11. Product creation should be minimal

A new Product should require only the smallest set of fields required by the Catalog contract to create a meaningful draft.

The UI should avoid requiring the entire Catalog model before the Product exists.

Conceptually:

```text
Thêm sản phẩm

Tên sản phẩm
[...]

Danh mục
[...]

Ảnh
[...]

[ Tạo sản phẩm ]
```

After creation, the user enters the Product Workspace.

Important:

> This is progressive disclosure, not a mandatory multi-step wizard.

---

# 12. Product Workspace

The Product Workspace is the central Admin surface.

Conceptual responsibilities:

```text
Product
├── Basic product information
├── Media
├── Options
├── Variants
├── Product information
├── Preview
└── Publication
```

These responsibilities do not necessarily require tabs/pages.

A simple editor with clear section hierarchy is preferred until complexity proves otherwise.

---

# 13. Do not create a setup dashboard

Avoid:

```text
Hoàn thiện sản phẩm

✓ Basic
✓ Media
! Variants
! Master Data

67% complete
2 blockers
```

Why:

- it turns product authoring into project management;
- it introduces abstract completion language;
- it forces a process mental model;
- it adds a surface that is not the Product itself.

Preferred:

> Put the user directly where the missing information is edited.

Readiness should become visible when relevant, especially at publish time.

---

# 14. Options / Variant Dimensions

Domain:

```text
Variant Dimension
Option Value
```

Admin language:

```text
Sản phẩm có những lựa chọn nào?
```

Example:

```text
Lựa chọn

Màu sắc
[ Trắng ] [ Đen ] [+ Thêm]

Kích thước
[ 120 cm ] [ 160 cm ] [+ Thêm]

[+ Thêm loại lựa chọn]
```

Do not show:

```text
Variant Dimension
Dimension Value
```

unless an expert mode is explicitly introduced in the future.

---

# 15. Variant generation

The user should not need a navigation destination named:

```text
Variant Generation
```

The generation behavior can remain inside the Options/Variants interaction.

Conceptual flow:

```text
Define options
↓
Preview resulting combinations
↓
Select valid combinations
↓
Create variants
```

Example:

```text
Các phiên bản sẽ được tạo

☑ Trắng / 120
☑ Trắng / 160
☐ Đen / 120
☑ Đen / 160

3 phiên bản sẽ được tạo

[Tạo 3 phiên bản]
```

The selected-combination behavior belongs to GRIP's domain.

External references only validate that combination preview is understandable.

---

# 16. Avoid unnecessary generation ceremony

The UI should minimize the sense that generation is a separate technical operation.

For simple products, combinations may be shown inline under the defined options.

The system may surface an explicit confirmation only when the consequence is meaningful, for example:

```text
12 phiên bản sẽ được tạo
```

Do not force every small edit through a heavy wizard.

---

# 17. Variants

Once variants exist, they should appear in the Product Workspace.

Recommended representation:

```text
Các phiên bản                                  6

☐ Trắng / 120       12.990.000   Đang bán
☐ Trắng / 160       13.990.000   Đang bán
☐ Đen / 120         12.990.000   Đang bán
...
```

The row should expose only the most important scannable properties.

Deep editing can happen in a row detail, drawer, or focused editor when necessary.

---

# 18. Bulk Variant

Bulk Variant should appear contextually after selection.

Example:

```text
☑ Trắng / 120
☑ Trắng / 160
☑ Đen / 120

3 phiên bản đã chọn

[Đổi giá] [Đổi trạng thái] [Đổi Pack] [Ảnh]
```

Only expose operations supported by the actual GRIP contract.

Do not copy inventory, shipping, fulfillment, or other Shopify actions.

---

# 19. Shared vs variant-owned data

Do not invent inheritance semantics that do not exist in the domain.

If price belongs to Variant, keep it on Variant.

Use bulk edit to reduce repetition.

Avoid fabricated UI such as:

```text
Đang dùng giá chung
[Đặt giá riêng]
```

unless the domain truly owns shared/default price inheritance.

Principle:

> Simplify interaction without changing domain semantics.

---

# 20. Product information / Master Data

The capability name:

```text
Master Data
```

should disappear from the novice UI.

Current GRIP scope:

```text
Material
Finish
Pack
```

User-facing grouping:

```text
Thông tin sản phẩm

Chất liệu
[...]

Bề mặt
[...]

Đóng gói
[...]
```

Do not create a standalone `Master Data` destination.

---

# 21. Product media

ProductModel media acts as the shared/default media source.

Variant media can override it.

The UI should communicate fallback without technical terminology.

Example:

```text
Đen / 160 cm

Hình ảnh
[+ Thêm ảnh riêng]

Chưa thêm ảnh riêng.
Khách sẽ thấy hình ảnh chung của sản phẩm.
```

Avoid:

```text
Inherit ProductModel Media
Override Media
```

unless expert terminology is intentionally required.

---

# 22. Default Variant

Domain:

```text
Default Variant
```

User-facing concept:

```text
Phiên bản hiển thị đầu tiên
```

Example:

```text
Phiên bản hiển thị đầu tiên

Xám / 3 chỗ                         [Đổi]

Khách sẽ thấy phiên bản này
khi mở sản phẩm.
```

Rules:

- only choose from existing variants;
- explain the customer-facing consequence;
- keep the control close to variant/public-preview context;
- do not create a separate Default Variant management screen.

---

# 23. Preview

Preview is a core feedback loop.

Admin question:

> “Khách sẽ thấy cái mình vừa nhập như thế nào?”

Therefore Preview should be available directly from the Product Workspace.

Example header:

```text
KIVIK Sofa                            Nháp

                              [Xem trước]
```

Preview should represent the actual public behavior:

```text
Default Variant
→ initial product projection

customer changes options
→ resolved Variant

resolved Variant
→ price / media / technical context updates
```

Do not reduce Preview to a static screenshot of ProductModel data.

---

# 24. Publication

Publication should be treated as product visibility/state, not as the final step of a wizard.

Avoid:

```text
Step 8 — Publish
```

Preferred:

```text
Nháp
[ Xem trước ] [ Hiển thị trên cửa hàng ]
```

Product existence and public visibility are separate concerns.

---

# 25. Readiness should be exception-driven

Do not show permanent completion dashboards such as:

```text
73% complete
3 blockers
4 recommendations
```

Instead:

```text
[Hiển thị trên cửa hàng]
```

If valid:

```text
→ publish
```

If invalid:

```text
Chưa thể hiển thị sản phẩm

• Phiên bản Xám / 3 chỗ chưa có giá
• Chưa chọn phiên bản hiển thị đầu tiên
```

Then route the user to the exact fields/problems.

Principle:

> **Readiness is exception-driven, not dashboard-driven.**

---

# 26. Publication errors

Validation messages must use merchant language.

Avoid:

```text
Missing canonical default variant
Invalid public projection
Variant price constraint violation
```

Prefer:

```text
Chưa chọn phiên bản hiển thị đầu tiên
Phiên bản Đen / 160 cm chưa có giá
```

The UI translates domain validation into actionable user language without weakening the actual rule.

---

# 27. Visual language

Catalog Admin should follow GRIP's established direction:

```text
warm / off-white base
low cardization
strong typography
clear section spacing
restrained borders
functional imagery
minimal dashboard chrome
```

The visual metaphor is:

> **editor / workspace**

not:

> **commerce control center**

---

# 28. Section hierarchy

Prefer:

```text
Product title
status
primary actions

Basic information
...

Images
...

Options
...

Variants
...

Product information
...
```

Hierarchy should come mainly from:

```text
typography
spacing
dividers
alignment
```

not nested cards.

---

# 29. Contextual complexity

Advanced controls should appear only where relevant.

Examples:

- no variant table before options/variants exist;
- no bulk actions before selection;
- no variant image fallback explanation unless variants exist;
- no publication blockers until publish/preview requires them;
- no future inventory controls;
- no promotion controls;
- no checkout/order concepts.

---

# 30. No one-screen-per-use-case mapping

The domain contains:

```text
Variant Generation
Bulk Variant
Master Data
Preview
```

This does **not** imply:

```text
four sidebar pages
```

These capabilities may all live contextually inside one Product Workspace.

Rule:

> Use case boundaries are behavioral boundaries, not automatic navigation boundaries.

---

# 31. Suggested Product Workspace anatomy

Conceptual, not canonical screen geometry:

```text
KIVIK Sofa                              Nháp
                              [Xem trước]

────────────────────────────────────────────

Thông tin cơ bản
Tên
Danh mục
Mô tả

Hình ảnh
...

Lựa chọn
Màu sắc
Kích thước

Các phiên bản
6 phiên bản
...

Thông tin sản phẩm
Chất liệu
Bề mặt
Đóng gói

────────────────────────────────────────────

                    [Hiển thị trên cửa hàng]
```

This should remain one coherent object-editing experience unless usability evidence demands stronger decomposition.

---

# 32. Mobile / narrow layout

Preserve:

```text
product identity
editing hierarchy
variant readability
preview access
publication action
```

Do not preserve desktop table geometry when it becomes unreadable.

Variants may switch from wide table to a compact list/detail model on narrow screens.

---

# 33. Anti-patterns

Do not:

- expose `ProductModel` as UI terminology;
- expose `Variant Generation` as a top-level menu item;
- expose `Bulk Variant` as a top-level menu item;
- expose `Master Data` as novice-facing navigation;
- create a product-setup dashboard;
- show fake completeness percentages;
- create a mandatory long wizard;
- mirror every domain use case into a screen;
- invent data inheritance not owned by the domain;
- mix inventory/promotion/order concerns into Catalog;
- hide Preview far away from editing;
- use enterprise commerce vocabulary when plain Vietnamese exists.

---

# 34. GRIP-derived interaction model

```text
Sản phẩm
↓
Thêm / mở sản phẩm
↓
Product Workspace
│
├── Thông tin cơ bản
├── Hình ảnh
├── Lựa chọn
│   └── combination preview / selected generation
├── Các phiên bản
│   ├── individual edit
│   ├── contextual bulk edit
│   └── phiên bản hiển thị đầu tiên
├── Thông tin sản phẩm
│   └── Material / Finish / Pack
├── Xem trước
└── Hiển thị trên cửa hàng
```

This is an interaction responsibility map.

It is not a mandatory page structure.

---

# 35. Design gate

Catalog Admin is successful when a novice admin can answer:

```text
Tôi đang sửa sản phẩm nào?
Sản phẩm có những lựa chọn nào?
Những phiên bản nào sẽ được bán?
Tôi sửa nhiều phiên bản cùng lúc ở đâu?
Khách sẽ thấy phiên bản nào đầu tiên?
Nếu phiên bản không có ảnh riêng thì khách thấy gì?
Thông tin chất liệu / bề mặt / đóng gói ở đâu?
Khách sẽ thấy sản phẩm như thế nào?
Tại sao sản phẩm chưa thể hiển thị?
```

without learning:

```text
ProductModel
Variant Dimension
Canonical Combination
Master Data
Public Projection
Variant Generation
```

---

# 36. Research conclusion

The strongest direction for GRIP Catalog Admin is:

```text
Object-first
Product

Primary surface
Product Workspace

Complexity strategy
Contextual + progressive disclosure

Variants
Inline within Product

Bulk operations
Contextual after selection

Preview
Always close to editing

Readiness
Exception-driven

Publication
Visibility/state, not wizard completion
```

Reference roles:

```text
Squarespace
→ overall simplicity / product workspace

Wix
→ novice language

Square
→ option-to-variant generation

Shopify
→ contextual bulk editing + preview

WooCommerce
→ default variation + media fallback reference
```

The final UI must preserve GRIP's own domain semantics while remaining simpler than the commerce tools used as research references.

---

# 37. Sources used

- Squarespace Help — Add products to your store  
  https://support.squarespace.com/hc/en-us/articles/205811338-Add-products-to-your-store

- Squarespace Help — Adding product variants  
  https://support.squarespace.com/hc/en-us/articles/206540687-Adding-product-variants

- Squarespace Help — Product images  
  https://support.squarespace.com/hc/en-us/articles/115013631487-Add-and-style-product-images

- Wix Stores — Adding a physical product  
  https://support.wix.com/en/article/wix-stores-adding-a-physical-product

- Wix Stores — Adding product options  
  https://support.wix.com/en/article/wix-stores-adding-product-options

- Square Support — Item options  
  https://squareup.com/help/us/en/article/6689-item-options

- Shopify Help — Editing variants  
  https://help.shopify.com/en/manual/products/variants/edit-variants

- Shopify Help — Add/update products / preview  
  https://help.shopify.com/en/manual/products/add-update-products

- WooCommerce — Variable Product  
  https://woocommerce.com/document/variable-product/
