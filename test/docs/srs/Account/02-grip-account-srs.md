# GRIP Account Module — Software Requirements Specification

**Status:** Final  
**Pipeline stage:** 02 — SRS  
**Module:** Account  
**Surfaces:** Public Storefront + Admin Console  
**Research input:** `01-grip-account-ikea-research.md`

---

# 1. Purpose

The Account module provides persistent customer identity and reusable personal shopping context.

Its job is not merely authentication.

It enables a signed-in customer to:

- access their account;
- manage personal information;
- manage reusable delivery information;
- return to their orders;
- return to saved products when that capability exists;
- reduce repeated data entry during checkout.

The Admin surface enables authorized operators to find and support customer accounts and, where configured, manage administrator access.

---

# 2. Core product model

```text
Account
├── Authentication
├── Customer profile
├── Saved delivery information
├── Account overview
├── Cross-module personal activity projections
│   ├── Orders
│   └── Saved products
└── Admin account operations
```

Key rule:

> Account owns persistent customer context. It does not own commerce transactions belonging to other modules.

---

# 3. Explicit current-scope exclusions

The following are **not part of the current Account module**:

```text
One-time-code sign-in
Public self-registration
Registration verification
Email verification
OTP verification
Saved payment cards
Loyalty / rewards
Marketing automation
Order mutation semantics
Payment processing
```

Do not create screens, states, APIs or acceptance requirements for these behaviors without an explicit SRS change.

Account provisioning is outside this SRS unless an existing system contract already defines it.

---

# 4. Ownership boundaries

## 4.1 Account owns

Account is authoritative for:

- account identity reference;
- authentication credential behavior exposed by the current system;
- customer account state;
- personal profile data;
- reusable delivery information;
- default saved delivery selection;
- account-level security actions;
- account-level admin/customer association where defined.

## 4.2 Checkout owns

Checkout is authoritative for:

- the current checkout session/draft;
- delivery information selected/copied into that checkout;
- checkout validation;
- fulfillment selection;
- billing data used for the current checkout;
- payment selection;
- current checkout completion state.

## 4.3 Order owns

Order is authoritative for:

- order identity;
- ordered item snapshots;
- order totals;
- order status;
- fulfillment state;
- order delivery snapshot;
- receipt/invoice behavior;
- cancel/reschedule/refund behavior where supported.

## 4.4 Catalog / Engagement owns

Saved/favourite products remain owned by their canonical module.

Account may provide an entry point or projection.

## 4.5 Admin access

Administrative identities must not be conflated with customer identities merely because both are “users”.

Admin access and customer-account administration are separate capabilities in the Admin surface.

---

# 5. Public Account requirements

## ACC-PUB-001 — Sign in

A customer with an existing account can sign in using the currently supported credential mechanism.

Current SRS assumes:

```text
email/username + password
```

No one-time-code path is required.

### Required behavior

- invalid credentials do not authenticate;
- successful authentication creates the supported authenticated session;
- sign-in can be initiated from Account;
- sign-in can be initiated from another flow such as Checkout;
- successful contextual sign-in returns the user to the originating flow when that origin is valid.

---

## ACC-PUB-002 — Sign out

A signed-in customer can sign out.

After sign-out:

- authenticated Account data is no longer accessible;
- anonymous storefront browsing remains available;
- other module behavior follows its own session rules.

---

## ACC-PUB-003 — Account overview

A signed-in customer can open a central account overview.

The overview is a task hub, not merely a profile form.

It can surface:

- recent orders;
- saved delivery information;
- saved products when supported;
- personal information;
- login/security entry points.

The overview must not duplicate authoritative transactional data.

---

## ACC-PUB-004 — View personal information

A signed-in customer can view their persistent personal information.

The exact stored fields are defined by the domain/API contract, but may include:

- display/full name;
- email;
- phone/contact details.

---

## ACC-PUB-005 — Edit personal information

A signed-in customer can edit fields that the current domain contract allows them to change.

Mutation must:

- validate input;
- persist only Account-owned fields;
- return canonical saved state;
- surface failure without pretending the change succeeded.

Changing Account profile data must not mutate historical Orders.

---

# 6. Saved delivery information

## ACC-DEL-001 — View saved delivery information

A signed-in customer can view reusable delivery information stored in Account.

A saved delivery entry represents reusable personal fulfillment data, not an Order address.

A delivery entry may include the currently supported combination of:

- recipient/contact name;
- phone/contact data;
- postal address;
- delivery-related stable information supported by the domain.

Do not invent fields that do not exist in the actual contract.

---

## ACC-DEL-002 — Add saved delivery information

A signed-in customer can add a reusable delivery entry when the current backend contract supports address creation.

The new entry becomes available for future checkout reuse after successful persistence.

---

