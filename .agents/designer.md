# Figma Agent Rules

## 1. Information Architecture

Tổ chức theo:

```text
Domain → Module → Use Case → Screen → State
```

- Group theo product semantics và user intent, không theo UI type, sprint hoặc chronology.
- Supporting artifacts như Flow, Reasoning, Reference, Exploration, Review phải nằm cạnh scope chúng phục vụ.
- Mỗi screen/use case chỉ có một canonical location; snapshot/exploration phải được đánh dấu non-canonical.
- Shared Design System nằm ngoài product flow.
- Figma hierarchy không được bóp semantic ownership chỉ để tiện organization.

## 2. Design Authority & Greenfield Mindset

GRIP UI được thiết kế **từ đầu**. Không có existing UI compatibility boundary.

Source of truth:

```text
Feature + SRS + canonical domain semantics + business rules + accepted contracts
→ product semantics
```

UI không phải source of truth cho business meaning.

Designer phải bắt đầu từ câu hỏi:

```text
Business này có nghĩa gì?
Actor là ai?
Actor đang cố đạt outcome gì?
Họ cần hiểu gì?
Họ phải quyết định gì?
System có constraint/state transition nào?
```

Không bắt đầu từ:

```text
Screen này nên có component gì?
```

Không mirror SRS, API, entity hoặc backend package thành UI một cách cơ học.

```text
Feature ≠ Screen
Endpoint ≠ Page
Entity ≠ Navigation item
Scenario ≠ Frame
Field ≠ Form control mặc định
```

SRS mô tả system/business behavior. UX phải chuyển semantics đó thành interaction model dễ hiểu, hiệu quả và thân thiện với người dùng.

Final priority:

```text
Canonical product semantics
> User goal / product intent
> UX correctness
> Accessibility
> Composition
> Validated Design System foundations
> Design taste / polish
> Canvas convenience
```

## 3. Canonical UI/UX Generation Pipeline

Không được nhảy trực tiếp từ feature/SRS sang Figma screen.

Canonical pipeline:

```text
Feature + SRS
→ Domain / business semantics
→ Actor goal
→ User intent
→ Task model
→ Information requirements
→ Interaction model
→ Information architecture
→ Canonical flow
→ Screen / state responsibility
→ Information hierarchy
→ Low-fidelity composition
→ Composition Gate
→ Desktop / mobile recomposition
→ Apply validated foundations
→ Visual UI
→ Structural + UX + Visual QA
→ Local solution
→ Candidate pattern
→ Cross-flow/module validation
→ Canonical pattern promotion
```

Required causal chain:

```text
Business semantics constrain UX.
UX constrains interaction.
Interaction constrains information architecture.
Information hierarchy constrains composition.
Composition constrains components.
Foundation expresses the result.
```

Forbidden inversion:

```text
Design System
→ pick components
→ arrange components
→ invent UX
```

Foundation là visual language, không phải generator của product structure.

## 4. Non-Violable Design Rules

Các rule dưới đây là hard constraints. Vi phạm bất kỳ rule nào phải coi là design failure, không phải polish issue.

### 4.1 Semantics

- Không fabricate business behavior để làm UI “đầy đủ hơn”.
- Không tự thêm loading, retry, recovery, autosave, optimistic update, confirmation, pagination, sorting, filtering, wizard step hoặc state transition nếu không có semantic/behavior evidence phù hợp.
- UX convention phổ biến không tự động trở thành product requirement.
- Không làm mất, đổi nghĩa hoặc che business constraint chỉ để UI đơn giản hơn.
- Không để user phải hiểu internal architecture của backend nếu UX có thể abstract hợp lý.
- Khi semantic source không đủ, record `semantic source gap`; không đoán rồi canonicalize.

### 4.2 UX

- Không tạo bước, input hoặc confirmation không phục vụ user goal, business requirement hoặc safety.
- Không expose complexity sớm hơn thời điểm user cần nó.
- Không yêu cầu user nhớ thông tin mà system đã biết hoặc có thể hiển thị tại điểm quyết định.
- Nếu system có đủ dữ liệu để prevent invalid action, ưu tiên prevention thay vì chờ submit rồi mới báo lỗi.
- Primary action phải phản ánh task priority, không phản ánh convenience của implementation.
- Destructive/irreversible action phải làm rõ consequence ở mức phù hợp với risk.

### 4.3 Screen modeling

- Không tạo một screen chỉ vì có một entity hoặc endpoint.
- Không biến mọi behavior thành một frame.
- Không mix mutually exclusive runtime states trong một canonical production screen.
- Không tạo standalone state frame nếu khác biệt chỉ là nhỏ và không làm thay đổi content/action/permission/recovery/visual contract đáng kể.
- API-only behavior chỉ annotate/trace; không dựng UI giả để “cover requirement”.

