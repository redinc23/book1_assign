# MANGU Book OS — Point of Sale (POS)
# Functional Requirements Document (FRD)

| Field | Value |
|---|---|
| Document ID | `MANGU-POS-FRD-1.0` |
| Version | 1.0.0 |
| Status | Implementation Binding |
| Parent | `01-BRD-MANGU-POS.md` |
| Companion | `03-TECH-SPEC-MANGU-POS.md` |
| Last Updated | 2026-07-19 |

---

## 0. How to use this FRD

1. Every **FR-*** is testable.  
2. Every FR maps to one or more **BR-*** / **RL-***.  
3. Acceptance criteria use Given/When/Then.  
4. UI screens use **SCR-*** IDs.  
5. Permissions use **PERM-***.  
6. Use cases use **UC-***.  
7. Engineers implement against FR + Tech Spec; QA writes cases 1:1 from AC.

### Priority legend
`P0` = MVP blocker · `P1` = v1 complete · `P2` = v1.1/v1.2 · `P3` = v2

### FR ID format
`FR-<AREA>-<nnn>` where AREA ∈ LOC REG SHF CAT CART PRC TAX PAY INV FUL CUS RET GFT EVT B2B RCP RPT SEC OFF HW INT UI NOT CFG

---

## 1. System context & actors

### 1.1 Actors
Cashier, Senior Cashier, Store Manager, Inventory Operator, Events Lead, Finance User, Sales Manager, Admin, Customer (passive), Stripe (external), Tax Adapter (external), Print Bridge (external), AI Suggestor (optional, non-mutating).

### 1.2 External systems
Supabase Auth, Stripe Payments/Terminal/Webhooks, Email/SMS provider, Browser Print, Optional accounting export, Book OS Pricing/Catalog/Inventory services (may be same DB).

### 1.3 Modes
- **Lane Mode** — fullscreen register UI  
- **Back Office Mode** — config, reports, inventory, events  
- **Training Mode** — watermarked, isolated  
- **Offline Lane Mode** — degraded tenders  

---

## 2. Information architecture (screens)

| ID | Screen | Mode | Primary users |
|---|---|---|---|
| SCR-001 | POS Home / Register Picker | Lane | Cashier, Manager |
| SCR-002 | Shift Open | Lane | Cashier, Manager |
| SCR-003 | Sell (Cart) | Lane | Cashier |
| SCR-004 | Catalog Search / Scan | Lane | Cashier |
| SCR-005 | Customer Attach | Lane | Cashier |
| SCR-006 | Discounts & Coupons | Lane | Cashier, Manager |
| SCR-007 | Tender / Pay | Lane | Cashier |
| SCR-008 | Receipt | Lane | Cashier |
| SCR-009 | Sale Suspend / Recall | Lane | Cashier |
| SCR-010 | Returns / Exchanges | Lane | Cashier, Manager |
| SCR-011 | Shift Close / Cash Count | Lane | Cashier, Manager |
| SCR-012 | X/Z Report View | Lane/BO | Manager, Finance |
| SCR-013 | Manager Approval Modal | Lane | Manager |
| SCR-014 | Offline Banner + Sync Center | Lane | Cashier, Manager |
| SCR-020 | Locations Admin | BO | Admin |
| SCR-021 | Registers & Hardware | BO | Admin |
| SCR-022 | Assortment & Quick Keys | BO | Manager, Admin |
| SCR-023 | Pricing & Promotions Admin | BO | Sales Mgr, Admin |
| SCR-024 | Tax Config | BO | Finance, Admin |
| SCR-025 | Inventory Overview | BO | Ops |
| SCR-026 | Transfers & Kits | BO | Ops, Events |
| SCR-027 | Cycle Count | BO | Ops |
| SCR-028 | Customers & Accounts | BO | Sales, Finance |
| SCR-029 | Gift Card Admin | BO | Finance |
| SCR-030 | Events Console | BO | Events Lead |
| SCR-031 | Event Live Sell-Through | BO/Lane | Events, Manager |
| SCR-032 | Reports Hub | BO | Finance, Sales, Exec |
| SCR-033 | Settlement Packet | BO | Finance |
| SCR-034 | Audit Log Viewer | BO | Admin, Finance |
| SCR-035 | Permissions & Staff | BO | Admin |
| SCR-036 | Sale Detail | BO/Lane | All permitted |
| SCR-037 | B2B Invoice Desk | BO | Sales |
| SCR-038 | Device Setup Wizard | BO | Admin |
| SCR-039 | Training Mode Toggle | Lane | Manager |
| SCR-040 | Conflict Resolution Queue | BO | Manager, Ops |

---

## 3. Global functional requirements

| ID | Requirement | Pri | BR | AC |
|---|---|---|---|---|
| FR-UI-001 | Lane Mode shall be usable in landscape tablet ≥1024px width with touch targets ≥44px. | P0 | NFR-009 | AC-UI-001 |
| FR-UI-002 | All destructive money actions require confirmation or manager challenge per rules. | P0 | BR-310 | AC-UI-002 |
| FR-UI-003 | System shall show clear blocking errors with recovery actions (retry, remove line, call manager). | P0 | BR-005 principle | AC-UI-003 |
| FR-UI-004 | Keyboard wedge scan shall focus-safe: scans never type into discount fields unintentionally (scan buffer). | P0 | BR-350 | AC-UI-004 |
| FR-UI-005 | Every Lane screen shows Register code, Location, Cashier, Shift id, Online/Offline. | P0 | BR-330 | AC-UI-005 |
| FR-UI-006 | Training Mode watermark “TRAINING — NOT LIVE” on UI + receipts. | P1 | BR-059 | AC-UI-006 |
| FR-NOT-001 | Managers receive in-app notifications for variance, sync conflict, low stock, chargeback. | P1 | BR-143, BR-334 | AC-NOT-001 |
| FR-CFG-001 | Workspace feature flag `pos_enabled` gates all POS routes. | P0 | BR-069 | AC-CFG-001 |
| FR-CFG-002 | Config changes that affect price/tax require Finance or Admin permission. | P0 | BR-310 | AC-CFG-002 |

### AC samples (global)
**AC-UI-004**  
Given cashier is in Tender amount field  
When a barcode is scanned  
Then the system treats it as product scan or rejects as invalid in this context, and does not append digits into amount.

**AC-CFG-001**  
Given `pos_enabled=false`  
When user opens `/pos`  
Then access denied with support message.

---

## 4. Use cases (selected, detailed)

### UC-001 Quick B2C sale (happy path)
**Actors:** Cashier, Customer, Stripe  
**Preconditions:** Shift open; online; SKU in assortment with stock  
**Flow:**
1. Cashier scans ISBN  
2. System adds line at resolved price + tax preview  
3. Cashier optionally attaches customer email  
4. Cashier taps Pay  
5. System soft-reserves stock; creates sale `pending_payment`  
6. Customer pays card on Terminal  
7. Stripe webhook/confirm → capture  
8. System commits stock, finalizes sale, prints/emails receipt  
9. Sales Engine event emitted  
**Postconditions:** Stock decremented; payment ledger captured; receipt available  
**Alt:** Card declined → cart remains; reservation timer continues  
**BR:** BR-050, BR-103, BR-130, BR-280, BR-370

