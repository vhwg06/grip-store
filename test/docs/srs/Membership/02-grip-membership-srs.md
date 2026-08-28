# GRIP Membership — Business / Domain SRS

**Status:** Final  
**Pipeline stage:** MEM-02 — GRIP SRS / Business-Domain Decision  
**Research input:** `01-grip-membership-reference-research.md`

## 1. Purpose

Membership extends the existing Account model so an individual Account can act in a business context.

Core distinction:

```text
Account
= individual identity

Membership
= relationship between an Account and a Business
```

Membership does not replace Account and does not own authentication.

## 2. Product goal

For a Vietnamese SME, Membership should make these jobs easy:

```text
create / represent a business
invite a colleague
know who can manage the business
remove or change a member safely
buy under the business identity
```

The product must not feel like enterprise IAM.

## 3. Current scope

```text
Membership
├── Business
├── BusinessMember
├── Owner
├── Admin
├── Member
├── Invitation
└── BusinessContext
```

## 4. Business

A Business is the shared SME/company identity.

Minimum business profile:

```text
id
name
status
created_at
updated_at
```

Additional stable business fields may be added only when another accepted GRIP capability requires them.

Do not pre-emptively add tax/billing/company-registration fields without a concrete purchasing requirement.

## 5. BusinessMember

A BusinessMember links one Account to one Business.

```text
BusinessMember
├── business_ref
├── account_ref
├── role
├── status
└── joined_at
```

A single Account may belong to more than one Business unless a later product rule narrows this.

The UI must not force a global business switcher when the user belongs to only one Business.

## 6. Roles

V1 roles are deliberately small:

```text
Owner
Admin
Member
```

### Owner

Owner is the primary responsible business member.

Owner can:

```text
manage business profile
invite members
change member roles
remove members
transfer ownership
close/deactivate the business membership context when allowed
```

A Business must have exactly one Owner in V1.

### Admin

Admin can:

```text
manage business profile
invite members
change Member/Admin roles
remove non-Owner members
```

Admin cannot transfer ownership or remove the Owner.

### Member

Member can:

```text
view business context
use business context in supported commerce journeys
view their own business-linked activity where exposed
```

Member cannot manage other people.

## 7. Ownership transfer

Ownership transfer is explicit.

```text
current Owner
→ select existing Admin/Member
→ confirm consequence
→ new Owner
→ previous Owner becomes Admin by default
```

The product must never create a Business with no Owner.

## 8. Invitation

An Owner or Admin can invite a colleague by email.

Invitation contains:

```text
business_ref
email
intended_role: Admin | Member
status
created_at
expires_at?
```

V1 does not support inviting someone directly as Owner.

Rules:

- only one active invitation for the same normalized email + Business;
- accepted invitation creates or links the BusinessMember relationship after the user is authenticated through Account;
- rejecting/expiring an invitation does not create membership;
- invitation acceptance must not create a second personal Account if the person already has one.

Exact public account provisioning remains Account-owned.

## 9. Member lifecycle

```text
Invited
→ Active
→ Removed
```

Removal affects future business access only.

It must not delete the person's Account or rewrite historical Orders.

## 10. Business status

V1 Business status:

```text
Active
Inactive
```

Inactive business context cannot be selected for new business purchases.

Historical business-linked Orders remain readable according to Order access rules.

## 11. Account relationship

Account remains authoritative for:

```text
sign in
personal profile
personal contact data
saved personal delivery information
security
```

Membership stores references to Account identity, not copies of personal profile truth.

Required invariant:

```text
editing Account profile
≠ changing Business membership role
```

and:

```text
removing Business membership
≠ deleting Account
```

## 12. Promotions relationship

Membership can become an eligibility input for Promotions.

Example future/current pattern:

```text
business member context
→ eligible business/member offer
```

Membership owns the relationship/role truth.

Promotions owns the offer/discount semantics.

Membership must not implement pricing rules or a wholesale price list.

## 13. Checkout relationship

Checkout may consume an explicit BusinessContext when the buyer chooses to purchase for a Business.

Conceptually:

```text
signed-in Account
+ active BusinessMember
→ choose/use BusinessContext
→ Checkout
```

Membership does not own cart, totals, payment, or order placement.

## 14. Order relationship

Order may preserve a business-purchase snapshot/reference when a placed purchase used BusinessContext.

Order remains authoritative for the purchase itself.

Membership changes later must not rewrite historical Orders.

Required invariant:

```text
member removed later
≠ past business Order ownership/history changes
```

## 15. Business Solutions relationship

Business Solutions may require an active BusinessContext.

Membership provides:

```text
which Business?
which Account is acting?
what role do they have?
```

Business Solutions owns consultation/proposal/quotation workflow.

## 16. Public use cases

```text
View my business membership
Create business context when supported
View business profile
Invite colleague
Accept invitation
View members
Change member role
Remove member
Transfer ownership
Use business context for supported shopping flows
```

Actions are available only when role permits them.

## 17. Admin/operator use cases

GRIP internal operators may:

```text
find a Business
inspect business profile
inspect membership relationships
inspect owner/admin/member roles
support safe state corrections when product policy allows
```

Internal GRIP Admin users are not Business Admin users.

Required separation:

```text
GRIP Admin identity
≠ Business Owner/Admin/Member
```

## 18. Explicit exclusions

```text
SSO
SCIM
directory sync
custom roles
custom permissions
organization hierarchy
departments
cost centers
purchase approval chains
company credit
wholesale price lists
loyalty points
business CRM
employee HR data
complex invitation policy
mandatory global business switcher
```

## 19. Core invariants

### MEM-I01
Account identity and Business identity are separate concepts.

### MEM-I02
A Business has exactly one Owner in V1.

### MEM-I03
Removing a member never deletes their Account.

### MEM-I04
Membership edits never rewrite historical Orders.

### MEM-I05
A Member cannot manage other members.

### MEM-I06
Admin cannot remove or replace the Owner except through the explicit ownership-transfer flow performed by the Owner.

### MEM-I07
Inactive Business context cannot be used for new business purchases.

### MEM-I08
Membership does not own promotion/pricing rules.

## 20. Final product position

Membership is a thin business-context layer over Account:

```text
person
→ relationship to SME
→ role
→ business-aware GRIP journeys
```

It should solve collaboration and business identity without importing enterprise account-management complexity.