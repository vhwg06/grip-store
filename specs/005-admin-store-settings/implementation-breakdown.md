# Implementation Breakdown: Admin Store Settings

Tài liệu này là backlog cho **Phase 2**. Nó không phải nơi mô tả code sẽ được viết ngay trong Phase 1.

## Contracts / API

- hợp nhất admin/public settings read model
- định nghĩa section-level write contract
- giữ migration path khỏi `settingsMap` lỏng

## BE: business logic / contract / persistence

- validation cho nested payloads
- normalization legacy values
- ordering semantics cho homepage blocks
- visibility/registry gating
- public projection phản ánh từ same persisted source

## FE: render / form wiring / API integration only

- sectioned UI theo spec/Figma
- structured editors thay raw textareas
- Media Picker cho logo
- section dirty/save/error states

## Playwright

- làm xanh API contract tests
- làm xanh admin UI tests
- thêm regression cho public reflection nếu phát sinh từ implementation