### UC-002 Offline cash sale
1. Register detects offline  
2. Cashier sells cash-only SKU (non-digital)  
3. Sale stored in local encrypted queue with local uuid  
4. On reconnect, sync commits idempotently  
5. Conflicts surface in SCR-040  
**BR:** BR-330–343

### UC-003 Manager void before capture
1. Payment pending stuck  
2. Manager approves void  
3. PaymentIntent cancelled; reservation released; audit written  
**BR:** RL-005, BR-205

### UC-004 Return with original receipt
1. Lookup sale by QR/receipt id  
2. Select lines/qty  
3. Reason code  
4. Refund to original tender  
5. Restock  
**BR:** BR-190–207

### UC-005 Event kit lifecycle
See BRD Appendix C — fully supported by FR-EVT-*  

### UC-006 B2B invoice sale
1. Select B2B account  
2. Wholesale prices apply  
3. PO captured  
4. Tender `invoice_account`  
5. Invoice PDF generated; credit updated  
**BR:** BR-260–279

### UC-007 Gift card sell + later redeem
1. Sell gift card SKU variable amount  
2. Activate code after capture  
3. Later cart redeem partial balance  
**BR:** BR-210–222

### UC-008 Split tender gift card + cash
Per RL-001/028  

### UC-009 Parked cart recall
Cashier parks cart, later recalls by code  

### UC-010 Exchange wrong format
Return paperback + sell hardcover linked exchange  

---

## 5. Permissions catalog (PERM)

| ID | Capability | Cashier | Sr Cashier | Manager | Ops | Finance | Admin |
|---|---|---|---|---|---|---|---|
| PERM-001 | pos.access | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-002 | pos.sale.create | ✓ | ✓ | ✓ | | | ✓ |
| PERM-003 | pos.sale.park | ✓ | ✓ | ✓ | | | ✓ |
| PERM-004 | pos.discount.manual.low | ✓ | ✓ | ✓ | | | ✓ |
| PERM-005 | pos.discount.manual.high | | ✓ | ✓ | | | ✓ |
| PERM-006 | pos.price.override | | | ✓ | | | ✓ |
| PERM-007 | pos.void | | ✓ | ✓ | | | ✓ |
| PERM-008 | pos.refund.create | | ✓ | ✓ | | | ✓ |
| PERM-009 | pos.refund.approve.high | | | ✓ | | ✓ | ✓ |
| PERM-010 | pos.nosale | ✓ | ✓ | ✓ | | | ✓ |
| PERM-011 | pos.shift.open | ✓ | ✓ | ✓ | | | ✓ |
| PERM-012 | pos.shift.close | ✓ | ✓ | ✓ | | | ✓ |
| PERM-013 | pos.shift.approve_variance | | | ✓ | | ✓ | ✓ |
| PERM-014 | pos.inventory.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-015 | pos.inventory.transfer | | | ✓ | ✓ | | ✓ |
| PERM-016 | pos.inventory.adjust | | | ✓ | ✓ | | ✓ |
| PERM-017 | pos.event.manage | | | ✓ | ✓ | | ✓ |
| PERM-018 | pos.reports.view | | ✓ | ✓ | ✓ | ✓ | ✓ |
| PERM-019 | pos.reports.finance | | | | | ✓ | ✓ |
| PERM-020 | pos.config.tax | | | | | ✓ | ✓ |
| PERM-021 | pos.config.hardware | | | ✓ | | | ✓ |
| PERM-022 | pos.config.promo | | | ✓ | | | ✓ |
| PERM-023 | pos.customer.pii.view | ✓* | ✓* | ✓ | | ✓ | ✓ |
| PERM-024 | pos.b2b.credit.manage | | | | | ✓ | ✓ |
| PERM-025 | pos.giftcard.issue | ✓ | ✓ | ✓ | | ✓ | ✓ |
| PERM-026 | pos.giftcard.transfer | | | ✓ | | ✓ | ✓ |
| PERM-027 | pos.training.toggle | | | ✓ | | | ✓ |
| PERM-028 | pos.audit.view | | | ✓ | | ✓ | ✓ |
| PERM-029 | pos.conflict.resolve | | | ✓ | ✓ | | ✓ |
| PERM-030 | pos.force.negative_stock | | | ✓ | ✓ | | ✓ |

\* masked email/phone OK; full history may be limited

---

## AREA LOC: Locations

Manage commercial locations that sell or stock goods.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-LOC-001 | Admin can create a location with type, name, code, timezone, currency, address, tax profile link. | P0 | BR-010, BR-017 | SCR-020 |
| FR-LOC-002 | Location codes unique per workspace. | P0 | BR-010 | SCR-020 |
| FR-LOC-003 | Location can be archived; archived locations cannot open shifts. | P0 | BR-014 | SCR-020 |
| FR-LOC-004 | Location flags: `allows_ship`, `allows_pickup`, `allows_event`, `allows_b2b`. | P1 | BR-017 | SCR-020 |
| FR-LOC-005 | Event-type location requires schedule fields. | P2 | BR-016 | SCR-020, SCR-030 |
| FR-LOC-006 | Default receipt header/footer templates selectable per location. | P1 | BR-281 | SCR-020 |
| FR-LOC-007 | Assortment mode: `all_active` or `explicit_list`. | P1 | BR-030 | SCR-022 |
| FR-LOC-008 | Stock source default location configurable (self or warehouse). | P1 | BR-018 | SCR-020 |
| FR-LOC-009 | Location timezone used for promo windows and reports. | P0 | BR-077, BR-308 | SCR-020 |
| FR-LOC-010 | Users can be assigned to locations (ACL). | P0 | BR-322 | SCR-035 |

### Acceptance criteria

**AC-LOC-001** Given Admin on SCR-020 When they create location type `retail_store` with valid fields Then location appears in Register Picker.

**AC-LOC-003** Given archived location When cashier tries Shift Open Then system blocks with reason `location_archived`.

**AC-LOC-009** Given promo ending 17:00 America/New_York and location TZ that zone When local time 17:01 Then promo no longer auto-applies.


## AREA REG: Registers

Logical selling endpoints with hardware profiles.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-REG-001 | Admin creates register under location with unique register_code. | P0 | BR-012 | SCR-021 |
| FR-REG-002 | Register states enforced: decommissioned/inactive/closed/open/suspended. | P0 | BR-014 | SCR-021, SCR-001 |
| FR-REG-003 | Hardware profile stores scanner type, printer name, drawer kick, Stripe location/reader ids. | P0 | BR-013 | SCR-021, SCR-038 |
| FR-REG-004 | Only one open shift per register. | P0 | BR-015 | SCR-002 |
| FR-REG-005 | Kiosk lock mode pin available. | P2 | BR-364 | SCR-001 |
| FR-REG-006 | Register can be suspended by Manager; selling blocked. | P1 | BR-014, RL-046 | SCR-001 |
| FR-REG-007 | Device binding optional: browser fingerprint/device id. | P2 | BR-325 | SCR-038 |
| FR-REG-008 | Register picker shows online health + reader battery if known. | P2 | BR-358, BR-360 | SCR-001 |
| FR-REG-009 | Training flag can be forced on a register. | P1 | BR-059 | SCR-039 |
| FR-REG-010 | Decommissioned registers hidden from cashiers. | P0 | BR-014 | SCR-001 |

### Acceptance criteria