### 4.4 Composition

- Không arbitrary cardization.
- Không dùng border/background/elevation/radius như phương pháp grouping mặc định.
- Mỗi visible container phải **earn its boundary** bằng semantic hoặc compositional purpose rõ ràng.
- Không dùng decoration để cứu hierarchy yếu.
- Không để nhiều primary focal point cạnh tranh trong cùng một task view nếu semantics không yêu cầu.
- Không tạo symmetry chỉ để đẹp nếu symmetry làm sai semantic priority.
- Không để full-width content chỉ vì frame rộng.
- Không để dead whitespace hoặc cramped region không có lý do.

### 4.5 Design System

- Không tạo local equivalent khi canonical primitive/token phù hợp đã tồn tại.
- Không detach/redraw canonical component chỉ để sửa nhanh.
- Không abstract speculative component chỉ vì “có thể dùng lại”.
- Không promote local solution thành canonical pattern chỉ vì nó nhìn reusable.
- Visual similarity không phải evidence của semantic reuse.

### 4.6 Responsive

- Mobile không phải desktop được thu nhỏ.
- Không hide critical semantics chỉ vì thiếu space.
- Không đổi business meaning giữa breakpoint.
- Không giữ multi-column composition nếu task trên mobile cần recompose.

### 4.7 Geometry / Figma mutation

- Không dùng clipping để che lỗi layout.
- Không resize parent để hợp thức hóa child placement sai.
- Không `scale to fit` production screens để canvas gọn hơn.
- Không bulk mutate khi coordinate semantics chưa được verify.
- Không tiếp tục mutation khi xuất hiện dấu hiệu geometry corruption; phải STOP, inspect và restore known-good state trước.

## 5. Gate 1 — Semantic Gate

Không được synthesis UX nếu chưa trả lời được tối thiểu:

```text
What does this business concept mean?
Who acts on it?
Why?
What outcome are they trying to achieve?
What decisions must they make?
What information supports those decisions?
What states/transitions exist?
What constraints must never be violated?
What data does the system already know?
What data must the user provide?
```

Nếu chưa đủ:

```text
STOP
→ inspect Feature / SRS / canonical contract
→ record semantic source gap
→ do not invent UI behavior
```

Gate pass khi business meaning, actor goal, decision points, required information và constraints đủ rõ để design UX mà không đoán semantics.

## 6. Gate 2 — UX Gate

Trước khi tạo low-fi composition, UX model phải pass:

### Goal clarity

Mỗi canonical flow có một user goal/outcome rõ ràng.

### Task efficiency

Flow không có step/input/confirmation dư thừa.

### Cognitive load

Complexity chỉ xuất hiện khi cần để hiểu hoặc quyết định.

### Information timing

Thông tin quan trọng xuất hiện đúng lúc user cần nó.

### Decision support

User có đủ context để đưa ra quyết định mà không phải nhớ hoặc suy luận không cần thiết.

### Action hierarchy

Primary, secondary và destructive actions phản ánh đúng task priority/risk.

### Error prevention

UI prevent invalid actions khi semantics và available data cho phép.

### State model

Required UI states xuất phát từ accepted semantics/behavior evidence.

Nếu một flow chỉ “cover requirement” nhưng khiến user phải hiểu implementation structure, lặp input, hoặc đi qua bước không phục vụ goal thì UX Gate fail.

## 7. Screen / State Responsibility

Phân loại requirement thành:

```text
Screen | State | Interaction | Transition | Overlay | Component State | Annotation
```

Mỗi canonical screen/state phải trả lời:

```text
What is the user's primary intent here?
What must they understand?
What decision must they make?
What action should be easiest?
What information can remain secondary?
What changes after the action?
```

Canonical production screen frames represent a coherent runtime state.

Supporting artifacts có thể show adjacent states, reasoning hoặc component evidence; chúng không phải production screens.

Chỉ tạo production state frame riêng khi có thay đổi đáng kể về:

```text
content
available action
permission
recovery
business status
visual contract
```

Product UI mặc định dùng tiếng Việt; technical identifiers/proper nouns có thể giữ nguyên.

## 8. Information Hierarchy & Low-Fidelity Composition

Trước visual styling phải xác định information hierarchy.

Default reasoning order:

```text
1. Primary task / decision
2. Critical context
3. Primary action
4. Supporting information
5. Secondary action
6. Metadata
```

Hierarchy phải được giải quyết trước hết bằng:

