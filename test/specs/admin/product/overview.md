# Catalog Base Overview

## Intent

Catalog Base quản lý định nghĩa sản phẩm, dữ liệu kỹ thuật, biến thể bán hàng, giá hiện hành và public catalog projection. Domain thay thế contract Product đơn giản bằng `ProductModel` và `Variant` theo Big Bang reset; không có migration hay tương thích ngược với dữ liệu, route, hoặc API Product cũ.

## Actors

- `Admin / Catalog Operator`: định nghĩa catalog và quản lý lifecycle.
- `Customer`: browse, tìm kiếm, xem chi tiết và resolve Variant công khai.
- `QA / Developer`: kiểm chứng contract domain, application và public projection.

## Core Boundaries

- `Category` chỉ là classification; không sở hữu attribute template hay publish rule.
- `ProductAttributeDefinition` là cơ chế attribute duy nhất. Material, Finish và Pack là master data được dùng qua Reference attribute, không có assignment song song. Finish sở hữu display metadata và swatch/media.
- `ProductModel` sở hữu nội dung, media, bảo hành, attribute scope, Variant dimensions và lifecycle publication.
- `Variant` là sellable unit có tổ hợp option bất biến, SKU, selling price, pack reference và trạng thái riêng.
- Catalog Base không sở hữu stock, warehouse, order, warranty claim, pricing engine, quantity pricing, generic attribute rules hay product comparison.

## ProductModel Lifecycle

```text
Draft --publish--> Active --unpublish--> Inactive --publish--> Active
  |                    |                     |
  +----discontinue-----+-----discontinue------+--> Discontinued
```

`Discontinued` là terminal. Không tồn tại cờ `published` độc lập với state machine này.

## Commercial Terms

- `Variant Active`: Variant được bật để tham gia catalog; chưa chắc sale-ready.
- `Sale-ready Variant`: Variant Active có SKU hợp lệ và `SellingPrice` hợp lệ.
- `Publicly sellable Variant`: sale-ready Variant thuộc ProductModel `Active`.
- `Selectable Option Availability`: option có thể tạo thành ít nhất một publicly sellable Variant tương thích với lựa chọn hiện tại.
- `Stock Availability`: ngoài scope hoàn toàn; Catalog Base không expose hoặc consume tồn kho.

## In Scope

- Category, Product Attribute Definition, Material, Finish và Pack lifecycle.
- ProductModel, media, description, numeric measurements và WarrantySummary.
- Fixed, dimension và variant-specific attribute scopes.
- Preview/generate selected Variant combinations, manual Variant creation, Variant activation và immutable selections.
- SKU, one current SellingPrice, selling unit và Pack reference.
- Publish validation, BrowseCatalog, SearchCatalog, filtering theo Category/Material/Finish/SellingPrice, GetProductDetail, GetAvailableOptions và ResolveVariant.

## Out Of Scope

- Warehouse, stock state hoặc inventory enrichment.
- Inventory repository, port hoặc integration giả trong Catalog Base.
- Order, sales workflow, purchase limit và purchase warning.
- Warranty claims, coverage engine hoặc Variant warranty override.
- Price rules, calculated prices, manual overrides, copy prices và quantity price tiers.
- Generic attribute filtering, public/comparable attribute rules và CompareProducts.
- Variant dimension structural reconfiguration sau khi đã tồn tại Variant.