**AC-REG-004** Given register has open shift When another user attempts Shift Open on same register Then error `shift_already_open`.

**AC-REG-006** Given suspended register When cashier opens Sell Then blocked with Manager contact CTA.


## AREA SHF: Shifts & Cash Control

Accountability period for cash and lane activity.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-SHF-001 | Shift Open captures opening_float, cashier_id, register_id, opened_at. | P0 | BR-020 | SCR-002 |
| FR-SHF-002 | Cashier cannot sell without open shift on selected register. | P0 | RL-014 | SCR-003 |
| FR-SHF-003 | Paid In / Paid Out creates cash movement with reason codes. | P0 | BR-022 | SCR-003 |
| FR-SHF-004 | No-sale opens drawer and logs reason; enforces RL-045 limits. | P0 | BR-026 | SCR-003 |
| FR-SHF-005 | X-Report shows current totals without closing. | P0 | BR-023 | SCR-012 |
| FR-SHF-006 | Z-Report closes shift, freezes totals, requires cash count if cash used. | P0 | BR-023, BR-024 | SCR-011 |
| FR-SHF-007 | Expected cash computed from float + cash sales − change − paid out + paid in − cash refunds. | P0 | BR-021 | SCR-011 |
| FR-SHF-008 | Counted cash entry; variance calculated; threshold triggers manager approval. | P0 | BR-025 | SCR-011, SCR-013 |
| FR-SHF-009 | Blind close hides expected cash when configured. | P1 | BR-027 | SCR-011 |
| FR-SHF-010 | Abandoned shift alert after N hours. | P1 | BR-029 | SCR-014, NOT |
| FR-SHF-011 | Cashier switch mid-shift records steward changes without closing. | P1 | BR-316 | SCR-003 |
| FR-SHF-012 | Z-closed shift immutable; corrections via adjusting documents only. | P0 | RL-015, RL-030 | SCR-012 |
| FR-SHF-013 | Shift lists tenders breakdown and void/refund counts. | P0 | BR-290 | SCR-012 |
| FR-SHF-014 | Opening float max validated. | P1 | BR-020 | SCR-002 |
| FR-SHF-015 | Manager can force-close crashed shift with reason. | P1 | BR-029 | SCR-011 |

### Acceptance criteria

**AC-SHF-007** Given float 200, cash sales 100, change given 13, paid out 5 When close Then expected cash = 282.

**AC-SHF-008** Given variance threshold $5 and variance $8 When cashier submits close Without manager approval Then close rejected.


## AREA CAT: Catalog & SKU Resolution

Finding and validating sellable products.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-CAT-001 | Scan EAN/UPC/ISBN resolves to SKU; if multiple editions, show disambiguation with cover/format/price/stock. | P0 | BR-033 | SCR-004 |
| FR-CAT-002 | Search supports title, author, ISBN, SKU, series; debounced; shows top 25. | P0 | BR-034 | SCR-004 |
| FR-CAT-003 | Product tile shows title, format, ISBN, price, stock at selling source, sellability badge. | P0 | BR-035 | SCR-004 |
| FR-CAT-004 | Blocked SKUs cannot add; toast explains gate failed (rights, recall, inactive). | P0 | BR-036, RL-020 | SCR-004 |
| FR-CAT-005 | Quick keys grid configurable per location. | P1 | BR-063 | SCR-022, SCR-003 |
| FR-CAT-006 | Bundle SKUs show component breakdown on detail. | P0 | BR-038 | SCR-004 |
| FR-CAT-007 | Digital SKUs show `digital` badge and delivery method. | P0 | BR-039 | SCR-004 |
| FR-CAT-008 | Assortment filtering hides out-of-assortment SKUs in lane search (manager can view all with override). | P1 | BR-030 | SCR-004 |
| FR-CAT-009 | Preorder SKUs show expected date and require acknowledge. | P1 | BR-037 | SCR-004 |
| FR-CAT-010 | Catalog offline cache includes assortment + prices + stock snapshot timestamp. | P0 | BR-335 | OFF |
| FR-CAT-011 | Force refresh catalog action for Manager. | P1 | BR-335 | SCR-003 |
| FR-CAT-012 | Merch can display linked Book/Series name. | P2 | BR-040 | SCR-004 |
| FR-CAT-013 | Age restriction badge visible. | P1 | BR-052 | SCR-004 |
| FR-CAT-014 | Barcode manual entry keypad. | P0 | BR-362 | SCR-004 |
| FR-CAT-015 | Recently sold / favorites strip. | P2 | BR-063 | SCR-003 |

### Acceptance criteria

**AC-CAT-001** Given two paperbacks same ISBN-13 different editions When scanned Then disambiguation list shown; no silent pick.

**AC-CAT-004** Given rights_blocked edition When add attempted Then line not added; reason `rights_blocked`.


## AREA CART: Cart & Selling

Building the commercial document before payment.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-CART-001 | Add SKU creates line with qty 1 or increments existing identical line (same attributes). | P0 | BR-064 | SCR-003 |
| FR-CART-002 | Lines store sku_id, qty, unit_price, discounts, tax, attributes{signed, inscription}. | P0 | BR-050 | SCR-003 |
| FR-CART-003 | Qty edit validates max and stock. | P0 | BR-051, BR-133 | SCR-003 |
| FR-CART-004 | Remove line allowed before payment start. | P0 | BR-061 | SCR-003 |
| FR-CART-005 | Running totals: subtotal, discount, tax, total, savings. | P0 | BR-062 | SCR-003 |
| FR-CART-006 | Age confirm modal if any restricted line. | P1 | BR-052, RL-023 | SCR-003 |
| FR-CART-007 | Park cart generates reclaim code; parks expire after TTL. | P1 | BR-054 | SCR-009 |
| FR-CART-008 | Recall parked cart locks to register or allows cross-register per config. | P1 | BR-054 | SCR-009 |
| FR-CART-009 | Signed toggle only for print SKUs. | P2 | RL-034 | SCR-003 |
| FR-CART-010 | Inscription text max 120 chars. | P2 | RL-033 | SCR-003 |
| FR-CART-011 | Cashier note internal; customer note optional on receipt. | P1 | BR-053 | SCR-003 |
| FR-CART-012 | Revalidate price/stock/tax on Pay. | P0 | BR-055 | SCR-007 |
| FR-CART-013 | Employee purchase toggle applies staff price list if permitted. | P1 | BR-068 | SCR-003 |
| FR-CART-014 | Cart value max enforced. | P0 | BR-051 | SCR-003 |
| FR-CART-015 | Mixed fulfillment badges per line. | P1 | BR-155 | SCR-003 |
| FR-CART-016 | Clear cart requires confirm if >0 lines. | P0 | FR-UI-002 | SCR-003 |
| FR-CART-017 | Line price trace viewable by Manager. | P0 | BR-089 | SCR-003, SCR-013 |
| FR-CART-018 | Cannot edit cart after pending_payment except cancel/void path. | P0 | BR-061 | SCR-007 |
| FR-CART-019 | Duplicate digital unique items cannot increment; must be separate allocation. | P0 | BR-064 | SCR-003 |
| FR-CART-020 | Tax-inclusive display mode formats totals correctly. | P1 | BR-095 | SCR-003 |

### Acceptance criteria

**AC-CART-001** Given cart has paperback qty 1 When same ISBN scanned again without special attributes Then qty becomes 2.