```text
order
proximity
typography
whitespace
scale
alignment
```

Low-fi composition chỉ tập trung vào:

```text
regions
reading order
scan path
grouping
alignment
density
whitespace
action hierarchy
content priority
```

Không dựa vào color, shadow, decorative surface, imagery hoặc ornamental radius để làm hierarchy trở nên “có vẻ đúng”.

## 9. Gate 3 — Composition Gate

Một composition chỉ được chuyển sang final visual treatment khi:

- primary intent visually dominant;
- information follows semantic priority;
- có scan path rõ;
- primary action dễ nhận ra;
- related content được group bằng proximity trước container;
- container chỉ xuất hiện khi boundary có ý nghĩa;
- không arbitrary cardization;
- không có focal points cạnh tranh vô lý;
- whitespace tạo hierarchy thay vì lấp chỗ trống;
- alignment có chủ đích;
- density phù hợp task;
- không có dead whitespace hoặc cramped regions vô lý;
- composition giải thích được cách recompose sang mobile.

Hard rule:

> A screen that fails in grayscale or low fidelity must not be rescued with color, border, shadow, radius, imagery or decoration.

Nếu Gate fail, quay lại information hierarchy/composition; không polish tiếp.

## 10. Design System & Pattern Ownership

Ownership:

```text
Validated foundation/primitives → Product flow
Product flow → proven repeated structural solution → Canonical Design System pattern
```

Foundation có thể quyết định:

```text
color roles
semantic typography
spacing
surfaces
focus treatment
primitive interaction states
status semantics
accessibility behavior
```

Foundation không quyết định:

```text
page structure
navigation model
screen boundary
workflow
information hierarchy
product-specific interaction pattern
```

- Consume validated foundations/primitives.
- Reuse canonical pattern/component chỉ khi semantically appropriate.
- Nếu flow cần reusable solution chưa được chứng minh, solve it locally trong product flow trước.
- Không promote pattern chỉ vì một module đã dùng nó thành công.

## 11. Pattern Maturity & Promotion Gate

Pattern lifecycle:

```text
Local
→ Candidate
→ Validated
→ Canonical
```

### Local

Solution cho một flow/module cụ thể.

### Candidate

Có structural reuse potential nhưng mới có một nguồn evidence.

### Validated

Một independent flow/module khác gặp **cùng structural problem** và reuse solution tự nhiên.

### Canonical

Solution đã pass cross-flow validation + QA và được promote vào shared Design System/product pattern library.

Promotion evidence phải có đủ:

```text
same structural problem
+
same information / interaction responsibility
+
reuse without semantic distortion
```

Không promote nếu chỉ:

```text
looks similar
uses the same visual treatment
has the same card shape
was copied successfully
```

Nếu reuse buộc flow thứ hai bóp semantics để fit pattern, pattern chưa đúng abstraction.

## 12. Responsive Composition

Desktop và mobile là hai composition của cùng một task, không phải một layout được scale.

Phải giữ:

```text
user goal
semantic priority
reading order
critical information
primary action
business capability
```

Có thể thay đổi:

```text
arrangement
grouping
orientation
disclosure
navigation presentation
control placement
```

Pipeline:

```text
same semantics
→ same task
→ same priority
→ breakpoint-appropriate composition
```

## 13. Gate 4 — Responsive Gate

Desktop/mobile pass khi chứng minh:

```text
same goal
same semantic meaning
same critical capability
same information priority
```

Reject nếu:

- mobile chỉ là desktop shrink;
- critical semantics biến mất;
- reading order bị đảo sai task priority;
- primary action trở nên khó reach/identify;
- layout giữ cấu trúc desktop gây density hoặc interaction cost không hợp lý;
- business meaning thay đổi theo breakpoint.

## 14. Consistency

Sibling screens trong cùng flow phải thống nhất khi cùng semantics yêu cầu:

```text
grid/alignment
spacing
typography
component variants
action hierarchy
status semantics
locale
terminology
```

Shell/navigation/page header chỉ phải consistent khi chúng đã được product semantics hoặc validated canonical pattern xác lập. Không invent shell consistency rule để ép các flow khác nhau vào cùng template.

Unexplained sibling difference là defect; justified semantic difference thì được phép.

## 15. Layout & Geometry

- Coordinates phải đúng parent coordinate space.
- Parent phải fit content; không shrink children để fit parent.
- Sections/organizational containers follow child geometry, không ngược lại.
- Không dùng clipping để che lỗi.
- Không dùng arbitrary/magic coordinates khi có thể derive từ grid/gap/item dimensions.
- `inside parent` không đồng nghĩa `layout valid`; phải check collision và minimum spacing.
- Screen geometry không được thay đổi chỉ để reorganize canvas.
- Canvas organization được phép thay đổi top-level position, nhưng không được làm thay đổi screen width, height, scale hoặc internal layout nếu không có design requirement rõ ràng.

