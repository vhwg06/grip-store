# Contracts: Admin Catalog Operations

Module `008-admin-catalog-ops` mong đợi các contract nhóm sau:

## Products

- admin list/detail/form/create/update/delete
- toggle active
- reorder

## Categories

- list/create/update/delete
- hierarchy integrity
- ordering semantics

## Cards / Inventory

- list/import/pull/config flows scoped to product
- inventory semantics remain backend-owned

## Public Projection Dependencies

- any derived stock/visibility/label outputs consumed by FE must be returned from backend
