# Content Overview

## Intent

`content` là domain quản lý editorial và reusable content assets cho admin:

- media library
- banners
- articles
- FAQs
- about content
- product-linked editorial content

## Actors

- `Admin / Content Operator`
- `Admin / Store Operator`
- `Customer`

## Core Concepts

- media asset
- page/banner presence
- article publication
- FAQ knowledge
- about narrative
- product editorial enrichment

## Boundaries

- `content` sở hữu substance của nội dung
- `store-setting` chỉ sở hữu storefront configuration và presence rules
- `product` chỉ sở hữu commercial/catalog state

## Relationships

- `content` references `store-setting` khi nội dung được trình bày trên storefront
- `content` references `product` khi nội dung gắn với product detail hoặc product media context