## ACC-DEL-003 — Edit saved delivery information

A signed-in customer can edit a saved delivery entry.

The mutation affects:

- future Account reads;
- future Checkout prefills/selections.

It must **not** retroactively change:

- completed Orders;
- immutable order delivery snapshots;
- completed checkout records.

---

## ACC-DEL-004 — Delete saved delivery information

A signed-in customer can delete a saved delivery entry if domain rules permit deletion.

Deleting it must not mutate historical Orders.

If the deleted entry was the default, the resulting default state must follow an explicit domain rule:

- another entry becomes default; or
- no default remains.

Do not silently select an arbitrary default unless the domain contract defines that behavior.

---

## ACC-DEL-005 — Default delivery information

If the domain supports multiple delivery entries, Account may identify one as the default.

The default is the preferred candidate for Checkout prefill.

Default does not mean immutable.

---

# 7. Account ↔ Checkout requirements

## ACC-CHK-001 — Checkout can consume saved delivery information

When a customer is authenticated, Checkout can request Account-owned saved delivery information through the published Account contract.

Checkout must not access Account persistence directly.

---

## ACC-CHK-002 — Default delivery prefill

If:

- the customer is authenticated;
- a valid default saved delivery entry exists;
- the checkout requires delivery information;

then Checkout should initialize the relevant delivery fields from that saved entry.

This is a convenience behavior.

The customer must still be able to review and change the current checkout data.

---

## ACC-CHK-003 — Prefill is a copy, not shared mutable state

When Checkout uses Account delivery information:

```text
Account saved delivery info
        ↓ copy
Checkout delivery draft
```

After the copy:

- Checkout owns the current draft values;
- editing the current checkout does not silently mutate Account;
- changing Account in another context does not silently rewrite an already-progressed checkout;
- completing the order persists the Order-owned delivery snapshot.

This ownership rule is mandatory.

---

## ACC-CHK-004 — Choose another saved delivery entry

If multiple saved delivery entries exist and Checkout supports selection, the customer can choose another saved entry.

Selecting it replaces the current checkout delivery draft with a copy of that entry subject to Checkout validation.

---

## ACC-CHK-005 — Checkout with no saved delivery information

If no valid saved delivery information exists:

- Checkout remains usable;
- delivery fields are collected according to Checkout requirements;
- the Account module must not block checkout merely because reusable information is missing.

---

## ACC-CHK-006 — Saving checkout-entered delivery information

If the product supports “save for future use” from Checkout:

- the action must be explicit;
- Account persists a new/updated delivery entry only after an explicit customer action;
- Checkout success does not automatically rewrite Account delivery information.

If this capability is not implemented, the UI must not imply that checkout-entered data will be saved to Account.

---

## ACC-CHK-007 — Context preservation through sign-in

If sign-in is initiated from Checkout:

```text
Checkout
→ Sign in
→ Success
→ same Checkout context
```

The cart and valid checkout state must be preserved according to Checkout's contract.

Successful authentication must not navigate the user to Account Overview unless the user explicitly requested Account.

---

# 8. Orders as an Account utility

## ACC-ORD-001 — View order history entry point

A signed-in customer can access their own orders from Account.

Order ownership remains with the Order module.

Account can:

- render an Order-provided projection; or
- navigate to the canonical Order list.

---

## ACC-ORD-002 — Recent orders on Account overview

Account Overview may show a small recent-order projection when data is available.

Projection fields must be minimal and useful, for example:

- order reference;
- order date;
- current status;
- total, if permitted.

The projection must not recreate the complete Order detail model.

---

## ACC-ORD-003 — Open canonical order detail

Selecting an order from Account navigates to the canonical Order-owned detail/action surface.

Account does not independently implement:

- cancel;
- reschedule;
- refund;
- fulfillment mutation;
- receipt generation.

Those actions appear only through Order contracts.

---

## ACC-ORD-004 — Historical independence from profile changes

Updating personal or saved delivery information in Account must not alter data snapshots attached to previous Orders.

---

# 9. Saved products as an Account utility

## ACC-SAV-001 — Saved-products entry point

If GRIP supports saved/favourite products, Account can expose an entry point such as:

```text
Đã lưu
```

The canonical saved-product data remains owned by Catalog/Engagement according to the existing domain contract.

---

## ACC-SAV-002 — Cross-session continuity

Where the owning module supports persistence by account identity, a signed-in customer should be able to return to their saved products across sessions.

Account does not reimplement save/remove semantics.

---

# 10. Login and security

## ACC-SEC-001 — Change credential

If the current authentication backend supports customer password change, a signed-in customer can change their password through Account security.

The exact credential rules are defined by the authentication contract.

---

## ACC-SEC-002 — No credential disclosure

Neither Public nor Admin UI can display a customer's password or equivalent credential secret.