**AC-CART-012** Given price changed after add When Pay Then cashier sees price-change modal and must accept new price or remove line.


## AREA PRC: Pricing & Promotions

Resolve and apply commercial prices and promos.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-PRC-001 | On line add, system resolves price via price list + channel + timed promo. | P0 | BR-070, BR-071 | SCR-003 |
| FR-PRC-002 | Coupon entry validates code, dates, location, usage. | P0 | BR-074 | SCR-006 |
| FR-PRC-003 | Automatic event promos apply without code when event active. | P2 | BR-075 | SCR-003 |
| FR-PRC-004 | Manual % or amount discount checks role caps; else manager challenge. | P0 | BR-076, RL-004 | SCR-006, SCR-013 |
| FR-PRC-005 | Promo exclusivity groups enforced. | P0 | BR-073, RL-039 | SCR-006 |
| FR-PRC-006 | BOGO engine computes free/discounted lines visibly. | P1 | BR-072 | SCR-003 |
| FR-PRC-007 | Bundle fixed price overrides component sum; components still listed for stock. | P0 | BR-038, BR-072 | SCR-003 |
| FR-PRC-008 | MAP violation requires manager. | P1 | BR-079 | SCR-013 |
| FR-PRC-009 | Comp 100% requires reason; manager if over threshold. | P0 | RL-040 | SCR-006 |
| FR-PRC-010 | Price override sets absolute unit price with reason + audit. | P0 | BR-060 | SCR-013 |
| FR-PRC-011 | Savings total displayed to customer-facing area if CFD enabled (v2) and on cart. | P1 | BR-062 | SCR-003 |
| FR-PRC-012 | Promotion redemption increments counters atomically. | P0 | BR-084 | API |
| FR-PRC-013 | Staff discount cannot apply to gift cards. | P0 | RL-022 | SCR-003 |
| FR-PRC-014 | Back office promo CRUD with schedule & scope. | P1 | BR-072 | SCR-023 |
| FR-PRC-015 | Price trace JSON persisted on each line at finalization. | P0 | BR-089 | API |
| FR-PRC-016 | Wholesale/educational lists only when customer qualifies. | P2 | BR-086, BR-087 | SCR-003, SCR-037 |
| FR-PRC-017 | Flash sale freeze toggle for events. | P2 | BR-246 | SCR-030 |
| FR-PRC-018 | Damaged discount can flag inventory condition on fulfill. | P1 | BR-083 | SCR-003 |

### Acceptance criteria

**AC-PRC-004** Given cashier max discount 5% When they apply 10% Then Manager Approval Modal required; without it discount not applied.

**AC-PRC-005** Given two exclusive promos When both would apply Then only higher-priority promo applies; other shown as `not_stacked`.


## AREA TAX: Tax Calculation

Compute and display statutory tax.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-TAX-001 | Tax engine computes per-line tax given location jurisdiction + tax class + taxable base. | P0 | BR-090, RL-010 | SCR-003 |
| FR-TAX-002 | Receipt and sale store tax lines with jurisdiction id, rate, amount. | P0 | BR-094 | SCR-008 |
| FR-TAX-003 | Tax-exempt account zeroes eligible taxes and stores certificate id. | P2 | BR-093 | SCR-037 |
| FR-TAX-004 | Digital goods tax class rules applied. | P0 | BR-091, BR-092 | API |
| FR-TAX-005 | Admin CRUD for rates/jurisdictions with effective dating. | P0 | BR-090 | SCR-024 |
| FR-TAX-006 | Adapter interface `TaxProvider` with `BuiltinTablesProvider` default. | P1 | BR-096 | Tech |
| FR-TAX-007 | Return reverses original tax amounts proportionally. | P0 | BR-097 | SCR-010 |
| FR-TAX-008 | Inclusive pricing mode derives net + tax components. | P1 | BR-095 | SCR-003 |
| FR-TAX-009 | Finance tax summary report by period. | P0 | BR-099 | SCR-032 |
| FR-TAX-010 | Misconfig self-test: sample cart calculator in admin. | P1 | BR-090 | SCR-024 |

### Acceptance criteria

**AC-TAX-001** Given taxable paperback and 8.25% rate When qty 1 price $16.00 discount $0 Then tax = $1.32 (bankers/half-up per config documented in Tech Spec).

**AC-TAX-007** Given original tax $1.32 on line When full return Then tax reversal -$1.32.


## AREA PAY: Tender & Payments

Collect money and finalize capture.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-PAY-001 | Tender screen shows balance due and applied tenders. | P0 | BR-100 | SCR-007 |
| FR-PAY-002 | Cash tender computes change; opens drawer on complete. | P0 | BR-104, BR-122 | SCR-007 |
| FR-PAY-003 | Card tender starts Stripe PaymentIntent amount=balance; Terminal collect. | P0 | BR-103 | SCR-007 |
| FR-PAY-004 | Split tender allows multiple lines until balance 0. | P0 | BR-102, RL-001 | SCR-007 |
| FR-PAY-005 | Gift card tender redeems up to balance/due. | P0 | BR-110 | SCR-007 |
| FR-PAY-006 | Store credit tender redeems up to balance/due. | P0 | BR-111 | SCR-007 |
| FR-PAY-007 | Other tender requires manager + reference. | P0 | BR-113 | SCR-013 |
| FR-PAY-008 | Idempotency-Key header required on commit endpoints. | P0 | RL-017, BR-107 | API |
| FR-PAY-009 | Payment states follow BR-118; UI reflects. | P0 | BR-118 | SCR-007 |
| FR-PAY-010 | Decline shows cashier-safe message; cart remains. | P0 | BR-116 | SCR-007 |
| FR-PAY-011 | Cancel payment cancels Intent and releases reservation. | P0 | BR-106 | SCR-007 |
| FR-PAY-012 | Webhook handler finalizes capture and is idempotent. | P0 | RL-050, BR-119 | API |
| FR-PAY-013 | Offline cash path writes local sale; card offline only if Terminal offline enabled. | P0 | BR-108, BR-109 | SCR-014 |
| FR-PAY-014 | Currency mismatch rejected. | P0 | RL-035 | SCR-007 |
| FR-PAY-015 | Large cash above threshold requires manager. | P1 | BR-128 | SCR-013 |
| FR-PAY-016 | Minimum card amount enforced. | P1 | BR-127 | SCR-007 |
| FR-PAY-017 | Training mode uses Stripe test mode keys. | P0 | BR-126 | CFG |
| FR-PAY-018 | Payment ledger lines immutable append. | P0 | BR-129 | API |
| FR-PAY-019 | Invoice tender available only for B2B accounts (v1.2). | P2 | BR-101 | SCR-037 |
| FR-PAY-020 | Surcharge display if enabled by region config default off. | P1 | BR-115 | SCR-007 |
| FR-PAY-021 | Partial payments on invoices (v1.2). | P2 | BR-121 | SCR-037 |
| FR-PAY-022 | Chargeback webhook flags sale dispute. | P1 | BR-124 | SCR-036 |
| FR-PAY-023 | Refund to original card creates Stripe refund. | P0 | BR-117 | SCR-010 |
| FR-PAY-024 | Cannot over-tender non-cash. | P0 | BR-112 | SCR-007 |
| FR-PAY-025 | Timeout on Terminal prompts retry/cancel. | P0 | NFR-002 | SCR-007 |