For grid/row placement:

```text
rowBottom = max(child.y + child.height for child in row)
nextRowY = rowBottom + verticalGap
```

Không dùng fixed row height khi children có chiều cao khác nhau.

For sibling frames A and B:

```text
intersection(A.bounds, B.bounds) = ∅
```

trừ khi overlap là chủ ý của interaction/design.

## 16. Canvas Mutation & Coordinate Safety

Figma MCP mutations are destructive operations. Không mutate hierarchy, position hoặc dimensions dựa trên giả định về coordinate semantics.

### 16.1 Coordinate spaces

Luôn phân biệt:

```text
canvas / absolute coordinates
parent-local coordinates
node bounds returned by inspection tools
coordinates expected by mutation tools
```

Không mặc định `get_nodes_info.bounds.x/y` có cùng semantics với `move_nodes.x/y`.

Before the first positional mutation in a task:

1. Xác định `move_nodes` dùng absolute canvas coordinates hay parent-local coordinates.
2. Verify empirically bằng một nested node đã biết đúng vị trí.
3. Record:
   - node id
   - parent id
   - parent absolute x/y
   - node local x/y
   - node absolute x/y
   - width/height

Nếu coordinate semantics chưa được xác minh, **không được bulk move**.

### 16.2 Absolute ↔ local conversion

Nếu mutation API dùng parent-local coordinates:

```text
localX = desiredAbsoluteX - parentAbsoluteX
localY = desiredAbsoluteY - parentAbsoluteY
```

Không truyền trực tiếp desired absolute canvas coordinates cho nested child.

Example:

```text
parent absolute = (3877, 692)
desired child absolute = (3957, 772)

correct child local:
x = 80
y = 80
```

Không được set:

```text
child x = 3957
child y = 772
```

nếu API đang dùng parent-local space.

### 16.3 Preserve geometry before canvas refactor

Trước canvas/layout refactor, snapshot geometry của các top-level artifacts:

```text
id
name
parent
x/y
absolute x/y
width/height
scale/transform
```

Classify mỗi artifact thành:

```text
canonical screen
organizational section
reference/exploration artifact
intentionally external canvas cluster
archive/non-canonical artifact
```

Không assume mọi visible artifact phải được reparent vào nearest section.

### 16.4 Reparenting

Reparent chỉ khi hierarchy thực sự sai.

Nếu reparent mà cần giữ visual placement:

```text
preserve absolute canvas position
→ change parent
→ convert old absolute coordinates into new parent-local coordinates
```

Không reparent rồi reuse old local coordinates.

Không reparent reference/exploration cluster chỉ để “normalize” tree nếu nó intentionally nằm ngoài canonical product section.

### 16.5 Parent resizing

Không resize parent để hợp thức hóa children đang đặt sai.

Forbidden recovery pattern:

```text
child misplaced
→ child overflows
→ enlarge parent until overflow disappears
→ declare layout valid
```

Required recovery pattern:

```text
child misplaced
→ identify coordinate/layout defect
→ repair child placement
→ compute child union bounds
→ resize parent around valid content
```

Parent bounds chỉ được derive **sau khi child layout hợp lệ**.

### 16.6 Screen geometry is immutable during canvas organization

Canvas reorganization không được:

```text
scale screens
shrink screens
stretch screens
resize screen internals
apply transform scaling
```

Default rule:

```text
canvas refactor:
change x/y only

design task:
may change internal geometry only when required by the intended composition
```

Không dùng `scale to fit` để làm canvas gọn hơn.

### 16.7 Sections are organizational containers

Section không phải viewport và không phải production screen.

- Section bounds phải ôm sát visible child artifacts.
- Không tạo section cực cao/rộng chỉ để bao một layout lỗi.
- Không shrink children để fit section.
- Không bật clipping để hide artifact nằm ngoài bounds.
- Nếu section có nhiều frames, dùng rows/grid có derived spacing.

Expected:

```text
Section
├── Frame A
├── Frame B
├── Frame C
└── Frame D
```

không phải:

```text
Section
└── gigantic nested frame
    └── unrelated screens stacked indefinitely
```

### 16.8 Bulk mutation safety

Trước mutation hàng loạt:

```text
Inspect
→ infer coordinate model
→ test one representative node
→ verify result
→ bulk apply
```

Không:

```text
infer
→ bulk mutate 20+ nodes
→ inspect afterward
```

