# Figma Agent Rules

## 1. Information Architecture

Tổ chức theo:

```text
Domain → Module → Use Case → Screen → State
```

- Group theo product semantics/user intent, không theo UI type, sprint hoặc chronology.
- Supporting artifacts như Flow, Reference, Exploration, Review phải nằm cạnh scope chúng phục vụ.
- Mỗi screen/use case chỉ có một canonical location; legacy/snapshot phải được đánh dấu non-canonical.
- Shared Design System nằm ngoài product flow.

## 2. Behavior & Redesign

Behavior/spec là compatibility boundary.

Preserve:

```text
behavior
user outcomes
validation/errors
permissions
required states/transitions
backend-owned data
```

Không mặc định preserve legacy layout, navigation, screen boundary, visual hierarchy, component structure hoặc interaction pattern.

Legacy UI chỉ trả lời **behavior từng tồn tại thế nào**, không quyết định UI mới phải trông ra sao.

## 3. Design System

Ownership:

```text
Design System → Pattern → Component → Screen
```

- Reuse canonical shell, pattern, component và token.
- Không redraw, detach hoặc tạo local equivalent.
- Nếu reusable need chưa được support, mở rộng Design System rồi consume lại trong product.
- Không abstract speculative component chỉ vì “có thể dùng lại”.

## 4. Design Skills

- Existing-product redesign: dùng `redesign-existing-projects`.
- Chọn **một** taste profile, không dùng đồng thời:
  - Codex/GPT → ưu tiên `gpt-taste`.
  - Agent khác → `design-taste-frontend`.

- Skills chỉ cải thiện composition, hierarchy, typography, density, spacing, motion và polish.
- Skills không được thay đổi behavior, product ownership, IA hoặc canonical source of truth.
- Priority:
  `Behavior/Spec > Figma Rules > Accessibility/UX > Design System > Design Skills > Legacy UI`.

## 5. Screen / State Modeling

Không biến mọi behavior thành một frame.

Phân loại requirement thành:

```text
Screen | State | Interaction | Transition | Overlay | Component State | Annotation
```

Chỉ tạo state frame riêng khi có thay đổi đáng kể về content, action, permissions, recovery hoặc visual contract.

Không fabricate loading/error/conflict/etc. nếu behavior hoặc product semantics không yêu cầu.

## 6. Consistency

Sibling screens trong cùng flow phải thống nhất:

```text
shell
grid/alignment
page header
navigation
spacing
typography
component variants
action hierarchy
status semantics
locale
terminology
```

Product UI mặc định dùng tiếng Việt; technical identifiers/proper nouns có thể giữ nguyên.

## 7. Layout & Geometry

- Coordinates phải đúng parent space.
- Parent phải fit content.
- Không dùng clipping để che lỗi.
- Không dùng arbitrary/magic coordinates khi có thể derive từ grid/gap/item dimensions.
- `inside parent` không đồng nghĩa `layout valid`; phải check collision và minimum spacing.

## 8. Prototype

Prototype những interaction cần thiết để verify accepted browser behavior.

- Flow reversible phải có return path.
- Terminal/read-only state không expose invalid action.
- Khi behavior yêu cầu reload/fresh read, prototype phải thể hiện resulting state.
- API-only behavior chỉ annotate/trace, không dựng UI giả.

## 9. QA

Workflow:

```text
Design
→ Structural QA
→ Visual QA
→ Fix
→ Re-check
```

Machine-checkable properties phải verify bằng node/property khi có thể; visual review dùng để bắt hierarchy, rhythm, alignment, clipping, collision và sibling drift.

## 10. Completion Gate

Không Done nếu còn:

```text
orphan/duplicate artifact
arbitrary token/value
local duplicate component
inconsistent shell/navigation
unexplained sibling difference
mixed locale/terminology
collision/clipping/layout issue
missing behavior traceability
```

Final priority:

```text
Product semantics > Canvas convenience
Consistency > Local preference
Reuse > Recreate
Pattern > One-off
Token > Arbitrary value
System correctness > "Looks good"
```