### Acceptance criteria

**AC-PAY-004** Given total $27.50 When tender gift $10 + card $17.50 Then sale captures; ledger has 2 lines; balance 0.

**AC-PAY-008** Given same Idempotency-Key retried on commit When processed twice Then only one sale created.


## AREA INV: Inventory Effects

Stock accuracy for physical & code pools.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-INV-001 | Soft reserve on payment start for physical components. | P0 | BR-131 | API |
| FR-INV-002 | Hard commit on capture; ledger entries written. | P0 | BR-130, BR-148 | API |
| FR-INV-003 | Reservation TTL releases stock; pay must re-reserve. | P0 | BR-132, RL-024 | API |
| FR-INV-004 | Negative stock blocked unless PERM-030 override. | P0 | BR-133 | SCR-003 |
| FR-INV-005 | Transfer document: draft → shipped → received; in_transit qty. | P0 | BR-134 | SCR-026 |
| FR-INV-006 | Cycle count creates adjustment ledger with reason. | P0 | BR-138 | SCR-027 |
| FR-INV-007 | Quarantine bin for damaged. | P0 | BR-137 | SCR-025 |
| FR-INV-008 | Low stock alerts at threshold. | P1 | BR-143 | NOT |
| FR-INV-009 | Digital code pool availability shown; allocate on capture. | P0 | BR-140, BR-039 | API |
| FR-INV-010 | Bundle commit decrements all components atomically. | P0 | BR-141 | API |
| FR-INV-011 | Inventory overview filters by location/SKU/book. | P0 | BR-142 | SCR-025 |
| FR-INV-012 | Receiving light PO receive increments on_hand. | P1 | BR-147 | SCR-026 |
| FR-INV-013 | Bins optional within location. | P1 | BR-146 | SCR-025 |
| FR-INV-014 | Shrink reasons coded. | P0 | BR-139 | SCR-027 |
| FR-INV-015 | Never skip inventory silently for physical SKUs. | P0 | BR-149 | API |
| FR-INV-016 | Stock snapshot for offline cache. | P0 | BR-335 | OFF |
| FR-INV-017 | Conflict queue when offline sync would oversell. | P0 | BR-334 | SCR-040 |

### Acceptance criteria

**AC-INV-002** Given on_hand 5 When sell qty 2 captured Then on_hand 3 and ledger has `-2` reason `sale`.

**AC-INV-010** Given bundle of book+tote When sold Then both SKUs decrement in one transaction.


## AREA FUL: Fulfillment

Post-payment delivery of goods/codes.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-FUL-001 | Default fulfillment `carry_out` for store/event. | P0 | BR-151 | SCR-003 |
| FR-FUL-002 | Per-line fulfillment mode editable before pay. | P0 | BR-150 | SCR-003 |
| FR-FUL-003 | Pickup_later creates fulfillment order with status `awaiting_pickup`. | P1 | BR-152 | SCR-036 |
| FR-FUL-004 | Ship_to_customer requires address + shipping SKU fee. | P1 | BR-153 | SCR-007 |
| FR-FUL-005 | Digital delivery sends codes via email after capture; receipt references. | P0 | BR-154, BR-288 | SCR-008 |
| FR-FUL-006 | Mixed cart allowed. | P0 | BR-155 | SCR-003 |
| FR-FUL-007 | Pickup expiry job restocks. | P1 | BR-157 | API |
| FR-FUL-008 | Fulfillment statuses visible on sale detail. | P0 | BR-161 | SCR-036 |
| FR-FUL-009 | Partial fulfill supported. | P1 | BR-162 | SCR-036 |
| FR-FUL-010 | Customer contact required for ship/digital per config. | P0 | BR-163 | SCR-005 |
| FR-FUL-011 | Signed ship requires verification checkbox. | P2 | BR-160 | SCR-007 |

### Acceptance criteria

**AC-FUL-005** Given ebook SKU When capture succeeds Then code email queued and code marked redeemed/allocated.


## AREA CUS: Customers

Attach commerce identity to sales.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-CUS-001 | Guest checkout allowed. | P0 | BR-170 | SCR-005 |
| FR-CUS-002 | Create/find customer by email/phone/name. | P0 | BR-171 | SCR-005 |
| FR-CUS-003 | Duplicate warning on same email. | P1 | BR-172 | SCR-005 |
| FR-CUS-004 | Marketing opt-in checkbox default unchecked; log consent. | P0 | BR-174 | SCR-005 |
| FR-CUS-005 | Show store credit balance when attached. | P0 | BR-181 | SCR-005 |
| FR-CUS-006 | Purchase history in BO. | P0 | BR-173 | SCR-028 |
| FR-CUS-007 | Privacy anonymize action for Admin/Finance. | P1 | BR-180, BR-327 | SCR-028 |
| FR-CUS-008 | Fast email-only capture mode for events. | P2 | BR-184 | SCR-005 |
| FR-CUS-009 | PII masked without PERM-023 full. | P0 | BR-314 | SCR-028 |
| FR-CUS-010 | Attach/detach customer before payment start. | P0 | BR-170 | SCR-005 |

### Acceptance criteria

**AC-CUS-004** Given opt-in checked When sale completes Then consent record has timestamp, source=`pos_lane`, version of policy text hash.


## AREA RET: Returns & Exchanges

Post-sale reversing flows.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-RET-001 | Lookup sale by id, receipt QR, or last4+amount+date. | P0 | BR-190 | SCR-010 |
| FR-RET-002 | Select returnable lines/qty remaining. | P0 | RL-006 | SCR-010 |
| FR-RET-003 | Reason codes mandatory. | P0 | BR-199 | SCR-010 |
| FR-RET-004 | Refund window enforced by product class. | P0 | BR-191 | SCR-010 |
| FR-RET-005 | Open return path manager-gated. | P0 | BR-192 | SCR-013 |
| FR-RET-006 | Refund tender routing: original → store credit fallback. | P0 | BR-197, BR-117 | SCR-010 |
| FR-RET-007 | Restock or quarantine choice. | P0 | BR-136, BR-137 | SCR-010 |
| FR-RET-008 | Exchange creates linked return+sale atomically. | P0 | BR-193, BR-204 | SCR-010 |
| FR-RET-009 | Digital revealed codes non-returnable default. | P0 | BR-195 | SCR-010 |
| FR-RET-010 | Signed/personalized default non-returnable. | P2 | BR-196 | SCR-010 |
| FR-RET-011 | High refund amount manager approval. | P0 | BR-205 | SCR-013 |
| FR-RET-012 | Emit negative sales events. | P0 | BR-203 | API |
| FR-RET-013 | Restocking fee optional line. | P1 | BR-194 | SCR-010 |
| FR-RET-014 | Cross-location returns if policy on. | P1 | BR-201 | SCR-010 |
| FR-RET-015 | Bundle return integrity rule RL-011. | P0 | RL-011 | SCR-010 |

### Acceptance criteria

**AC-RET-008** Given return paperback and exchange to hardcover When confirmed Then one return doc + one sale doc linked by `exchange_group_id` and net tender collected/refunded.


## AREA GFT: Gift Cards & Store Credit

