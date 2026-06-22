# Content Overview

## Intent

`content` là domain quản lý editorial và reusable content assets cho admin:

- banners
- articles
- FAQs
- article-owned About projection
- product-linked editorial/media internals

## Actors

- `Admin / Content Operator`
- `Admin / Store Operator`
- `Customer`

## Core Concepts

- page/banner presence
- article publication
- FAQ knowledge
- article-owned about narrative
- product editorial enrichment

## Boundaries

- `content` sở hữu substance của nội dung
- `content` sở hữu banner enablement per page và article-to-About ownership
- `store-setting` chỉ sở hữu storefront configuration còn lại sau simplification
- `product` chỉ sở hữu commercial/catalog state

## Relationships

- `content` no longer depends on standalone `/admin/about`, `/admin/media`, hoặc `/admin/product-content` routes
- `content` references `product` khi nội dung gắn với product detail hoặc product media context
