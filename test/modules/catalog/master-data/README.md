# Catalog / Master Data

This module owns Catalog Base vocabulary and classification: Category,
ProductAttributeDefinition, EnumValue, Material, Finish, and Pack.

Its scenarios preserve the non-destructive lifecycle and typed-definition
rules from the former Catalog Base Markdown. They are accepted API scenarios
bound to the canonical operations in `test/contracts/openapi.yaml`; the
module must not reuse legacy product writes as a substitute transport
contract.