---

## ACC-SEC-003 — Account destructive action

If account deletion/deactivation is supported:

- consequence must be explicit;
- confirmation is required;
- related historical records owned by other modules are handled according to their retention rules;
- Account deletion must not imply that legally/operationally retained Orders are deleted unless the governing contract says so.

---

# 11. Public Account navigation model

Canonical semantic destinations:

```text
My Account
├── Overview
├── My Orders
├── Saved Delivery Information
├── Saved Products        // if supported
├── Personal Information
└── Login & Security
```

This is semantic IA, not a mandated visual sidebar.

Responsive UI can present these destinations differently.

---

# 12. Admin authentication boundary

## ACC-ADM-001 — Admin sign-in

Admin Console requires its authorized administrative authentication boundary.

A customer session must never automatically grant Admin access.

---

## ACC-ADM-002 — Authentication is not authorization

Successful Admin authentication identifies the principal.

Authorization determines which account operations the principal can perform.

The UI must not expose an action as available when the principal lacks required permission.

Backend authorization remains mandatory even when the UI hides/blocks the action.

---

# 13. Admin — Customer accounts

## ACC-ADM-CUS-001 — Customer directory

Authorized administrators can access a customer-account directory.

The directory supports locating a customer using human-recognizable identifiers supported by the backend, such as:

- name;
- email;
- phone.

Do not require operators to know internal IDs for normal lookup.

---

## ACC-ADM-CUS-002 — Customer account detail

Authorized administrators can view a customer account detail containing Account-owned information:

- customer identity/profile;
- account state;
- saved delivery information, subject to permission;
- relevant Account metadata.

Cross-module data is shown only as projection/link.

---

## ACC-ADM-CUS-003 — Customer order projection

Customer detail may show recent/linked Orders for support context.

Order actions remain in the Order Admin surface.

Selecting an order navigates to the canonical Order-owned detail.

---

## ACC-ADM-CUS-004 — Edit customer Account data

Where permissions and backend contracts allow, an administrator can edit Account-owned customer information.

Examples can include:

- profile/contact information;
- saved delivery information;
- account state.

Every mutation must be authorization-checked and backend-confirmed.

---

## ACC-ADM-CUS-005 — Account state management

If the domain supports account states such as active/disabled, authorized administrators can perform defined transitions.

The UI must:

- show current state;
- show only valid actions;
- explain consequence;
- refresh canonical state after success.

Do not invent states beyond the domain contract.

---

## ACC-ADM-CUS-006 — Sensitive/destructive operations

Deletion, privacy erasure, or irreversible state changes require:

- explicit permission;
- consequence explanation;
- confirmation;
- backend-confirmed success;
- audit evidence where the platform supports auditing.

---

# 14. Admin — Administrator access

This section applies only where GRIP currently supports managing Admin principals.

## ACC-ADM-ACC-001 — Separate admin principals from customers

Admin identities are managed in a dedicated Admin Access surface.

Do not mix customer rows and admin-principal rows in one generic Users table.

---

## ACC-ADM-ACC-002 — View admin principals

Authorized administrators can view admin principals and their current access state/role according to the access model.

---

## ACC-ADM-ACC-003 — Manage role/access

If RBAC or role assignment exists, authorized administrators can assign/remove supported access according to published permission rules.

No public-style registration or verification flow is required.

---

## ACC-ADM-ACC-004 — Create/provision admin access

If the backend supports administrator provisioning, the Admin surface can expose that operation using the existing credential/provisioning contract.

This SRS does **not** require an email invitation flow.

---

## ACC-ADM-ACC-005 — Last-privileged-admin invariant

If the access model requires at least one top-level administrator, the system must reject any mutation that would remove the final required privileged principal.

The UI should make the invariant visible before submission.

---

# 15. Privacy and data minimization

## ACC-PRV-001

Public users can only access Account data associated with their authenticated identity.

## ACC-PRV-002

Admin customer data access is permission-controlled.

## ACC-PRV-003

The UI should display only data needed for the current task.

## ACC-PRV-004

Secrets and payment credentials are never exposed through Account.

## ACC-PRV-005

Cross-module projections must respect the owning module's authorization rules.

---

# 16. State model

## Public authentication

```text
signed_out
   ↓ sign in success
signed_in
   ↓ sign out
signed_out
```

No OTP/verification states exist in this SRS.

## Saved delivery information

```text
none
  ↓ add
one_or_more
  ↕ edit/default change
one_or_more
  ↓ delete all
none
```

## Checkout consumption

```text
checkout starts
   ↓
authenticated?
├── no  → collect checkout delivery data
└── yes
      ↓
valid saved default?
├── no  → collect checkout delivery data
└── yes → prefill COPY
            ↓
          review/change
            ↓
          order snapshot
```