Stored value liability.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-GFT-001 | Sell gift card denominations or variable within min/max. | P0 | BR-210 | SCR-003 |
| FR-GFT-002 | Code generated unguessable; shown once + printed. | P0 | BR-211 | SCR-008 |
| FR-GFT-003 | Activate only after capture. | P0 | RL-008 | API |
| FR-GFT-004 | Redeem partial balances. | P0 | BR-212 | SCR-007 |
| FR-GFT-005 | Block gift-card-for-gift-card if configured. | P0 | BR-216 | SCR-003 |
| FR-GFT-006 | Store credit issue from return/goodwill with reason. | P0 | BR-213 | SCR-010 |
| FR-GFT-007 | Liability report. | P0 | BR-214 | SCR-032 |
| FR-GFT-008 | Reload path. | P1 | BR-217 | SCR-003 |
| FR-GFT-009 | Lost card transfer manager flow. | P1 | BR-218 | SCR-029 |
| FR-GFT-010 | Offline redeem blocked default. | P0 | RL-012 | SCR-014 |
| FR-GFT-011 | Every balance mutation audited. | P0 | BR-224 | API |
| FR-GFT-012 | Cash-out store credit blocked default. | P0 | RL-021 | SCR-007 |

### Acceptance criteria

**AC-GFT-004** Given card balance $25 When redeem $10 on $40 cart Then balance becomes $15 and due becomes $30.


## AREA EVT: Events & Kits

Publisher signings, booths, pop-ups.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-EVT-001 | Create event with name, location/schedule, campaign link optional, staff. | P2 | BR-230, BR-231 | SCR-030 |
| FR-EVT-002 | Kit template CRUD with SKU qty defaults. | P2 | BR-247 | SCR-030 |
| FR-EVT-003 | Create kit transfer from template; pack checklist. | P2 | BR-232, BR-233 | SCR-026 |
| FR-EVT-004 | Receive kit at event location. | P2 | BR-233 | SCR-026 |
| FR-EVT-005 | Assign registers/readers to event. | P2 | BR-231 | SCR-030 |
| FR-EVT-006 | Live sell-through dashboard by SKU/title. | P2 | BR-234 | SCR-031 |
| FR-EVT-007 | End recon: counted vs expected leftover. | P2 | BR-235, BR-236 | SCR-030 |
| FR-EVT-008 | Return transfer home after recon. | P2 | BR-135 | SCR-026 |
| FR-EVT-009 | Signed + inscription capture on lane. | P2 | BR-056, BR-057 | SCR-003 |
| FR-EVT-010 | Flash promos bound to event window. | P2 | BR-239 | SCR-023 |
| FR-EVT-011 | Event cannot close if open shifts or recon open. | P2 | BR-250, RL-049 | SCR-030 |
| FR-EVT-012 | Event P&L report fields. | P2 | BR-242 | SCR-032 |
| FR-EVT-013 | Offline event mode supported under OFF rules. | P2 | BR-241 | SCR-014 |
| FR-EVT-014 | Damage-at-event workflow to quarantine. | P2 | BR-248 | SCR-025 |
| FR-EVT-015 | Temporary staff expire after event end+grace. | P2 | BR-323 | SCR-035 |
| FR-EVT-016 | Preorder pickup list for event. | P2 | BR-244 | SCR-030 |
| FR-EVT-017 | Signing queue prep list. | P3 | BR-237 | SCR-031 |
| FR-EVT-018 | Sales tagged with event_id and campaign_id. | P2 | BR-251, RL-019 | API |

### Acceptance criteria

**AC-EVT-011** Given open shift on event register When Events Lead clicks Close Event Then blocked listing open shifts.

**AC-EVT-018** Given sale on event register When finalized Then sale.event_id set and analytics dimensions include it.


## AREA B2B: B2B Direct Counter

Wholesale/educational invoiced sales.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-B2B-001 | Create B2B account with terms, credit limit, price list, bill-to/ship-to. | P2 | BR-260, BR-276 | SCR-028 |
| FR-B2B-002 | Credit hold blocks invoice tender. | P2 | BR-176, RL-041 | SCR-037 |
| FR-B2B-003 | PO mandatory when require_po. | P2 | RL-042 | SCR-037 |
| FR-B2B-004 | Wholesale prices apply when account attached. | P2 | BR-087 | SCR-037 |
| FR-B2B-005 | Generate invoice PDF on finalize. | P2 | BR-262 | SCR-037 |
| FR-B2B-006 | Partial payments against invoice. | P2 | BR-264 | SCR-037 |
| FR-B2B-007 | Statements of account. | P2 | BR-268 | SCR-032 |
| FR-B2B-008 | Tax exempt cert stored & applied. | P2 | BR-275 | SCR-028 |
| FR-B2B-009 | Qty breaks / case helpers. | P2 | BR-265, BR-266 | SCR-037 |
| FR-B2B-010 | Quotes printable and convertible. | P2 | BR-067, BR-274 | SCR-037 |
| FR-B2B-011 | Sales rep attribution field. | P2 | BR-273 | SCR-037 |
| FR-B2B-012 | Channel subtype `direct_b2b`. | P2 | BR-279 | API |
| FR-B2B-013 | RMA returns. | P2 | BR-272 | SCR-010 |
| FR-B2B-014 | Accounting export adapter. | P2 | BR-278 | SCR-033 |
| FR-B2B-015 | Offline invoice tender blocked if credit check required. | P2 | BR-337 | SCR-014 |

### Acceptance criteria

**AC-B2B-002** Given account credit remaining $100 When invoice cart $150 Then tender blocked `credit_exceeded`.


## AREA RCP: Receipts & Documents

Customer and legal documents.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-RCP-001 | Generate thermal receipt layout. | P0 | BR-280 | SCR-008 |
| FR-RCP-002 | Email receipt with HTML + plain. | P0 | BR-280 | SCR-008 |
| FR-RCP-003 | SMS link receipt optional. | P1 | BR-280 | SCR-008 |
| FR-RCP-004 | Mandatory fields per BR-281. | P0 | BR-281 | SCR-008 |
| FR-RCP-005 | Gift receipt hides prices. | P1 | BR-282 | SCR-008 |
| FR-RCP-006 | Reprint watermarks REPRINT. | P0 | BR-283 | SCR-036 |
| FR-RCP-007 | QR encodes sale lookup token. | P1 | BR-287 | SCR-008 |
| FR-RCP-008 | Digital codes section + secure email. | P0 | BR-288 | SCR-008 |
| FR-RCP-009 | Localized templates. | P1 | BR-285 | SCR-020 |
| FR-RCP-010 | Invoice/packing slip for ship/B2B. | P2 | BR-284 | SCR-037 |
| FR-RCP-011 | Return policy URL printed. | P0 | BR-281 | SCR-008 |
| FR-RCP-012 | Document retention & storage in Supabase Storage. | P0 | BR-289 | Tech |

### Acceptance criteria

**AC-RCP-006** Given completed sale When reprint Then new print has REPRINT and no new sale id.


## AREA RPT: Reporting & Settlement