Sau representative mutation, verify:

```text
parent unchanged as expected
child visible
child absolute position expected
child local offset expected
screen dimensions unchanged
no new clipping
```

Chỉ khi pass mới tiếp tục batch.

### 16.9 Mutation rollback boundary

Nếu sau mutation xuất hiện một trong các dấu hiệu:

```text
frames become tiny in canvas overview
cluster disappears
section suddenly grows by orders of magnitude
large unexplained empty space appears
previously visible sibling cluster becomes inaccessible
child x/y resembles parent canvas x/y
```

**STOP batch mutation.**

Không tiếp tục “repair” bằng resize/reparent bổ sung.

Inspect coordinate semantics và restore last known-good geometry trước.

## 17. Prototype

Prototype interaction cần thiết để verify intended task behavior và accepted contract.

- Flow reversible phải có return path khi semantics yêu cầu reversibility.
- Terminal/read-only state không expose invalid action.
- Khi behavior yêu cầu fresh read/reload/resulting state, prototype phải thể hiện state transition phù hợp.
- API-only behavior chỉ annotate/trace, không dựng UI giả.
- Prototype không được trở thành nơi invent business behavior chưa tồn tại trong source of truth.

## 18. QA Pipeline

Required QA workflow:

```text
Semantic Gate
→ UX Gate
→ Low-fi Composition
→ Composition Gate
→ Visual Treatment
→ Responsive Gate
→ Structural QA
→ UX QA
→ Visual QA
→ Fix
→ Re-check
```

Không được coi một screen là pass chỉ vì geometry đúng hoặc token đúng.

### 18.1 Structural QA

Verify bằng node/property inspection khi có thể:

```text
parent ownership
coordinate space
absolute/local position
frame dimensions
scale/transform
sibling intersection
minimum spacing
parent containment
clipping
duplicate canonical location
```

Containment alone không đủ.

For every sibling layout group:

```text
zero unintended pairwise intersections
```

For every organizational parent:

```text
children valid first
→ parent bounds derived second
```

### 18.2 UX QA

Review against source semantics và actor goal:

```text
user goal still clear
required decision supported
critical context visible at the right time
action hierarchy matches task priority
no unnecessary steps/inputs
invalid actions prevented when possible
required states represented
no invented behavior
no backend/API structure leaked into UX without user value
```

### 18.3 Visual / Composition QA

Visual review phải kiểm tra:

```text
hierarchy
scan path
rhythm
alignment
density
whitespace
grouping
container necessity
focal-point competition
clipping
collision
sibling drift
unexpected empty canvas
missing/external clusters
screen scale consistency
focus visibility
contrast
```

Reject nếu có:

```text
arbitrary cardization
excessive nested surfaces
weak primary hierarchy
competing primary actions
monotonous repeated blocks
unexplained dead whitespace
cramped regions
unrelated information sharing the same visual weight
decoration stronger than task content
```

Nếu machine QA pass nhưng visual QA cho thấy frame biến mất, bị ép thành cột rất nhỏ hoặc canvas có vùng trống bất thường, xem đó là structural failure chứ không phải visual-polish issue.

## 19. Completion Gate

Không Done nếu còn bất kỳ violation nào sau:

```text
semantic source gap silently guessed
feature/SRS mapped directly to screens without UX reasoning
backend/API/entity structure mirrored directly into IA/navigation
invented behavior/state without evidence
UX Gate not demonstrated
final styling applied before Composition Gate
low-fi composition fails hierarchy/scan-path review
arbitrary cardization or unexplained containers
mobile is desktop shrink
critical semantic information lost by responsive layout
local solution prematurely promoted to canonical pattern
pattern reuse based only on visual similarity
local duplicate canonical component/token
orphan/duplicate canonical artifact
mixed locale/terminology
unexplained sibling difference
collision/clipping/layout issue
unknown coordinate semantics after mutation
giant parent created to hide invalid child placement
screen geometry changed only for canvas organization
unverified bulk mutation
previously visible artifact lost after refactor
prototype invents behavior
Structural QA, UX QA or Visual QA unverified
```

Completion means:

```text
semantics understood
→ UX justified
→ composition solved
→ foundation applied
→ responsive recomposed
→ QA verified
→ pattern maturity correctly classified
```

Final ordering:

```text
Product semantics > Canvas convenience
User goal > Implementation structure
UX clarity > Feature-to-screen completeness
Composition > Decoration
Correct coordinate model > Fast mutation
Consistency with meaning > Visual sameness
Validated reuse > Speculative abstraction
Foundation token > Arbitrary value
System correctness > "Looks good"
```