## Admin customer state

Use only states published by the domain contract.

No generic state names should be invented by design.

---

# 17. Canonical acceptance scenarios

## AS-01 — Existing customer signs in

Given a valid existing account  
When the customer signs in with supported credentials  
Then an authenticated customer session is established.

## AS-02 — Invalid credentials

Given an existing or unknown credential input  
When authentication fails  
Then the user remains signed out  
And no authenticated Account data is exposed.

## AS-03 — Account Overview

Given a signed-in customer  
When they open Account  
Then they can access their personal Account utilities without first entering profile-edit mode.

## AS-04 — Saved delivery information

Given a signed-in customer  
When they open Saved Delivery Information  
Then they can view Account-owned reusable delivery records.

## AS-05 — Checkout default prefill

Given a signed-in customer with a valid default saved delivery entry  
When a delivery checkout is initialized  
Then Checkout can prefill a copy of that entry.

## AS-06 — Checkout edit isolation

Given Checkout was prefilled from Account  
When the customer changes the delivery address in the current checkout  
Then the checkout draft changes  
And the Account saved delivery record remains unchanged unless the customer explicitly requests an Account update.

## AS-07 — Account edit isolation

Given a completed historical order  
When the customer changes their Account delivery information  
Then the historical Order delivery snapshot remains unchanged.

## AS-08 — No saved delivery information

Given a signed-in customer has no saved delivery information  
When they checkout  
Then they can still enter delivery information and continue.

## AS-09 — Multiple saved delivery entries

Given multiple valid saved entries  
When Checkout supports choosing saved delivery information  
Then the customer can select one  
And Checkout consumes a copy.

## AS-10 — Orders from Account

Given a signed-in customer with orders  
When they open My Orders from Account  
Then they can access Order-owned history/detail through the published Order surface.

## AS-11 — Related order action ownership

Given a customer opened an order from Account  
When they need an Order action  
Then the action is performed by the Order-owned flow, not an Account duplicate.

## AS-12 — Saved products from Account

Given saved-product behavior exists  
When the signed-in customer opens Saved Products from Account  
Then the data/actions are provided by the owning Catalog/Engagement contract.

## AS-13 — Checkout sign-in return

Given a customer begins sign-in from Checkout  
When authentication succeeds  
Then the customer returns to the same Checkout context rather than Account Overview.

## AS-14 — Admin customer lookup

Given an authorized operator  
When they search using a supported human identifier  
Then matching customer accounts can be located without requiring an internal ID.

## AS-15 — Admin customer detail

Given an authorized operator opens a customer  
Then Account-owned profile/delivery information can be viewed according to permissions  
And related Orders are projections/links only.

## AS-16 — Unauthorized admin mutation

Given an authenticated Admin principal without required permission  
When they attempt a restricted account mutation  
Then the operation is rejected.

## AS-17 — Historical order integrity after admin edit

Given an administrator edits a customer's Account delivery information  
Then prior Order delivery snapshots remain unchanged.

## AS-18 — Admin access separation

Given the Admin Console has customer and administrator identities  
Then customer administration and admin-access management are distinct surfaces.

## AS-19 — Final privileged admin protection

Given the platform requires at least one privileged administrator  
When an action would remove the final one  
Then the system rejects the transition and explains the required next action.

---

# 18. Cross-module contract requirements

## Account → Checkout

Expose only the published read model required to obtain:

- customer profile/contact data needed by checkout;
- saved delivery entries;
- default saved delivery reference where supported.

## Checkout → Account

Optional explicit mutation only for:

- save new delivery information;
- update Account delivery information;

and only when the product actually implements that user action.

No implicit persistence from arbitrary checkout edits.

## Account → Order

Account consumes Order-provided personal order projections or navigation contracts.

## Account → Saved products owner

Account consumes only the owning module's published saved-product read/actions.

---

# 19. SRS invariants

These must never break:

```text
1. Customer session != Admin authorization.
2. Account profile change never rewrites historical Order snapshots.
3. Checkout prefill is copy semantics, not shared mutable state.
4. Checkout remains possible without saved Account delivery information.
5. Cross-module projections do not transfer domain ownership to Account.
6. Admin cannot see or set a customer's credential secret.
7. Sensitive Admin mutations require backend authorization.
8. No OTP, public self-registration or registration-verification flow is part of current scope.
```

---

# 20. Final module definition

The current Account module is:

```text
Account
├── Sign in / Sign out
├── Account overview
├── Personal information
├── Saved delivery information
│   └── reusable by Checkout
├── My Orders
│   └── Order-owned
├── Saved products
│   └── owning-module controlled
├── Login & security
└── Admin
    ├── Customer accounts
    └── Admin access
```

Its product value is:

> remember stable customer context once, reuse it safely across future shopping tasks.
