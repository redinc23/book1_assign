# MANGU Book OS — Point of Sale (POS)
# Business Requirements Document (BRD)

| Field | Value |
|---|---|
| Document ID | `MANGU-POS-BRD-1.0` |
| Version | 1.0.0 |
| Status | Approved for Implementation Planning |
| Product | MANGU Book OS — Direct Sales POS Module |
| Authors | Product Architecture (Cloud Spec Pack) |
| Stakeholders | Publisher, Sales Manager, Finance, Operations, Engineering, Events, Retail Partners |
| Related Manual | MANGU Book OS Manual v1.0 (2026), esp. Volumes VII, IX, X, XI, XII |
| Companion Docs | `02-FRD-MANGU-POS.md`, `03-TECH-SPEC-MANGU-POS.md` |
| Last Updated | 2026-07-19 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Opportunity](#2-problem-statement--opportunity)
3. [Business Objectives & Success Metrics](#3-business-objectives--success-metrics)
4. [Vision, Principles & Design Constraints](#4-vision-principles--design-constraints)
5. [Stakeholders, Personas & Organizational Context](#5-stakeholders-personas--organizational-context)
6. [Scope](#6-scope)
7. [Business Capability Map](#7-business-capability-map)
8. [Business Requirements (BR-###)](#8-business-requirements-br)
9. [Business Rules Catalog (RL-###)](#9-business-rules-catalog-rl)
10. [Channel & Commerce Model](#10-channel--commerce-model)
11. [Product & Catalog Commerce Model](#11-product--catalog-commerce-model)
12. [Pricing, Tax, Discounts & Promotions](#12-pricing-tax-discounts--promotions)
13. [Inventory & Fulfillment Business Model](#13-inventory--fulfillment-business-model)
14. [Payments, Tender & Settlement](#14-payments-tender--settlement)
15. [Returns, Voids, Exchanges & Chargebacks](#15-returns-voids-exchanges--chargebacks)
16. [Events, Pop-ups & Author Signings](#16-events-pop-ups--author-signings)
17. [Customers, Loyalty & CRM Touchpoints](#17-customers-loyalty--crm-touchpoints)
18. [Staff, Roles, Permissions & Governance](#18-staff-roles-permissions--governance)
19. [Reporting, Finance & Book OS Intelligence Integration](#19-reporting-finance--book-os-intelligence-integration)
20. [Compliance, Risk & Audit](#20-compliance-risk--audit)
21. [Non-Functional Business Requirements (NFR)](#21-non-functional-business-requirements-nfr)
22. [Phased Delivery / MVP Boundaries](#22-phased-delivery--mvp-boundaries)
23. [Dependencies, Assumptions, Constraints](#23-dependencies-assumptions-constraints)
24. [Risks & Mitigations](#24-risks--mitigations)
25. [Acceptance at Business Level](#25-acceptance-at-business-level)
26. [Appendices](#26-appendices)

---

## 1. Executive Summary

MANGU Book OS already defines how a manuscript becomes a globally distributed commercial asset: editions, ISBNs, metadata, pricing, distribution channels, sales analytics, rights, and catalog intelligence (Volume VII). What it does **not** yet specify at implementation depth is the **human + machine transaction surface** that sells those assets **directly** — at a publisher bookstore, warehouse counter, conference booth, school fair, author signing, pop-up shop, or staff-assisted online pickup desk.

**MANGU POS** is that surface.

It must:

1. Sell only **Book OS–governed sellable SKUs** (editions and approved merchandise), never orphan products floating outside the genome/catalog.
2. Capture **cash, card, digital wallet, gift card, store credit, invoice/PO (B2B), and split tender** transactions with full auditability.
3. Decrement / reserve **inventory** correctly across locations and event kits.
4. Apply **Pricing Engine** outputs (MSRP, promo, regional, wholesale, educational, bundle, subscription redemption).
5. Emit structured **sales events** into the Sales Engine, Analytics Dashboard, and Executive Command Center.
6. Support **offline-capable physical registers** without corrupting stock or double-charging.
7. Enforce **role-based governance** (cashier vs manager void vs finance settle) consistent with Volume XII permission architecture.
8. Remain PCI-compliant by never storing raw card data inside Book OS.

Business outcome: Direct Sales becomes a first-class, measurable, operable channel — not a spreadsheet afterthought next to Amazon/Ingram numbers.

---

## 2. Problem Statement & Opportunity

### 2.1 Current state (without POS)

Publishers using Book OS can track creative/editorial/production readiness and can *model* commercial fields (Commercial Genome, Pricing Engine, Sales Engine metrics). Direct sales today typically happen via:

- Manual Square/Shopify/cash-box tools disconnected from Book IDs / Edition IDs / ISBN truth
- Spreadsheets at events
- Delayed royalty / channel reconciliation
- No inventory health signal feeding Volume VII “Inventory Health” dashboards
- No reliable ASP, conversion, or event ROI by title/series/author for direct channel

### 2.2 Pain

| Pain | Business impact |
|---|---|
| Fragmented direct sales tools | Double entry, wrong ISBN/edition sold, lost margin visibility |
| Event inventory guesswork | Oversell, dead stock left in bins, no kit reconciliation |
| No link from sale → Book Genome commercial layer | Catalog Intelligence cannot score direct-channel performance |
| Manager overrides undocumented | Shrink, fraud risk, audit failure |
| Tax/receipt inconsistency across states/countries | Compliance risk |
| Returns handled ad hoc | Stock and revenue distortion |

### 2.3 Opportunity

Unify **Direct Sales** as a native Book OS channel equal in data quality to retail upload partners:

- Every unit sold direct feeds Units Sold / Revenue / ASP / Returns / Regional / Lifetime Value metrics (Volume VII Sales Engine).
- Event commerce becomes measurable marketing ROI (Volume VII Marketing Operations).
- Inventory Health becomes real-time (Volume VII Analytics Dashboard).
- Direct channel contributes to Executive Command Center Commercial Health panels.

### 2.4 Problem statement (formal)

> Publishers lack a Book OS–native Point of Sale that can sell governed editions and merchandise across permanent and ephemeral locations, under correct price/tax/inventory/permission rules, while feeding the Sales Engine as a first-class channel.

---

## 3. Business Objectives & Success Metrics

### 3.1 Objectives

| ID | Objective | Description |
|---|---|---|
| OBJ-01 | Channel parity | Direct Sales data quality equals or exceeds imported retailer reports |
| OBJ-02 | Speed to sell | Cashier can complete a typical 1–3 item sale in ≤ 45 seconds (online payment) / ≤ 60 seconds (offline queue ack) |
| OBJ-03 | Catalog integrity | 100% of POS line items resolve to a Book OS SKU with Edition or Merch parent |
| OBJ-04 | Inventory integrity | Post-sale stock accuracy ≥ 99.5% at counted locations after nightly reconciliation |
| OBJ-05 | Auditability | 100% of voids, refunds, discounts > threshold, and no-sale drawer opens are attributable to a user + reason code |
| OBJ-06 | Event readiness | A signing/pop-up can be stood up from a location kit in ≤ 30 minutes including hardware pairing |
| OBJ-07 | Intelligence loop | Direct sales appear in Sales Engine aggregates within ≤ 5 minutes of capture (online) / ≤ 15 minutes of sync (offline) |
| OBJ-08 | Finance close | Daily Z-report and settlement packet closeable by Finance within 1 business day |

### 3.2 Key Performance Indicators (KPIs)

| KPI | Definition | Target (steady state) |
|---|---|---|
| KPI-01 Direct Revenue | Gross sales − returns for channel=`direct_pos` | Tracked weekly; growth goal set per workspace |
| KPI-02 Units / Hour / Register | Completed sales units / active register hour | Baseline then +15% after UX hardening |
| KPI-03 Attach Rate | % transactions with ≥2 distinct titles or merch attach | ≥ 25% at events |
| KPI-04 Void Rate | Voids / completed sales | < 2% (investigate above) |
| KPI-05 Sync Failure Rate | Offline sales failing first sync | < 0.5% |
| KPI-06 Stockout Miss | Attempted sale of in-kit OOS item not blocked | 0 critical; < 0.1% with override |
| KPI-07 Receipt Delivery Success | Email/SMS receipt delivered | ≥ 98% when customer contact provided |
| KPI-08 Cash Variance | Expected vs counted cash per shift | ≤ 0.5% of cash tender |

### 3.3 Leading indicators for MVP exit

- ≥ 50 real transactions processed in staging with Stripe test + cash drawer simulation
- ≥ 1 full event kit lifecycle (allocate → sell → return leftover → reconcile)
- Finance can export a day packet that ties to Stripe payout + cash counted

---

## 4. Vision, Principles & Design Constraints

### 4.1 Vision statement

> One scan, one truth: every direct sale is a governed Book OS commercial event — priced by the Pricing Engine, stocked by Inventory, attributed to Catalog & Genome, and visible to the Executive Command Center.

### 4.2 Product principles (non-negotiable)

1. **Genome-linked commerce** — No SKU without a commercial parent in Book OS.  
2. **Single source of truth** — Price/tax/stock/customer balance live in Book OS services; POS is a client of truth, not a second database of record (except temporary offline cache).  
3. **Human governance** — AI may suggest upsells; humans approve manager overrides (Volume VIII philosophy).  
4. **Channel honesty** — Direct POS never invents retailer royalties; it records direct margin correctly.  
5. **Fail safe, not fail silent** — Payment/stock uncertainty blocks completion or enters explicit recovery states.  
6. **Audit by default** — Every mutation that affects money or stock writes an immutable audit event.  
7. **Speed for the lane** — Physical lane UX prioritizes scan → pay → done over dashboard aesthetics.  
8. **Ephemeral location first-class** — Events are locations with start/end, kits, and staff — not hacks.

### 4.3 Design constraints

| Constraint | Implication |
|---|---|
| PCI DSS | Use Stripe Terminal / Elements; no PAN/CVV storage |
| Multi-workspace tenancy | All POS entities scoped to org/workspace |
| Existing stack | Prefer Supabase + React; Edge Functions for webhooks/settlement |
| Manual Volume VII Sales Engine | POS must emit metrics those dashboards already name |
| Offline physical | Local encrypted queue required for registers |

---

## 5. Stakeholders, Personas & Organizational Context

### 5.1 Stakeholder map

| Stakeholder | Interest | Success looks like |
|---|---|---|
| Publisher / Executive | Revenue, brand, risk | ECC shows healthy direct channel |
| Sales Manager | Quotas, events, wholesale direct | Sell-through by title/event |
| Finance | Settlement, tax, COGS, cash | Clean daily close |
| Operations / Warehouse | Stock, transfers, kits | Accurate bins |
| Events Coordinator | Signings, booths | Kit + staff + prices ready |
| Cashier / Bookseller | Speed, clarity | Few blockers, clear overrides |
| Store Manager | Shifts, voids, discounts | Controllable exceptions |
| Author (at signing) | Personalization flow | Signed-copy workflow without chaos |
| Customer | Fast checkout, correct title/edition | Correct format, receipt, easy return |
| Engineering | Buildable specs | Unambiguous FRs + schema |
| Compliance / Legal | Tax, PCI, consumer receipts | Policy-aligned controls |

### 5.2 Personas (detailed)

#### P-01 Lane Cashier (“Maya”)
- Works bookstore counter or booth.
- Needs barcode scan, quick search by title/ISBN/SKU, tender selection, receipt.
- Cannot void after settlement without manager.
- May apply small discretionary discount if permitted (e.g., ≤5%).

#### P-02 Store / Event Manager (“Jonah”)
- Opens/closes registers, assigns staff, approves voids/refunds/price overrides.
- Runs X/Z reports, cash counts, kit returns.
- Configures local promo banners for event.

#### P-03 Inventory Operator (“Priya”)
- Receives stock, transfers between warehouse ↔ store ↔ event kit.
- Cycle counts; investigates shrink.
- Marks damaged / advance reader copies (ARC) non-sellable or special SKU.

#### P-04 Finance Controller (“Elena”)
- Reconciles Stripe + cash + invoices.
- Exports tax liability, sales journals.
- Manages gift card liability and store credit.

#### P-05 Events Lead (“Chris”)
- Creates event location, allocates kit from warehouse, assigns Terminals, preloads bestsellers.
- Needs live sell-through during event.

#### P-06 B2B Counter Seller (“Omar”)
- Sells to bookstores/schools on account (NET-30) with PO numbers.
- Needs customer credit check and invoice generation.

#### P-07 Customer (“Riley”)
- Buys paperback + tote; wants email receipt and easy exchange of wrong format.

#### P-08 System Administrator
- Configures tax jurisdictions, tender types, receipt templates, hardware profiles, permissions.

### 5.3 Organizational context (Book OS XII)

POS operates inside:

```
Organization
 └── Workspace (e.g., Fiction / Children’s)
      └── Locations (Warehouse, Flagship Store, Event: BookExpo Booth 12)
           └── Registers / Terminals
                └── Shifts / Staff assignments
```

Sales Manager / Finance Manager / Publisher roles from Volume XII map onto POS permission sets (see §18).

---

## 6. Scope

### 6.1 In scope — POS v1 (Foundation) + v1.1 (Events) + v1.2 (B2B Direct)

**Must (v1 Foundation)**

- Catalog browse/search/scan for sellable SKUs
- Cart, taxes, discounts (rules-based), receipts
- Cash + Stripe card (online + Terminal)
- Split tender
- Stock reservation & decrement for sellable on-hand
- Register shift open/close, cash count, X/Z reports
- Voids (pre-settlement) and refunds (post-settlement) with manager gates
- Customer optional attach (email/phone)
- Multi-location stock visibility (sell-from location)
- Audit log + Sales Engine event emission
- Offline queue for register mode
- Gift cards (sell + redeem) — basic
- Returns to original tender where possible

**Should (v1.1 Events)**

- Event locations with schedule
- Kit allocation / return
- Signed copy workflow (signed flag / personalized inscription note)
- Hold-for-pickup at booth
- Event flash promos
- Staff tips for authors optional (out of merchant settlement — configurable)

**Should (v1.2 B2B Direct Counter)**

- Customer accounts, credit limits, PO numbers
- Wholesale / educational price lists
- Invoices & partial payment against invoice
- Case-quantity / carton helpers

**Could (v2)**

- Subscription box redemption / membership pricing
- Advanced loyalty points
- Ecommerce cart handoff (buy online pickup in store — BOPIS)
- Dynamic AI upsell suggestions (governed)
- Multi-currency travel events
- Kitchen/merch kiosk mode beyond books
- Franchisee / consignment partner POS portals

### 6.2 Explicitly out of scope (this pack)

- Building Amazon/Ingram upload robots (Distribution Engine elsewhere)
- Full ERP procurement/AP (called out in manual as future Publishing ERP)
- Royalty calculation engine replacement (POS feeds inputs; Royalties system remains upstream/downstream)
- Manuscript/editorial features
- Consumer-facing full ecommerce storefront CMS (POS may share cart services later)
- Cryptocurrency tender (unless opened by change control)

### 6.3 Scope boundary diagram (logical)

```
[Book Genome / Editions / ISBN / Metadata]
                │
                ▼
        [Pricing Engine]─────┐
                │            │
        [Inventory Service]  │
                │            │
                ▼            ▼
           ┌────────────────────┐
           │     MANGU POS      │  ← this pack
           │  Register / Cart   │
           │  Tender / Receipt  │
           └─────────┬──────────┘
                     │ events
                     ▼
        [Sales Engine / Analytics / ECC]
                     │
                     ▼
              [Finance Close]
```

---

## 7. Business Capability Map

| Cap ID | Capability | BR coverage | FR area |
|---|---|---|---|
| CAP-01 | Location & Register Management | BR-010–019 | FR-LOC, FR-REG |
| CAP-02 | Shift & Cash Control | BR-020–029 | FR-SHF |
| CAP-03 | Catalog & SKU Resolution | BR-030–044 | FR-CAT |
| CAP-04 | Selling / Cart | BR-050–069 | FR-CART |
| CAP-05 | Pricing & Promotions | BR-070–089 | FR-PRC |
| CAP-06 | Tax | BR-090–099 | FR-TAX |
| CAP-07 | Tender & Payments | BR-100–129 | FR-PAY |
| CAP-08 | Inventory Effects | BR-130–149 | FR-INV |
| CAP-09 | Fulfillment Modes | BR-150–164 | FR-FUL |
| CAP-10 | Customers & Accounts | BR-170–184 | FR-CUS |
| CAP-11 | Returns / Exchanges | BR-190–209 | FR-RET |
| CAP-12 | Gift Cards & Store Credit | BR-210–224 | FR-GFT |
| CAP-13 | Events & Kits | BR-230–254 | FR-EVT |
| CAP-14 | B2B Direct | BR-260–279 | FR-B2B |
| CAP-15 | Receipts & Documents | BR-280–289 | FR-RCP |
| CAP-16 | Reporting & Close | BR-290–309 | FR-RPT |
| CAP-17 | Permissions & Audit | BR-310–329 | FR-SEC |
| CAP-18 | Offline & Sync | BR-330–344 | FR-OFF |
| CAP-19 | Hardware | BR-350–364 | FR-HW |
| CAP-20 | Intelligence Integration | BR-370–384 | FR-INT |

---

## 8. Business Requirements (BR)

Requirements use MoSCoW priority: **M**ust / **S**hould / **C**ould / **W**on’t (this release).  
Priority column reflects target release: `v1` / `v1.1` / `v1.2` / `v2`.

### 8.1 Location & Register (BR-010+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-010 | System shall allow Admin to define **Locations** of types: `warehouse`, `retail_store`, `office_counter`, `event_popup`, `mobile_trunk`, `consignment_partner`. | M | v1 |
| BR-011 | Each Location shall belong to exactly one Workspace and inherit org tax defaults unless overridden. | M | v1 |
| BR-012 | System shall support multiple **Registers** per Location, each with unique Register Code. | M | v1 |
| BR-013 | Each Register shall have a hardware profile (printer, scanner, drawer, Terminal reader id). | M | v1 |
| BR-014 | Registers shall have states: `decommissioned`, `inactive`, `open`, `closed`, `suspended`. | M | v1 |
| BR-015 | Only one active Shift may own a Register at a time. | M | v1 |
| BR-016 | Event locations shall support scheduled `starts_at` / `ends_at` and auto-suggest close tasks. | S | v1.1 |
| BR-017 | Locations shall store address, timezone, currency default, and fulfillment capabilities flags. | M | v1 |
| BR-018 | System shall support selling location ≠ stock source location when transfer rules allow (e.g., ship-from-warehouse). | S | v1 |
| BR-019 | Consignment partner locations shall support settlement reports distinct from owned stores. | C | v2 |

### 8.2 Shift & Cash Control (BR-020+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-020 | Cashier or Manager shall **Open Shift** with declared opening float. | M | v1 |
| BR-021 | System shall record opening float, expected cash, counted cash, variance, and variance reason. | M | v1 |
| BR-022 | System shall support mid-shift **Paid In / Paid Out** with reason codes. | M | v1 |
| BR-023 | System shall produce **X-Report** (non-final) and **Z-Report** (final close). | M | v1 |
| BR-024 | Closing a shift shall require cash count if any cash tender occurred. | M | v1 |
| BR-025 | Variance above threshold shall require Manager PIN/approval. | M | v1 |
| BR-026 | No-sale drawer open shall be logged with reason. | M | v1 |
| BR-027 | Blind close mode (hide expected cash) shall be configurable per workspace. | S | v1 |
| BR-028 | Shifts shall snapshot exchange rates if multi-currency enabled. | C | v2 |
| BR-029 | Abandoned open shifts past policy hours shall alert Managers. | S | v1 |

### 8.3 Catalog & SKU Resolution (BR-030+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-030 | POS shall sell only SKUs in status `active` and `sellable=true` for the workspace. | M | v1 |
| BR-031 | Every book SKU shall reference Edition → Book (Book OS IDs) and carry ISBN/EAN when applicable. | M | v1 |
| BR-032 | Supported product classes: `print_book`, `ebook_code`, `audiobook_code`, `bundle`, `merchandise`, `gift_card`, `event_ticket`, `service_fee`. | M | v1 |
| BR-033 | Scan of EAN/UPC/ISBN shall resolve uniquely or present disambiguation (format/edition). | M | v1 |
| BR-034 | Search shall match title, subtitle, author, ISBN, SKU, series name, internal code. | M | v1 |
| BR-035 | POS shall display format, binding, edition name, age rating, and cover thumbnail. | M | v1 |
| BR-036 | Non-sellable statuses (`preorder_only`, `recall`, `damaged`, `arc_not_for_sale`, `rights_blocked`) shall block add-to-cart with reason. | M | v1 |
| BR-037 | Preorder SKUs may be sold if policy allows, with fulfillment date shown. | S | v1 |
| BR-038 | Bundles explode to component SKUs for inventory while priced as bundle. | M | v1 |
| BR-039 | Digital codes shall be allocated from a code pool at payment success (not at cart add). | M | v1 |
| BR-040 | Merchandise may optionally link to Book/Series/Character for Catalog Intelligence. | S | v1 |
| BR-041 | Series completion prompts may suggest missing titles (attach). | C | v2 |
| BR-042 | SKUs shall respect territory/workspace distribution rights flags before sale. | M | v1 |
| BR-043 | ARC / reviewer copies shall use distinct SKUs or flags and normally price at 0 with reason code. | S | v1.1 |
| BR-044 | Catalog sync latency from Book OS master to POS cache ≤ 60 seconds online. | M | v1 |

### 8.4 Selling / Cart (BR-050+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-050 | Cart shall support line items with qty, unit price, discounts, tax, attributes (signed, personalized). | M | v1 |
| BR-051 | Cart shall enforce max line qty and max cart value configurable. | M | v1 |
| BR-052 | Age-restricted titles shall require DOB/age confirm when policy enabled. | S | v1 |
| BR-053 | Cashier note and customer-facing note fields shall exist. | S | v1 |
| BR-054 | Parked carts / suspensions shall be supported with reclaim codes. | S | v1 |
| BR-055 | Cart shall revalidate price & stock at payment initiation. | M | v1 |
| BR-056 | Signed-copy attribute shall be settable per line for print SKUs. | S | v1.1 |
| BR-057 | Personalization inscription text shall be optional, length-limited, stored on line. | S | v1.1 |
| BR-058 | Multi-cart tabs on one register shall be supported (lane + secondary). | C | v2 |
| BR-059 | Trainer/training mode shall watermark receipts and exclude from real sales. | S | v1 |
| BR-060 | Manager price override shall require auth + reason + optional new price bounds. | M | v1 |
| BR-061 | Line item remove after payment authorization starts shall be blocked. | M | v1 |
| BR-062 | Cart shall show running subtotal, discount total, tax total, grand total, savings. | M | v1 |
| BR-063 | Quick keys / favorites per location shall be configurable. | S | v1 |
| BR-064 | Duplicate scan increments qty unless serial/digital unique item. | M | v1 |
| BR-065 | Serial-tracked merch (if enabled) shall capture serial on line. | C | v2 |
| BR-066 | Cart currency shall default to location currency. | M | v1 |
| BR-067 | Quotes (non-binding) shall be printable for B2B. | S | v1.2 |
| BR-068 | Employee purchase flag shall optionally apply staff discount policy. | S | v1 |
| BR-069 | Sale shall fail closed if workspace billing/POS feature flag disabled. | M | v1 |

### 8.5 Pricing & Promotions (BR-070+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-070 | POS shall consume Pricing Engine outputs: MSRP, channel price, promo price, wholesale, educational. | M | v1 |
| BR-071 | Price list selection shall depend on customer type + location channel `direct_pos`. | M | v1 |
| BR-072 | Promotions shall support: % off, amount off, BOGO, bundle price, threshold discount, event code. | M | v1 |
| BR-073 | Stacking rules shall be explicit (exclusive promo groups). | M | v1 |
| BR-074 | Coupon codes shall validate start/end, usage limits, location scope. | M | v1 |
| BR-075 | Automatic location event promos shall apply without code when scheduled. | S | v1.1 |
| BR-076 | Manual discounts shall respect role max % / max amount. | M | v1 |
| BR-077 | Price end dating / flash sales shall be time-zone aware to location. | M | v1 |
| BR-078 | Historical price on receipt shall show actual charged unit price. | M | v1 |
| BR-079 | MAP (minimum advertised price) warnings may block below-MAP without manager. | S | v1 |
| BR-080 | Currency conversion for travel events shall use locked rate table. | C | v2 |
| BR-081 | Subscription member price shall apply when membership validated. | C | v2 |
| BR-082 | Free items (comp) require reason code and manager if above threshold. | M | v1 |
| BR-083 | Damaged discount reason codes shall optionally trigger inventory condition change. | S | v1 |
| BR-084 | Promotion redemptions shall be counted for Marketing ROI. | M | v1 |
| BR-085 | Pricing simulation for managers (what-if) is out of lane; available in back office. | S | v1 |
| BR-086 | Educational price list requires customer qualification flag. | S | v1.2 |
| BR-087 | Wholesale price list requires B2B account. | M | v1.2 |
| BR-088 | Bundle pricing shall not allow partial return that violates bundle integrity without reprice. | M | v1 |
| BR-089 | All price determinations shall be explainable in an audit “price trace”. | M | v1 |

### 8.6 Tax (BR-090+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-090 | Tax shall be calculated by jurisdiction of sale (location) with configurable nexus rules. | M | v1 |
| BR-091 | Product tax classes shall include books, digital goods, apparel, services, exempt. | M | v1 |
| BR-092 | Digital goods tax treatment shall be configurable per jurisdiction. | M | v1 |
| BR-093 | Tax-exempt customers shall require certificate reference stored on account. | S | v1.2 |
| BR-094 | Receipts shall break out tax by jurisdiction/rate. | M | v1 |
| BR-095 | Tax inclusive vs exclusive display shall be workspace-configurable. | M | v1 |
| BR-096 | Tax engine provider adapter interface shall exist (built-in tables v1; Avalara/TaxJar later). | S | v1 |
| BR-097 | Returns shall reverse original tax where linked to original sale. | M | v1 |
| BR-098 | Marketplace facilitator rules N/A for owned Direct POS; document assumption. | M | v1 |
| BR-099 | Finance export shall include tax summary by period/jurisdiction. | M | v1 |

### 8.7 Tender & Payments (BR-100+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-100 | Supported tenders v1: `cash`, `card_stripe`, `gift_card`, `store_credit`, `other` (manual). | M | v1 |
| BR-101 | Supported tenders v1.2+: `invoice_account`, `bank_transfer_recorded`. | S | v1.2 |
| BR-102 | Split tender shall allow any combination totaling grand total. | M | v1 |
| BR-103 | Card payments shall use Stripe PaymentIntents / Terminal; Book OS stores only tokens/ids. | M | v1 |
| BR-104 | Cash tender shall compute change due. | M | v1 |
| BR-105 | Partial authorization / tip-on-reader may be enabled for events (config). | C | v2 |
| BR-106 | Payment failure shall leave cart intact and release soft stock reservation per policy timer. | M | v1 |
| BR-107 | Idempotency keys shall prevent double capture on retries. | M | v1 |
| BR-108 | Offline card shall use Terminal offline mode only when Stripe supports; else defer card sales. | M | v1 |
| BR-109 | Offline cash sales shall be allowed with sync. | M | v1 |
| BR-110 | Gift card redeem shall check balance atomically. | M | v1 |
| BR-111 | Store credit redeem shall check balance atomically. | M | v1 |
| BR-112 | Over-tender cash shall be blocked; exact change logic enforced. | M | v1 |
| BR-113 | Manual “other” tender requires manager + reference fields. | M | v1 |
| BR-114 | Tips to merchant vs pass-through author tip — configurable; default off. | C | v2 |
| BR-115 | Surfacing of surcharges shall be legally configurable per region (default off). | S | v1 |
| BR-116 | Declined card shall show cashier-safe message (no sensitive issuer data leak). | M | v1 |
| BR-117 | Refunds to original card shall be preferred; fallback to store credit with reason. | M | v1 |
| BR-118 | Settlement state machine: `pending`, `authorized`, `captured`, `failed`, `cancelled`, `refunded`, `partially_refunded`. | M | v1 |
| BR-119 | Webhook-driven capture confirmation shall finalize sale stock effects if optimistic path used. | M | v1 |
| BR-120 | Register shall support deposit/preauth for special orders. | C | v2 |
| BR-121 | Multi-capture invoices for B2B. | S | v1.2 |
| BR-122 | Cash drawer kick on cash tender completion. | M | v1 |
| BR-123 | Payment receipts from Stripe shall be linkable in admin. | S | v1 |
| BR-124 | Chargeback flags shall mark sale and notify Finance. | S | v1 |
| BR-125 | Currency of tender must match cart currency in v1. | M | v1 |
| BR-126 | Training mode shall use Stripe test keys only. | M | v1 |
| BR-127 | Minimum card amount configurable. | S | v1 |
| BR-128 | Maximum cash amount before manager approval configurable (AML light). | S | v1 |
| BR-129 | All tender movements append to immutable payment ledger lines. | M | v1 |

### 8.8 Inventory Effects (BR-130+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-130 | Sale of physical SKU shall decrement on-hand at stock source location. | M | v1 |
| BR-131 | Soft reservation on payment start; hard commit on capture. | M | v1 |
| BR-132 | Reservation TTL configurable (default 15 minutes). | M | v1 |
| BR-133 | Negative stock shall be blocked by default; manager override optional per workspace. | M | v1 |
| BR-134 | Transfers between locations shall be supported with in-transit state. | M | v1 |
| BR-135 | Event kits are transfers onto event location. | M | v1.1 |
| BR-136 | Returns shall increment stock to designated return location/bin. | M | v1 |
| BR-137 | Damaged return path shall move to `quarantine` bin not sellable. | M | v1 |
| BR-138 | Cycle count adjustments require reason and permission. | M | v1 |
| BR-139 | Shrink types: theft, damage, admin error, unknown. | M | v1 |
| BR-140 | Digital code pools are inventory-like: available codes count. | M | v1 |
| BR-141 | Bundle sale decrements all physical components. | M | v1 |
| BR-142 | Inventory Health metrics shall include days of cover, stockouts, shrink. | M | v1 |
| BR-143 | Low-stock alerts to Ops at thresholds. | S | v1 |
| BR-144 | Consignment inventory accounting mode optional. | C | v2 |
| BR-145 | Lot/batch for print runs optional. | C | v2 |
| BR-146 | Bin locations within a store optional. | S | v1 |
| BR-147 | Receiving against PO (light) for publisher-owned stock. | S | v1 |
| BR-148 | Inventory ledger shall be append-only. | M | v1 |
| BR-149 | POS shall never silently skip inventory for physical SKUs. | M | v1 |

### 8.9 Fulfillment Modes (BR-150+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-150 | Modes: `carry_out`, `pickup_later`, `ship_to_customer`, `digital_delivery`, `mixed`. | M | v1 |
| BR-151 | Carry-out is default for retail_store / event. | M | v1 |
| BR-152 | Pickup_later creates fulfillment order with notify options. | S | v1 |
| BR-153 | Ship_to_customer captures address + shipping method + fee SKU. | S | v1 |
| BR-154 | Digital delivery emails codes / links after capture. | M | v1 |
| BR-155 | Mixed carts allowed (book + ebook). | M | v1 |
| BR-156 | Fulfillment SLA timestamps stored. | S | v1 |
| BR-157 | Uncollected pickups auto-expire to restock after policy days. | S | v1 |
| BR-158 | Shipping label integration adapter (manual URL v1). | C | v2 |
| BR-159 | School fair bulk delivery mode. | C | v2 |
| BR-160 | Signed books cannot be ship-without-verification flag. | S | v1.1 |
| BR-161 | Fulfillment status visible on sale detail. | M | v1 |
| BR-162 | Partial fulfillments supported. | S | v1 |
| BR-163 | Customer ID required for ship/digital by policy config. | M | v1 |
| BR-164 | Backorder line allowed only if BR-037 preorder path enabled. | S | v1 |

### 8.10 Customers & Accounts (BR-170+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-170 | Guest checkout allowed for B2C. | M | v1 |
| BR-171 | Customer profile: name, email, phone, marketing opt-in, tax exempt flags, notes. | M | v1 |
| BR-172 | Duplicate detection on email/phone. | S | v1 |
| BR-173 | Purchase history in POS back office. | M | v1 |
| BR-174 | Marketing opt-in shall be explicit and logged (timestamp/source). | M | v1 |
| BR-175 | B2B accounts: legal name, billing, credit limit, payment terms, price list. | M | v1.2 |
| BR-176 | Credit hold blocks invoice tender. | M | v1.2 |
| BR-177 | Customer merge tool for Admin. | C | v2 |
| BR-178 | Loyalty points ledger (v2). | C | v2 |
| BR-179 | Author mailing list sync adapter optional. | C | v2 |
| BR-180 | Privacy: export/delete request workflow hooks. | S | v1 |
| BR-181 | Customer store credit balance visible to cashier when attached. | M | v1 |
| BR-182 | House accounts require Finance enablement. | M | v1.2 |
| BR-183 | POS shall not require full CRM; minimal commerce profile only. | M | v1 |
| BR-184 | Event customer capture mode (fast email-only). | S | v1.1 |

### 8.11 Returns / Exchanges (BR-190+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-190 | Returns shall prefer receipt/sale lookup by sale id, last4+amount+date, or scanned receipt barcode. | M | v1 |
| BR-191 | Return window configurable per product class. | M | v1 |
| BR-192 | Open returns (no receipt) require manager + stricter limits. | M | v1 |
| BR-193 | Exchanges = return + new sale linked atomically. | M | v1 |
| BR-194 | Restocking fee optional by policy. | S | v1 |
| BR-195 | Digital codes generally non-returnable after reveal; config exception with manager. | M | v1 |
| BR-196 | Signed/personalized items return policy configurable (default non-returnable). | S | v1.1 |
| BR-197 | Refund tender routing rules documented in RL catalog. | M | v1 |
| BR-198 | Partial line returns supported. | M | v1 |
| BR-199 | Return reasons mandatory from coded list. | M | v1 |
| BR-200 | Fraudulent return patterns alert Managers. | C | v2 |
| BR-201 | Cross-location returns allowed if workspace policy enables. | S | v1 |
| BR-202 | Tax reversal accuracy required. | M | v1 |
| BR-203 | Returns emit negative sales events to Sales Engine. | M | v1 |
| BR-204 | Exchange price difference collected/refunded. | M | v1 |
| BR-205 | Manager approval thresholds for refund amount. | M | v1 |
| BR-206 | Original cashier not required for return. | M | v1 |
| BR-207 | Return shall create inventory ledger entries. | M | v1 |
| BR-208 | Defective product path can trigger Ops task. | S | v1 |
| BR-209 | Chargeback-driven returns marked `forced`. | S | v1 |

### 8.12 Gift Cards & Store Credit (BR-210+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-210 | Sell gift cards in fixed or variable denominations within min/max. | M | v1 |
| BR-211 | Gift card codes shall be unguessable; shown once + printed. | M | v1 |
| BR-212 | Redeem gift cards partially; retain balance. | M | v1 |
| BR-213 | Store credit issued from returns / goodwill. | M | v1 |
| BR-214 | Liability reports for outstanding balances. | M | v1 |
| BR-215 | Expiration policy configurable (respect local law). | S | v1 |
| BR-216 | Gift card cannot be used to buy gift cards if policy disables. | M | v1 |
| BR-217 | Reload gift cards. | S | v1 |
| BR-218 | Lost card transfer with manager + identity checks. | S | v1 |
| BR-219 | Gift card sales excluded from certain product KPIs but included in cashflow. | M | v1 |
| BR-220 | VAT/tax on gift cards per jurisdiction rules. | M | v1 |
| BR-221 | Activation only after payment capture. | M | v1 |
| BR-222 | Attempted over-redeem blocked. | M | v1 |
| BR-223 | Store credit not withdrawable as cash by default. | M | v1 |
| BR-224 | Audit every balance mutation. | M | v1 |

### 8.13 Events & Kits (BR-230+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-230 | Create Event linked to Marketing Campaign optional. | M | v1.1 |
| BR-231 | Event has location, schedule, staff, registers, Terminals. | M | v1.1 |
| BR-232 | Kit = transfer order of SKUs/qty to event location. | M | v1.1 |
| BR-233 | Kit checklist UI for packing / receiving at booth. | M | v1.1 |
| BR-234 | Live sell-through dashboard during event. | M | v1.1 |
| BR-235 | End-of-event reconciliation: expected leftover vs counted. | M | v1.1 |
| BR-236 | Variance becomes shrink or mis-scan investigation. | M | v1.1 |
| BR-237 | Signing queue mode: prep stack of titles for author table. | S | v1.1 |
| BR-238 | Personalized inscription capture. | S | v1.1 |
| BR-239 | Flash promo schedule tied to event window. | S | v1.1 |
| BR-240 | Multi-register sync stock at event (near-real-time). | M | v1.1 |
| BR-241 | Offline event mode with end-of-night sync. | M | v1.1 |
| BR-242 | Event P&L: sales − discounts − estimated COGS − booth cost fields. | S | v1.1 |
| BR-243 | Guest author limited UI (view sell-through only). | C | v2 |
| BR-244 | Pre-event preorders pickup list. | S | v1.1 |
| BR-245 | Badge/ticket SKU scanning for paid entry bundles. | C | v2 |
| BR-246 | Emergency price list freeze during event. | S | v1.1 |
| BR-247 | Kit templates reusable (e.g., “Standard Signing 50/30/20”). | S | v1.1 |
| BR-248 | Damage at event workflow. | M | v1.1 |
| BR-249 | Staff assignments with POS roles for event only. | M | v1.1 |
| BR-250 | Event close cannot finalize if open shifts remain. | M | v1.1 |
| BR-251 | Marketing ROI link: campaign id on sales. | M | v1.1 |
| BR-252 | Photo ID not stored; inscription only. | M | v1.1 |
| BR-253 | Childrens’ event age-gate helper. | C | v2 |
| BR-254 | Weather/delay notes on event record. | C | v2 |

### 8.14 B2B Direct (BR-260+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-260 | B2B customer accounts with terms. | M | v1.2 |
| BR-261 | PO number capture mandatory when terms require. | M | v1.2 |
| BR-262 | Invoice generation PDF. | M | v1.2 |
| BR-263 | Credit limit enforcement. | M | v1.2 |
| BR-264 | Partial invoice payments. | M | v1.2 |
| BR-265 | Wholesale qty breaks. | S | v1.2 |
| BR-266 | Case pack helpers. | S | v1.2 |
| BR-267 | School/educational qualification. | S | v1.2 |
| BR-268 | Statement of account. | S | v1.2 |
| BR-269 | Dunning reminders (email). | C | v2 |
| BR-270 | Net terms 0/15/30/45/60. | M | v1.2 |
| BR-271 | Order minimums. | S | v1.2 |
| BR-272 | B2B returns with RMA numbers. | S | v1.2 |
| BR-273 | Sales rep attribution. | S | v1.2 |
| BR-274 | Quote → order conversion. | S | v1.2 |
| BR-275 | Tax exempt certificates. | M | v1.2 |
| BR-276 | Bill-to vs ship-to addresses. | M | v1.2 |
| BR-277 | Freeze account. | M | v1.2 |
| BR-278 | Export invoices to accounting adapter. | S | v1.2 |
| BR-279 | B2B sales tagged channel subtype `direct_b2b`. | M | v1.2 |

### 8.15 Receipts & Documents (BR-280+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-280 | Printable thermal receipt + email receipt + SMS link receipt. | M | v1 |
| BR-281 | Receipt includes legal entity, location, sale id, timestamp, items, taxes, tenders, return policy URL. | M | v1 |
| BR-282 | Gift receipt mode (hide prices). | S | v1 |
| BR-283 | Reprint receipt with REPRINT watermark. | M | v1 |
| BR-284 | Invoice/packing slip documents for ship/B2B. | S | v1.2 |
| BR-285 | Localized receipt language templates. | S | v1 |
| BR-286 | Accessibility: email HTML semantic. | S | v1 |
| BR-287 | QR code to return portal / sale lookup. | S | v1 |
| BR-288 | Digital code section on receipt + separate secure email. | M | v1 |
| BR-289 | Document retention per policy. | M | v1 |

### 8.16 Reporting & Close (BR-290+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-290 | Shift X/Z reports. | M | v1 |
| BR-291 | Daily store summary. | M | v1 |
| BR-292 | Sales by title/ISBN/SKU/format/author/series/channel/location/cashier. | M | v1 |
| BR-293 | Discount & void reports. | M | v1 |
| BR-294 | Tax report. | M | v1 |
| BR-295 | Payment tender report + Stripe payout reconciliation worksheet. | M | v1 |
| BR-296 | Inventory valuation snapshot (retail & cost if cost present). | S | v1 |
| BR-297 | Event P&L report. | S | v1.1 |
| BR-298 | Gift card liability report. | M | v1 |
| BR-299 | Returns report. | M | v1 |
| BR-300 | Export CSV/JSON. | M | v1 |
| BR-301 | Scheduled email of daily close to Finance. | S | v1 |
| BR-302 | Dashboard widgets for ECC Commercial Health. | M | v1 |
| BR-303 | Real-time lane metrics for Managers. | S | v1 |
| BR-304 | COGS requires cost fields; if missing, report “cost incomplete”. | M | v1 |
| BR-305 | Fiscal period locks prevent backdated edits. | S | v1 |
| BR-306 | Audit report of manager overrides. | M | v1 |
| BR-307 | Training mode excluded from all financial reports. | M | v1 |
| BR-308 | Timezone correctness for location reports. | M | v1 |
| BR-309 | Reconciliation status board (open issues). | S | v1 |

### 8.17 Permissions & Audit (BR-310+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-310 | Capability-based permissions (not only role names). | M | v1 |
| BR-311 | Every money/stock mutation audited. | M | v1 |
| BR-312 | Manager approval challenges (PIN/biometric/SSO step-up). | M | v1 |
| BR-313 | Immutable audit log (append-only). | M | v1 |
| BR-314 | View PII masked unless permitted. | M | v1 |
| BR-315 | Session timeout for registers configurable. | M | v1 |
| BR-316 | Shared lane login with cashier switch without closing shift (keeper). | S | v1 |
| BR-317 | Breakglass admin access logged. | S | v1 |
| BR-318 | Export audit for compliance. | M | v1 |
| BR-319 | Separation of duties: same user cannot approve own variance above threshold (config). | S | v1 |
| BR-320 | AI agents may not capture payment (Volume VIII governance). | M | v1 |
| BR-321 | Permission changes themselves audited. | M | v1 |
| BR-322 | Location-scoped staff assignments. | M | v1 |
| BR-323 | Temporary event staff accounts expire. | S | v1.1 |
| BR-324 | Failed login lockout. | M | v1 |
| BR-325 | Device binding optional for registers. | S | v1 |
| BR-326 | Secrets never in client logs. | M | v1 |
| BR-327 | GDPR/CCPA delete flows anonymize customer but retain non-PII financial facts. | M | v1 |
| BR-328 | Clock skew tolerance documented. | S | v1 |
| BR-329 | Legal hold flag prevents purge. | S | v1 |

### 8.18 Offline & Sync (BR-330+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-330 | Register mode detects offline and banners state. | M | v1 |
| BR-331 | Offline allows cash (and Terminal offline if available). | M | v1 |
| BR-332 | Offline sales stored in encrypted local queue. | M | v1 |
| BR-333 | Sync replays idempotently. | M | v1 |
| BR-334 | Conflict policy: stock contention → manager resolution queue. | M | v1 |
| BR-335 | Catalog cache TTL + forced refresh. | M | v1 |
| BR-336 | Price cache must not sell expired promo offline beyond grace policy. | M | v1 |
| BR-337 | Offline mode disabled for B2B invoice capture if credit check required. | M | v1.2 |
| BR-338 | Queue size limits and disk guards. | M | v1 |
| BR-339 | Sync health visible to Manager. | M | v1 |
| BR-340 | Clock/offline duration limits (max hours) before forced block. | S | v1 |
| BR-341 | Digital code sales blocked offline (cannot allocate safely) unless pre-allocated vault. | M | v1 |
| BR-342 | Gift card redeem offline blocked by default. | M | v1 |
| BR-343 | After sync, Sales Engine receives backlog events in order. | M | v1 |
| BR-344 | Chaos test requirement: kill network mid-capture. | M | v1 |

### 8.19 Hardware (BR-350+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-350 | Support USB/HID barcode scanners (keyboard wedge). | M | v1 |
| BR-351 | Support Stripe Terminal readers (wisepose/S700 class as available). | M | v1 |
| BR-352 | Support receipt printers via browser print or supported bridge. | M | v1 |
| BR-353 | Cash drawer open signal via printer kick or supported bridge. | M | v1 |
| BR-354 | Hardware setup wizard per register. | S | v1 |
| BR-355 | Customer-facing display optional. | C | v2 |
| BR-356 | Scale integration out of scope v1. | W | v1 |
| BR-357 | Camera barcode scan on tablet. | S | v1 |
| BR-358 | Device health checks. | S | v1 |
| BR-359 | Printer paper out messaging. | S | v1 |
| BR-360 | Reader battery warnings. | S | v1 |
| BR-361 | Document tested hardware matrix. | M | v1 |
| BR-362 | Fallback: manual barcode entry. | M | v1 |
| BR-363 | Signature on glass for B2B delivery optional. | C | v2 |
| BR-364 | Kiosk locked mode (fullscreen). | S | v1 |

### 8.20 Intelligence Integration (BR-370+)

| ID | Requirement | Pri | Rel |
|---|---|---|---|
| BR-370 | Every completed sale/return emits canonical events (see Tech Spec EVT-*). | M | v1 |
| BR-371 | Metrics mapped to Volume VII Sales Engine list. | M | v1 |
| BR-372 | ECC widgets: Direct Revenue, Units, Top Sellers (Direct), Inventory Alerts. | M | v1 |
| BR-373 | Marketing campaign attribution when event/campaign linked. | S | v1.1 |
| BR-374 | Commercial Genome feedback features (seasonality, ASP) updated from direct channel. | S | v2 |
| BR-375 | Catalog Intelligence: backlist sell-through direct. | S | v1 |
| BR-376 | AI upsell suggestions optional, never auto-add. | C | v2 |
| BR-377 | Anomaly detection: odd voids/discounts. | S | v1 |
| BR-378 | Portfolio forecast inputs include direct run-rate. | S | v1 |
| BR-379 | Author portals may show direct sell-through if rights allow. | C | v2 |
| BR-380 | Data retention for analytics aggregates vs raw sales. | M | v1 |
| BR-381 | PII minimized in analytics pipelines. | M | v1 |
| BR-382 | Idempotent event consumption. | M | v1 |
| BR-383 | Near-real-time latency SLO (OBJ-07). | M | v1 |
| BR-384 | Manual sales import compatibility (Distribution) remains separate; POS is native. | M | v1 |

---

## 9. Business Rules Catalog (RL)

These rules are normative. FRD references them; engineering tests must encode them.

| ID | Rule | Notes |
|---|---|---|
| RL-001 | A sale cannot complete unless `sum(tenders) == grand_total` within currency minor-unit tolerance (0). | Exact |
| RL-002 | Physical sellable lines require available stock ≥ qty unless `allow_negative_stock` override approved. | |
| RL-003 | Price charged must come from Pricing Engine resolution or audited manager override. | |
| RL-004 | Manager override required when discount% > role max OR amount > role max OR below MAP. | |
| RL-005 | Void is only for unsettled carts/sales in `open`/`pending_payment`; after capture use refund. | |
| RL-006 | Refunds reference original sale lines; refund qty ≤ sold − previously returned. | |
| RL-007 | Digital code reveal occurs only after `captured`. | |
| RL-008 | Gift card activation occurs only after `captured`. | |
| RL-009 | Training mode sales have `is_training=true` and are excluded from financial aggregates. | |
| RL-010 | Tax calculated on post-discount taxable base unless jurisdiction says otherwise. | |
| RL-011 | Bundle return must return all components or reprice remainder at component channel prices. | |
| RL-012 | Offline gift card redeem denied by default. | |
| RL-013 | Offline digital allocation denied without pre-allocated vault. | |
| RL-014 | Shift must be open to sell on a register (except back-office invoice tools). | |
| RL-015 | Z-report finalizes shift; further sales require new shift. | |
| RL-016 | Cash variance > threshold blocks close without manager. | |
| RL-017 | Idempotency key required on payment capture & sale commit APIs. | |
| RL-018 | Channel code for POS B2C = `direct_pos`; B2B = `direct_b2b`. | |
| RL-019 | Event sales must carry `event_id` when register assigned to event location. | |
| RL-020 | Rights-blocked editions cannot sell even if stock exists. | |
| RL-021 | Store credit cash-out default false. | |
| RL-022 | Employee discounts cannot apply to gift cards. | |
| RL-023 | Age-restricted SKUs need confirmation before payment. | |
| RL-024 | Reservation expires → stock released → payment must revalidate. | |
| RL-025 | Sale timestamps stored in UTC; displayed in location TZ. | |
| RL-026 | Receipt reprint does not create new sale. | |
| RL-027 | Partial capture not used for standard retail cart (single capture). | |
| RL-028 | Split tender: non-cash applied first recommended; cash last for change. | UX rule |
| RL-029 | Open return max amount per day per customer configurable. | |
| RL-030 | Fiscal lock: posted period sales immutable except reversing documents. | |
| RL-031 | Consignment partner settlement excludes owned-store cash reports. | v2 |
| RL-032 | AI may propose upsell SKUs; cannot mutate cart without cashier accept. | |
| RL-033 | Personalization text max 120 chars; no emoji policy optional. | |
| RL-034 | Signed attribute only on physical print SKUs. | |
| RL-035 | Currency mismatch tender rejected. | |
| RL-036 | Chargeback marks sale `dispute_open`; finance workflow. | |
| RL-037 | Kit return quantities cannot exceed kit shipped + adjustments. | |
| RL-038 | Customer delete anonymizes PII; retains sale totals. | |
| RL-039 | Promo stacking: at most one promo from exclusive group. | |
| RL-040 | Comp (100% discount) always requires reason; >$0 threshold manager. | |
| RL-041 | B2B invoice tender requires account not on hold and within credit. | |
| RL-042 | PO required if account.`require_po=true`. | |
| RL-043 | Returns of promo-priced items refund amount actually paid. | |
| RL-044 | Shipping fee SKU is taxable per tax class. | |
| RL-045 | No-sale drawer open limited N times/shift without manager. | |
| RL-046 | Register suspended blocks new sales; allows Z if manager. | |
| RL-047 | Sync conflicts never auto-delete money movements. | |
| RL-048 | Cost missing ⇒ margin null, not zero. | |
| RL-049 | Event close requires all registers Z-closed and kit recon status not `open`. | |
| RL-050 | Payments webhooks are source of truth for card capture state. | |

---

## 10. Channel & Commerce Model

### 10.1 Channel placement in Distribution Engine

Volume VII Distribution channels include Amazon, Apple, Kobo, Google, IngramSpark, B&N, Independent Retailers, Libraries, **Direct Sales**.

MANGU POS is the operating system for **Direct Sales** (and Direct B2B counter), not a replacement for retailer feeds.

### 10.2 Channel subtypes

| Subtype | Description |
|---|---|
| `direct_pos_retail` | Permanent store / office counter |
| `direct_pos_event` | Pop-up / signing / fair |
| `direct_pos_mobile` | Trunk stock / road sales |
| `direct_b2b` | Wholesale/educational invoice counter |
| `direct_digital` | Digital code sold at POS (still direct) |

### 10.3 What “a sale” means commercially

A **Sale** is a financial document that:

1. References workspace + location + register + shift + cashier  
2. Contains lines tied to SKUs  
3. Contains tax lines  
4. Contains tender/payment ledger lines  
5. Produces stock ledger lines (as applicable)  
6. Emits analytics events  
7. May spawn fulfillment tasks  

A **Return** is a reversing commercial document linked to a Sale (or open-return exception).

---

## 11. Product & Catalog Commerce Model

### 11.1 Hierarchy

```
Universe / Series (optional)
└── Book (Book OS core)
    └── Edition (format-specific commercial product: hardcover, paperback, ebook, audio…)
        └── SKU (sellable unit; barcode; price list rows; stock records)
Merchandise Asset (optional Book/Series/Character link)
└── SKU
Gift Card Product
└── SKU (denomination templates)
Bundle
└── Bundle SKU
    └── Component SKUs (qty)
```

### 11.2 Sellability gates (all must pass)

1. SKU active  
2. Edition not rights-blocked for territory  
3. Metadata minimum complete (title, format)  
4. Price resolvable  
5. Tax class assigned  
6. Stock available OR digital pool available OR service/gift card logic  
7. Location allowed to sell SKU (assortment)  
8. Not recalled  

### 11.3 Assortment

Locations may carry a subset of catalog (assortment lists). Events typically use kit = explicit assortment.

---

## 12. Pricing, Tax, Discounts & Promotions

### 12.1 Price resolution order

1. Identify customer price list (retail default / wholesale / educational / staff)  
2. Apply channel `direct_pos` price row for SKU  
3. Apply timed promo / event promo / coupon  
4. Apply manual discount (if any) with permission checks  
5. Clamp to min price / MAP policy  
6. Persist **price trace** JSON on line  

### 12.2 Promotion types (v1)

- Percentage off SKU/category/author/series  
- Amount off  
- BOGO / buy-N-get-M  
- Bundle fixed price  
- Threshold (spend $X get Y% off)  
- Coupon-coded  
- Automatic event window  

### 12.3 Tax principles

- Location nexus determines rates  
- Digital vs print may differ  
- Exempt accounts need certificate  
- Receipt shows breakdown  
- Adapter interface for future external tax engines  

---

## 13. Inventory & Fulfillment Business Model

### 13.1 Stock states

`on_hand`, `reserved`, `in_transit`, `quarantine`, `damaged`, `available_for_sale` (computed).

### 13.2 Ledgers

All inventory changes append `inventory_ledger` entries with `reason_code` and `reference_doc`.

### 13.3 Kits

Kits are first-class transfer documents with pack/receive/reconcile stages — critical for Volume VII “Inventory Health” during events.

### 13.4 COGS

If `unit_cost` present on stock layers (average cost v1), sale posts COGS estimate for margin reporting; else margin null (RL-048).

---

## 14. Payments, Tender & Settlement

### 14.1 Card rails

Stripe is system of record for card money movement. Book OS stores PaymentIntent ids, charges, refund ids, amounts, status.

### 14.2 Cash rails

Shift cash accounting is system of record; bank deposit slips recorded by Finance.

### 14.3 Daily settlement packet (business artifact)

Includes:

- Z-reports all registers  
- Tender totals  
- Stripe captured − refunded  
- Gift card sold/redeemed  
- Store credit issued/redeemed  
- Tax totals  
- Void/refund exception list  
- Cash expected vs counted  
- Open sync conflicts  

---

## 15. Returns, Voids, Exchanges & Chargebacks

| Document | When | Money | Stock |
|---|---|---|---|
| Void | Before capture | No capture / cancel intent | Release reservation |
| Refund | After capture | Reverse tender | Restock or quarantine |
| Exchange | After capture | Net difference | Restock old + decrement new |
| Chargeback | Issuer-driven | Finance dispute | Ops investigates |

---

## 16. Events, Pop-ups & Author Signings

Events are a primary Direct Sales scenario for publishers (Volume VII Marketing: Book Signing, Conference, Launch Event).

Business lifecycle:

1. Plan event (+ optional campaign)  
2. Build kit from template  
3. Transfer stock  
4. Assign staff + hardware  
5. Open shifts  
6. Sell (signed/personalized)  
7. Live sell-through  
8. Close shifts  
9. Count leftover  
10. Transfer home  
11. Event P&L + Marketing ROI  

---

## 17. Customers, Loyalty & CRM Touchpoints

v1 focuses on **commerce identity**, not full CRM. Opt-in marketing capture must be lawful and explicit. Loyalty is v2. B2B accounts are v1.2.

---

## 18. Staff, Roles, Permissions & Governance

### 18.1 POS-oriented roles (mapped to XII)

| Role | Typical capabilities |
|---|---|---|
| Cashier | Sell, park cart, cash/card, small discount |
| Senior Cashier | + slightly higher discount, reprint, basic return |
| Store Manager | + voids, refunds, overrides, shift close approve, no-sale |
| Inventory Operator | transfers, counts, receive |
| Events Lead | event/kit ops |
| Finance | settlements, liability, exports, credit limits |
| Sales Manager | reports, B2B pricing assignment |
| Admin | configuration, tax, hardware, permissions |
| Publisher/Executive | read dashboards |
| AI Agent | suggestions only — **no tender** |

### 18.2 Critical permissions (sample)

See FRD `PERM-*`. Examples: `pos.sale.create`, `pos.discount.manual`, `pos.refund.approve`, `pos.shift.close`, `pos.inventory.adjust`, `pos.config.tax`.

---

## 19. Reporting, Finance & Book OS Intelligence Integration

### 19.1 Sales Engine metric mapping

| Volume VII Metric | POS source |
|---|---|
| Units Sold | Sum sale lines qty − return lines |
| Revenue | Gross merchandise value captured |
| Profit | Revenue − discounts − tax? (net sales) − COGS (if available) |
| Returns | Return documents |
| ASP | Revenue / units |
| Conversion Rate | Optional traffic counter integration v2; else N/A |
| Advertising ROI | Not POS; campaign cost elsewhere |
| Royalty Earnings | Not computed in POS; channel feed for royalty system |
| Regional Performance | Location address region |
| Retailer Performance | N/A — channel performance instead |
| Series Performance | via Book→Series |
| Lifetime Value | customer aggregates |

### 19.2 ECC panels fed by POS

Commercial Health: sales by title/series/author/**channel**/profitability; Operational Health: inventory alerts; Portfolio: direct run-rate.

---

## 20. Compliance, Risk & Audit

| Area | Requirement |
|---|---|
| PCI | SAQ appropriate via Stripe Terminal/Elements; no PAN storage |
| Tax | Jurisdictional correctness; retention of tax docs |
| Consumer | Receipts, return policy disclosure |
| Privacy | Opt-in, deletion/anonymization |
| SOX-like controls (org dependent) | Fiscal locks, SoD, audit exports |
| AML light | Large cash approval thresholds |
| Accessibility | Cashier UI WCAG 2.2 AA target |
| Employment | Staff discount abuse monitoring |

---

## 21. Non-Functional Business Requirements (NFR)

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Lane sale latency (scan to runnable total) | p95 < 200ms local ops |
| NFR-002 | Payment confirm UX | p95 < 3s after approves on reader online |
| NFR-003 | Availability for POS API | 99.9% monthly |
| NFR-004 | Offline durability | 0 data loss for queued cash sales on device failure after fsync |
| NFR-005 | RPO / RTO cloud | RPO ≤ 5 min; RTO ≤ 1 h |
| NFR-006 | Scale | 50 registers / workspace; 20 TPS sale commits burst |
| NFR-007 | Audit completeness | 100% money/stock mutations |
| NFR-008 | Security | RLS isolation; least privilege |
| NFR-009 | Accessibility | WCAG 2.2 AA for back office; lane large-hit targets |
| NFR-010 | Localization | i18n-ready strings; currency/tax per location |
| NFR-011 | Observability | Structured logs/metrics/traces for sale commit & sync |
| NFR-012 | Testability | Deterministic fixtures for price/tax/stock |
| NFR-013 | Browser support | Chromium latest, Safari iPad latest (register tablets) |
| NFR-014 | Data retention | Raw sales ≥ 7 years (configurable); PII minimized |
| NFR-015 | Backup restore drill | Quarterly |

---

## 22. Phased Delivery / MVP Boundaries

### Phase A — MVP Lane (v1)
Locations, registers, shifts, catalog scan/search, cart, tax, cash+Stripe, receipts, basic returns, inventory decrement, X/Z, audit, Sales Engine events, offline cash queue.

### Phase B — Events (v1.1)
Event locations, kits, signed/personalize, event promos, recon, event P&L.

### Phase C — B2B Direct (v1.2)
Accounts, wholesale/educational lists, invoices, credit, PO, statements.

### Phase D — Intelligence & Loyalty (v2)
Loyalty, AI upsell, BOPIS, advanced tax adapters, consignment portals, multi-currency travel.

**MVP exit criteria:** §3.3 + all BR marked M for v1 accepted via FR AC tests.

---

## 23. Dependencies, Assumptions, Constraints

### Dependencies
- Book / Edition / ISBN / Metadata master data  
- Pricing Engine service or tables  
- Supabase Auth + RLS  
- Stripe account + Terminal  
- Receipt printer / scanner hardware  
- Tax rate content maintenance process  

### Assumptions
- Workspace currency primarily single-currency at v1  
- Cost accounting may be incomplete initially  
- Retailer channel imports remain separate pipeline  
- Users have modern tablets/Chromebooks for registers  

### Constraints
- No card data in DB  
- Cannot block creative modules if POS down (POS isolated module)  
- Must not require rewriting Volume VII conceptually — extend it  

---

## 24. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Offline sync stock conflicts | Oversell | Reservations online; conflict queue; conservative offline assortment |
| Tax misconfiguration | Legal | Tax admin UI + test transactions + Finance review checklist |
| Cash theft / void abuse | Loss | Blind close, thresholds, audit, cameras SOP (ops) |
| Stripe outage | Lost card sales | Cash fallback; queue; status page |
| Catalog mismatch ISBN | Wrong edition sold | Disambiguation UI; cover+format confirm |
| Event chaos | Bad CX | Kit templates; signing workflow; training mode |
| Scope creep ecommerce | Delay | Explicit out-of-scope storefront CMS |
| Gift card fraud | Liability | Unguessable codes; offline redeem blocked |
| Incomplete COGS | Bad margin | Null margins not zeros; Ops cost entry project |
| PII leakage in analytics | Privacy | Schema separation; masked exports |

---

## 25. Acceptance at Business Level

Business accepts POS v1 when:

1. All **M/v1** BRs demonstrated in UAT script (`docs/pos` UAT later derived from FR AC).  
2. Finance signs settlement packet sample.  
3. Ops completes stock recon after 1 simulated event (even if event features partially stubbed, kit transfer must work).  
4. Security review passes PCI scope statement.  
5. ECC shows Direct channel numbers matching POS reports within $0.01 for test day.  

---

## 26. Appendices

### Appendix A — Glossary

| Term | Definition |
|---|---|
| SKU | Stock keeping unit; sellable barcode-level product |
| Edition | Format-specific manifestation of a Book |
| Register | Logical POS endpoint at a location |
| Shift | Cashier accountability period on a register |
| Tender | Payment method applied to a sale |
| Capture | Finalization of card payment |
| Kit | Assortment transferred to an event location |
| Price trace | Auditable explanation of price resolution |
| Soft reservation | Temporary stock hold |
| Z-Report | Final shift close report |
| Direct Sales | Volume VII channel executed by this POS |
| Commercial Genome | Book OS Layer 7 commercial attributes |
| ECC | Executive Command Center |

### Appendix B — Document matrix to Manual

| Manual concept | POS expression |
|---|---|
| ISBN Management | SKU identifiers |
| Metadata Engine | Search/display fields |
| Distribution Engine Direct Sales | Channel |
| Pricing Engine | Price resolution |
| Sales Engine | Events + metrics |
| Inventory Health | Stock ledgers + alerts |
| Catalog Intelligence | Direct sell-through feeds |
| Marketing campaigns / signings | Events module |
| Rights Management | Sellability gate |
| Platform roles/permissions | PERM model |
| Event Engine | EVT emissions |
| API Layer | POS APIs |

### Appendix C — Example end-to-end business scenario

**Scenario:** Saturday signing for Title *Project Atlas* paperback.

1. Events Lead creates Event location Fri 5pm–8pm, links Marketing Campaign `CAM-Atlas-Sign`.  
2. Kit template loads 120 paperback, 40 hardcover, 25 totes.  
3. Transfer ships from Warehouse to Event.  
4. Staff open Register R1 with $200 float.  
5. Customer buys paperback (signed) + tote; promo code `ATLAS10`.  
6. Pays split: gift card $10 + card remainder.  
7. Receipt email + signed attribute stored.  
8. Sale events update live sell-through.  
9. End: Z-close, count leftover, transfer home, variance 1 tote → shrink reason `unknown`.  
10. Event P&L + campaign ROI available Monday.

### Appendix D — RACI (summary)

| Decision | Publisher | Sales Mgr | Finance | Ops | Eng |
|---|---|---|---|---|---|
| Discount policy | A | R | C | I | I |
| Tax config | I | C | A/R | C | C |
| Hardware standard | I | C | I | A | R |
| Refund window | A | R | C | I | I |
| Offline policy | A | C | C | C | R |
| MVP scope lock | A | C | C | C | R |

R=Responsible A=Accountable C=Consulted I=Informed

### Appendix T — Traceability (BR → Objectives)

| Objective | Primary BRs |
|---|---|
| OBJ-01 Channel parity | BR-370–384, BR-292 |
| OBJ-02 Speed | BR-050–064, NFR-001–002 |
| OBJ-03 Catalog integrity | BR-030–044 |
| OBJ-04 Inventory integrity | BR-130–149, BR-235 |
| OBJ-05 Auditability | BR-310–318, RL-004 |
| OBJ-06 Event readiness | BR-230–250 |
| OBJ-07 Intelligence loop | BR-370–383 |
| OBJ-08 Finance close | BR-023–025, BR-290–301 |

### Appendix E — Open questions (to close in sprint 0)

1. Exact Stripe Terminal models to standardize?  
2. Average cost vs FIFO for COGS v1? (Recommend average cost)  
3. Which jurisdictions go live first for tax tables?  
4. Is tip-on-reader required for launch events? (Default no)  
5. Staff discount percent default?  
6. Gift card expiration legal defaults by country?  

*These do not block writing code against defaults stated in Tech Spec.*

---

## Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| Product Owner | _TBD_ | | |
| Engineering Lead | _TBD_ | | |
| Finance | _TBD_ | | |
| Operations | _TBD_ | | |
| Security | _TBD_ | | |

---

**End of BRD v1.0.0**