Operational and financial reporting.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-RPT-001 | Shift X/Z views. | P0 | BR-290 | SCR-012 |
| FR-RPT-002 | Daily store summary. | P0 | BR-291 | SCR-032 |
| FR-RPT-003 | Sales cube filters: title/ISBN/SKU/format/author/series/channel/location/cashier/date. | P0 | BR-292 | SCR-032 |
| FR-RPT-004 | Discount & void report. | P0 | BR-293 | SCR-032 |
| FR-RPT-005 | Tax report. | P0 | BR-294 | SCR-032 |
| FR-RPT-006 | Tender + Stripe reconciliation worksheet. | P0 | BR-295 | SCR-033 |
| FR-RPT-007 | Gift card liability. | P0 | BR-298 | SCR-032 |
| FR-RPT-008 | Returns report. | P0 | BR-299 | SCR-032 |
| FR-RPT-009 | CSV/JSON export. | P0 | BR-300 | SCR-032 |
| FR-RPT-010 | ECC widgets API. | P0 | BR-302 | API |
| FR-RPT-011 | Event P&L. | P2 | BR-297 | SCR-032 |
| FR-RPT-012 | Exclude training data. | P0 | BR-307, RL-009 | API |
| FR-RPT-013 | Timezone-correct bucketing. | P0 | BR-308 | API |
| FR-RPT-014 | Manager override audit report. | P0 | BR-306 | SCR-034 |
| FR-RPT-015 | Settlement packet assemble download. | P0 | BR-008 obj | SCR-033 |
| FR-RPT-016 | Margin null if cost missing. | P0 | RL-048 | SCR-032 |
| FR-RPT-017 | Fiscal period lock switch. | P1 | BR-305 | SCR-033 |
| FR-RPT-018 | Scheduled daily email. | P1 | BR-301 | CFG |

### Acceptance criteria

**AC-RPT-012** Given training sale $50 When daily summary run Then totals exclude $50.


## AREA SEC: Security, Permissions & Audit

Governance controls.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-SEC-001 | Enforce PERM catalog on all mutations. | P0 | BR-310 | API |
| FR-SEC-002 | Manager approval modal with step-up auth. | P0 | BR-312 | SCR-013 |
| FR-SEC-003 | Append-only audit_log for money/stock/permission changes. | P0 | BR-313, BR-311 | SCR-034 |
| FR-SEC-004 | Session timeout on lane. | P0 | BR-315 | Lane |
| FR-SEC-005 | Failed login lockout. | P0 | BR-324 | Auth |
| FR-SEC-006 | AI cannot call payment APIs. | P0 | BR-320 | API |
| FR-SEC-007 | Audit viewer with filters. | P0 | BR-318 | SCR-034 |
| FR-SEC-008 | SoD option for variance approval. | P1 | BR-319 | CFG |
| FR-SEC-009 | Secrets never logged. | P0 | BR-326 | Tech |
| FR-SEC-010 | RLS policies workspace isolation. | P0 | NFR-008 | Tech |
| FR-SEC-011 | Legal hold flag. | P1 | BR-329 | SCR-028 |
| FR-SEC-012 | Device binding optional enforce. | P2 | BR-325 | SCR-038 |

### Acceptance criteria

**AC-SEC-002** Given refund > threshold When cashier confirms Then Manager PIN/SSO required before refund executes.


## AREA OFF: Offline & Sync

Resilience for physical registers.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-OFF-001 | Detect offline; persistent banner. | P0 | BR-330 | SCR-014 |
| FR-OFF-002 | Allow cash sales offline for non-digital physical SKUs. | P0 | BR-331 | SCR-003 |
| FR-OFF-003 | Encrypted local queue (IndexedDB + encryption key in memory/secure store). | P0 | BR-332 | Tech |
| FR-OFF-004 | Idempotent sync replay. | P0 | BR-333 | API |
| FR-OFF-005 | Conflict queue UI. | P0 | BR-334 | SCR-040 |
| FR-OFF-006 | Block gift card redeem offline. | P0 | RL-012 | SCR-007 |
| FR-OFF-007 | Block digital allocate offline. | P0 | RL-013 | SCR-003 |
| FR-OFF-008 | Catalog/price cache with timestamp; block expired promos beyond grace. | P0 | BR-336 | OFF |
| FR-OFF-009 | Max offline duration config forces block. | P1 | BR-340 | SCR-014 |
| FR-OFF-010 | Sync health indicators. | P0 | BR-339 | SCR-014 |
| FR-OFF-011 | Queue size/disk guards. | P0 | BR-338 | Tech |
| FR-OFF-012 | Chaos: network kill mid-capture recovery path. | P0 | BR-344 | QA |

### Acceptance criteria

**AC-OFF-004** Given queued local sale uuid X already accepted When sync retries X Then server returns same sale id without duplicating stock decrement.


## AREA HW: Hardware Integration

Scanners, printers, drawers, Terminals.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-HW-001 | HID scanner scan buffer integration. | P0 | BR-350 | Lane |
| FR-HW-002 | Camera scan option. | P1 | BR-357 | SCR-004 |
| FR-HW-003 | Stripe Terminal connect/register wizard. | P0 | BR-351 | SCR-038 |
| FR-HW-004 | Receipt print via browser or bridge. | P0 | BR-352 | SCR-008 |
| FR-HW-005 | Drawer kick on cash. | P0 | BR-353 | SCR-007 |
| FR-HW-006 | Hardware self-test. | P1 | BR-358 | SCR-038 |
| FR-HW-007 | Paper out / reader battery messages. | P1 | BR-359, BR-360 | Lane |
| FR-HW-008 | Document supported matrix in repo. | P0 | BR-361 | Docs |
| FR-HW-009 | Manual barcode entry always available. | P0 | BR-362 | SCR-004 |
| FR-HW-010 | Fullscreen kiosk mode. | P1 | BR-364 | SCR-001 |

### Acceptance criteria

**AC-HW-005** Given cash sale completion When OS print bridge configured Then drawer open command issued once.


## AREA INT: Book OS Intelligence Integration

Feed Sales Engine, ECC, Marketing, Catalog Intelligence.

| ID | Requirement | Pri | BR/RL | Screen |
|---|---|---|---|---|
| FR-INT-001 | Emit EVT-SALE-CAPTURED with metric dimensions. | P0 | BR-370 | API |
| FR-INT-002 | Emit EVT-SALE-REFUNDED. | P0 | BR-203 | API |
| FR-INT-003 | Map fields to Volume VII Sales Engine metrics. | P0 | BR-371 | API |
| FR-INT-004 | ECC widgets: direct revenue, units, top sellers, inventory alerts. | P0 | BR-372 | SCR Dashboard |
| FR-INT-005 | Campaign attribution when present. | P2 | BR-373 | API |
| FR-INT-006 | Catalog intelligence sell-through direct aggregates job. | P1 | BR-375 | Jobs |
| FR-INT-007 | Anomaly detection for voids/discounts. | P1 | BR-377 | Jobs |
| FR-INT-008 | AI upsell suggestions optional panel; accept required. | P3 | BR-376, RL-032 | SCR-003 |
| FR-INT-009 | Event processing idempotent. | P0 | BR-382 | API |
| FR-INT-010 | Latency SLO monitoring for event visibility. | P0 | BR-383 | Obs |
| FR-INT-011 | PII minimized in analytics events. | P0 | BR-381 | API |
| FR-INT-012 | Direct channel distinct from retailer imports. | P0 | BR-384 | API |

### Acceptance criteria

**AC-INT-001** Given captured sale When consumer reads events Then Units/Revenue for channel direct_pos increase within 5 minutes online.


---

## 6. State machines

### 6.1 Sale states
`cart` → `pending_payment` → `captured` → (`partially_refunded`|`refunded`)  
Also: `voided`, `cancelled`, `dispute_open`.

Transitions:
- Pay → pending_payment + reservations
- Capture confirm → captured + stock commit + documents
- Void before capture → voided
- Refund → partially_refunded/refunded
- Chargeback → dispute_open

### 6.2 Shift states
`opening` → `open` → `closing` → `closed` (or `force_closed`)

### 6.3 Transfer/Kit states
`draft` → `picking` → `shipped` → `receiving` → `received` → (`reconciling` → `closed`)

### 6.4 Gift card states
`pending_payment` → `active` → (`depleted`|`disabled`|`expired`)

### 6.5 Fulfillment states
`unfulfilled` → `in_progress` → `fulfilled` / `cancelled` / `expired_restocked`

---

## 7. Lane UX microcopy requirements

| Situation | Must show |
|---|---|
| Offline | “OFFLINE — Cash only. Card/gift/digital limited.” |
| Price change on revalidate | Old → new price; Accept / Remove |
| Stock insufficient | Available qty; Reduce qty / Override (manager) |
| Rights blocked | “Edition not sellable in this territory/workspace.” |
| Card declined | “Card declined. Try another tender.” |
| Sync conflict | “Sale needs review before stock finalizes.” |

---

## 8. Field-level requirements (Sale document)

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | Y | |
| workspace_id | uuid | Y | |
| location_id | uuid | Y | |
| register_id | uuid | Y | |
| shift_id | uuid | Y | lane sales |
| cashier_user_id | uuid | Y | |
| customer_id | uuid | N | |
| event_id | uuid | N | RL-019 |
| campaign_id | uuid | N | |
| channel | enum | Y | direct_pos / direct_b2b |
| status | enum | Y | |
| currency | char(3) | Y | |
| subtotal | money | Y | |
| discount_total | money | Y | |
| tax_total | money | Y | |
| grand_total | money | Y | |
| is_training | bool | Y | |
| price_traces | jsonb | Y | per lines also |
| completed_at | timestamptz | N | |
| idempotency_key | text | Y | unique |
| client_device_id | text | N | |
| offline_origin | bool | Y | |
| notes_internal | text | N | |
| notes_customer | text | N | |

Line fields: sku_id, edition_id, book_id, title_snapshot, isbn_snapshot, qty, unit_price, line_discount, tax, attributes, fulfillment_mode, cost_snapshot nullable.

---

## 9. Non-happy-path matrix (QA must cover)

| # | Scenario | Expected |
|---|---|---|
| Q-01 | Double click Pay | Single Intent |
| Q-02 | Webhook before client confirm | Finalizes once |
| Q-03 | Webhook duplicate | No double stock |
| Q-04 | Offline cash then stockout on sync | Conflict queue |
| Q-05 | Promo expires mid-cart | Revalidate blocks |
| Q-06 | Manager denies override | No change |
| Q-07 | Return qty > remaining | Block |
| Q-08 | Gift card steal attempt sequential | Atomic balance |
| Q-09 | Shift close with pending_payment | Block |
| Q-10 | Register suspended mid-shift | Block new sales; allow void/close paths |
| Q-11 | Tax rate effective dating at midnight TZ | Correct bucket |
| Q-12 | Bundle partial return | Reprice rule |
| Q-13 | Training mode + real reader | Forced test keys or block |
| Q-14 | Customer delete after sale | PII scrubbed; totals remain |
| Q-15 | Network drop after capture before receipt | Sale exists; reprint works |

---

## 10. UAT script outline (business sign-off)

1. Configure tax + location + register + hardware  
2. Open shift float $200  
3. Sell 3 SKUs card  
4. Sell split gift+cash  
5. Park/recall cart  
6. Manager discount 15%  
7. Void stuck payment  
8. Return one item  
9. Exchange format  
10. Transfer stock  
11. Cycle count  
12. Offline cash sale + sync  
13. Z-close with variance approval  
14. Settlement packet review  
15. ECC numbers match report  

Event extension: kit → sell signed → recon → P&L  
B2B extension: account → invoice → partial pay → statement  

---

## 11. Traceability matrix (sample dense)

| FR | BR | RL | UC | AC |
|---|---|---|---|---|
| FR-CART-012 | BR-055 | RL-003 | UC-001 | AC-CART-012 |
| FR-PAY-004 | BR-102 | RL-001 | UC-008 | AC-PAY-004 |
| FR-PAY-008 | BR-107 | RL-017 | UC-001 | AC-PAY-008 |
| FR-INV-002 | BR-130 | | UC-001 | AC-INV-002 |
| FR-OFF-004 | BR-333 | RL-047 | UC-002 | AC-OFF-004 |
| FR-RET-008 | BR-193 | | UC-010 | AC-RET-008 |
| FR-EVT-011 | BR-250 | RL-049 | UC-005 | AC-EVT-011 |
| FR-B2B-002 | BR-176 | RL-041 | UC-006 | AC-B2B-002 |
| FR-GFT-004 | BR-212 | | UC-007 | AC-GFT-004 |
| FR-INT-001 | BR-370 | | UC-001 | AC-INT-001 |
| FR-SHF-008 | BR-025 | RL-016 | | AC-SHF-008 |
| FR-TAX-001 | BR-090 | RL-010 | | AC-TAX-001 |
| FR-SEC-002 | BR-312 | RL-004 | UC-003 | AC-SEC-002 |
| FR-RCP-006 | BR-283 | RL-026 | | AC-RCP-006 |
| FR-CAT-001 | BR-033 | | UC-001 | AC-CAT-001 |

Full spreadsheet export can be generated from these tables; IDs are stable.

---

## 12. Functional requirements count (control totals)

| Area | Approx FRs |
|---|---|
| Global UI/CFG/NOT | 9 |
| LOC | 10 |
| REG | 10 |
| SHF | 15 |
| CAT | 15 |
| CART | 20 |
| PRC | 18 |
| TAX | 10 |
| PAY | 25 |
| INV | 17 |
| FUL | 11 |
| CUS | 10 |
| RET | 15 |
| GFT | 12 |
| EVT | 18 |
| B2B | 15 |
| RCP | 12 |
| RPT | 18 |
| SEC | 12 |
| OFF | 12 |
| HW | 10 |
| INT | 12 |
| **Total** | **~296 normative FR rows** |

Plus UC/AC/PERM/SCR catalogs above.

---

## 13. Open functional decisions (defaults locked)

| Topic | Default |
|---|---|
| Rounding | Half-up to currency minor units |
| Promo priority | Lowest resulting price within exclusivity; else priority rank field |
| Reservation TTL | 15 minutes |
| Parked cart TTL | 24 hours |
| Pickup expiry | 14 days |
| Cash variance threshold | $5.00 or 1% of expected (greater) |
| Cashier manual discount cap | 5% |
| Senior cashier cap | 10% |
| Refund manager threshold | $50 |
| Gift card code length | 16 chars base32 Crockford |
| Max inscription | 120 chars |
| Offline max hours | 12 |

---

## Approval

| Role | Name | Date |
|---|---|---|
| Product | TBD | |
| Engineering | TBD | |
| QA Lead | TBD | |

---

**End of FRD v1.0.0**
