# MANGU Book OS — Point of Sale (POS)
# Technical Specification

| Field | Value |
|---|---|
| Document ID | `MANGU-POS-TECH-1.0` |
| Version | 1.0.0 |
| Status | Implementation Binding |
| Parents | `01-BRD-MANGU-POS.md`, `02-FRD-MANGU-POS.md` |
| Target Stack | React 18 + TypeScript + Vite + Supabase (Postgres/Auth/RLS/Storage/Edge Functions) + Stripe + Vercel |
| Last Updated | 2026-07-19 |

---

## Table of Contents

1. Goals & Non-Goals  
2. Architecture Overview  
3. Repository Layout  
4. Domain Model & Entities  
5. Database Schema (Postgres)  
6. RLS & Tenancy  
7. API Surface (Edge Functions / RPC)  
8. Payment Integration (Stripe)  
9. Tax Engine Interface  
10. Pricing Resolution Algorithm  
11. Inventory Reservation & Commit Protocol  
12. Offline Queue & Sync Protocol  
13. Domain Events & Intelligence Pipelines  
14. Frontend Application Design  
15. Hardware Bridges  
16. Security & Threat Model  
17. Observability  
18. Performance & Scalability  
19. Testing Strategy  
20. Migration Plan  
21. Environment Variables  
22. Sequence Diagrams  
23. Error Codes  
24. Appendix: Example SQL / Types  

---

## 1. Goals & Non-Goals

### Goals
- Provide a production-grade technical blueprint to implement FRD P0/P1 completely.
- Keep POS as a modular domain inside Book OS without corrupting creative tables.
- Ensure money and stock integrity under retries, webhooks, and offline sync.
- Emit analytics-compatible events for Volume VII Sales Engine / ECC.

### Non-Goals
- Rebuilding retailer distribution uploaders.
- Full accounting ERP (GL) — provide exports only.
- Native iOS/Android apps (responsive web + kiosk first).

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Vite SPA)                       │
│  src/views/pos/*   Lane + Back Office                       │
│  src/lib/pos/*     Domain clients, offline queue            │
└───────────────┬─────────────────────┬───────────────────────┘
                │ Supabase JS         │ Stripe.js / Terminal JS
                ▼                     ▼
┌──────────────────────────┐   ┌────────────────────────────┐
│ Supabase                 │   │ Stripe                     │
│ - Auth                   │   │ - PaymentIntents           │
│ - Postgres + RLS         │   │ - Terminal                 │
│ - Storage (receipts)     │   │ - Webhooks                 │
│ - Edge Functions         │   └─────────────▲──────────────┘
│   pos-sale-commit        │                 │
│   pos-payment-*          │                 │
│   pos-sync               │   webhook Edge Function
│   pos-reports            │
└────────────┬─────────────┘
             │ events
             ▼
┌──────────────────────────┐
│ pos_outbox → workers     │──► sales_metrics / ECC views
└──────────────────────────┘
```

### Design tenets
1. **Postgres is system of record** for sales, stock, shifts (card money SoR = Stripe).  
2. **Edge Functions** perform privileged multi-table commits (service role) after authz checks.  
3. **Idempotency keys** on all financial commits.  
4. **Outbox pattern** for domain events.  
5. **Lane client** may cache catalog; never self-authorizes money.

---

## 3. Repository Layout

Proposed additions to canonical app:

```
src/
  views/pos/
    PosShell.tsx
    lane/
      RegisterPicker.tsx
      ShiftOpen.tsx
      SellCart.tsx
      CatalogSearch.tsx
      TenderPay.tsx
      ReceiptPanel.tsx
      ReturnsExchange.tsx
      ShiftClose.tsx
      ManagerChallenge.tsx
      OfflineBanner.tsx
    backoffice/
      LocationsAdmin.tsx
      RegistersAdmin.tsx
      InventoryOverview.tsx
      TransfersKits.tsx
      PromotionsAdmin.tsx
      TaxAdmin.tsx
      CustomersAdmin.tsx
      EventsConsole.tsx
      ReportsHub.tsx
      SettlementPacket.tsx
      AuditLog.tsx
      ConflictQueue.tsx
      HardwareWizard.tsx
  lib/pos/
    types.ts
    money.ts
    pricing.ts
    tax/
      types.ts
      builtin.ts
    inventory.ts
    saleMachine.ts
    offline/
      queue.ts
      crypto.ts
      sync.ts
    stripe.ts
    scanBuffer.ts
    permissions.ts
    api.ts
  hooks/pos/
    useRegisterSession.ts
    useCart.ts
    useCatalogSearch.ts
    useShift.ts
    useOffline.ts
  components/pos/
    ProductTile.tsx
    CartLines.tsx
    TotalsBar.tsx
    ...
supabase/
  migrations/YYYYMMDD_pos_*.sql
  functions/
    pos-sale-commit/
    pos-payment-intent/
    pos-payment-webhook/
    pos-refund/
    pos-sync/
    pos-shift-close/
    pos-transfer/
    pos-reports/
docs/pos/
  ...
```

Wire into `src/types.ts` `ViewId` union: `'pos-lane' | 'pos-backoffice'` (or single `'pos'` with inner routes).

---

## 4. Domain Model & Entities

### ENT catalog

| ID | Entity | Description |
|---|---|---|
| ENT-001 | pos_locations | Selling/stock sites |
| ENT-002 | pos_registers | Lane endpoints |
| ENT-003 | pos_shifts | Cash accountability |
| ENT-004 | pos_shift_cash_movements | Paid in/out/no-sale |
| ENT-005 | pos_skus | Sellable units |
| ENT-006 | pos_sku_barcodes | EAN/UPC/ISBN codes |
| ENT-007 | pos_price_lists / pos_prices | Pricing Engine projection |
| ENT-008 | pos_promotions / pos_coupons | Promo rules |
| ENT-009 | pos_tax_jurisdictions / pos_tax_rates | Tax tables |
| ENT-010 | pos_inventory_balances | Qty by location/sku |
| ENT-011 | pos_inventory_ledger | Append-only stock movements |
| ENT-012 | pos_reservations | Soft holds |
| ENT-013 | pos_sales / pos_sale_lines | Commercial docs |
| ENT-014 | pos_sale_tax_lines | Tax breakdown |
| ENT-015 | pos_payments | Tender ledger |
| ENT-016 | pos_refunds / pos_refund_lines | Reversals |
| ENT-017 | pos_customers / pos_customer_accounts | B2C/B2B |
| ENT-018 | pos_gift_cards / pos_stored_value_ledger | Liability |
| ENT-019 | pos_transfers / pos_transfer_lines | Stock moves / kits |
| ENT-020 | pos_events | Signings/pop-ups |
| ENT-021 | pos_fulfillments | Ship/pickup/digital |
| ENT-022 | pos_digital_codes | Code pool |
| ENT-023 | pos_audit_log | Security audit |
| ENT-024 | pos_outbox | Domain events |
| ENT-025 | pos_idempotency | Keys |
| ENT-026 | pos_sync_conflicts | Offline conflicts |
| ENT-027 | pos_receipts | Document metadata |
| ENT-028 | pos_register_hardware | Device profiles |
| ENT-029 | pos_assortments | Location SKU lists |
| ENT-030 | pos_staff_assignments | Location ACL |

Relationship to Book OS core:

```
books (existing) 1—*— editions (new or existing future) 1—*— pos_skus
pos_skus may also reference merch without book
```

If `editions` table does not yet exist, v1 may create `pos_editions` as commerce projection with `book_id` FK to `books.id`, later merged into canonical Edition entity from Volume VII/IX.

---

## 5. Database Schema (Postgres)

> Money columns: `bigint` **minor units** (cents) + `currency char(3)` to avoid float errors.  
> All tables: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`, `workspace_id uuid not null`.

### 5.1 Core commerce DDL (condensed but complete)

```sql
-- extensions
create extension if not exists pgcrypto;

-- locations
create table pos_locations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  code text not null,
  name text not null,
  location_type text not null check (location_type in (
    'warehouse','retail_store','office_counter','event_popup','mobile_trunk','consignment_partner'
  )),
  timezone text not null default 'UTC',
  currency char(3) not null default 'USD',
  address jsonb not null default '{}',
  tax_profile_id uuid,
  assortment_mode text not null default 'all_active'
    check (assortment_mode in ('all_active','explicit_list')),
  stock_source_location_id uuid references pos_locations(id),
  flags jsonb not null default '{"allows_ship":false,"allows_pickup":true,"allows_event":false,"allows_b2b":false}',
  status text not null default 'active' check (status in ('active','archived')),
  receipt_template_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table pos_registers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  location_id uuid not null references pos_locations(id),
  code text not null,
  name text not null,
  status text not null default 'inactive'
    check (status in ('decommissioned','inactive','closed','open','suspended')),
  training_forced boolean not null default false,
  device_binding jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create table pos_register_hardware (
  register_id uuid primary key references pos_registers(id) on delete cascade,
  scanner_type text,
  printer_name text,
  drawer_kick boolean not null default true,
  stripe_location_id text,
  stripe_reader_id text,
  cfd_enabled boolean not null default false,
  notes text
);

create table pos_shifts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  register_id uuid not null references pos_registers(id),
  location_id uuid not null references pos_locations(id),
  opened_by uuid not null,
  closed_by uuid,
  status text not null check (status in ('opening','open','closing','closed','force_closed')),
  opening_float_minor bigint not null,
  expected_cash_minor bigint,
  counted_cash_minor bigint,
  variance_minor bigint,
  variance_reason text,
  variance_approved_by uuid,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  is_training boolean not null default false,
  x_report jsonb,
  z_report jsonb
);

create unique index pos_shifts_one_open_per_register
  on pos_shifts(register_id) where status in ('opening','open','closing');

create table pos_shift_cash_movements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  shift_id uuid not null references pos_shifts(id),
  movement_type text not null check (movement_type in ('paid_in','paid_out','no_sale')),
  amount_minor bigint not null default 0,
  reason_code text not null,
  note text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- editions projection
create table pos_editions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  book_id uuid references books(id) on delete set null,
  format text not null, -- hardcover, paperback, ebook, audiobook, ...
  binding text,
  isbn13 text,
  title_override text,
  status text not null default 'active',
  rights_blocked boolean not null default false,
  attributes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pos_skus (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sku_code text not null,
  product_class text not null check (product_class in (
    'print_book','ebook_code','audiobook_code','bundle','merchandise','gift_card','event_ticket','service_fee'
  )),
  edition_id uuid references pos_editions(id),
  title text not null,
  subtitle text,
  tax_class text not null,
  sellable boolean not null default true,
  status text not null default 'active',
  age_restricted boolean not null default false,
  is_digital boolean not null default false,
  track_inventory boolean not null default true,
  unit_cost_minor bigint, -- nullable
  attributes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, sku_code)
);

create table pos_sku_barcodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sku_id uuid not null references pos_skus(id) on delete cascade,
  symbology text not null default 'ean13',
  code text not null,
  unique (workspace_id, code)
);

create table pos_bundle_components (
  bundle_sku_id uuid references pos_skus(id) on delete cascade,
  component_sku_id uuid references pos_skus(id),
  qty int not null check (qty > 0),
  primary key (bundle_sku_id, component_sku_id)
);

create table pos_price_lists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  code text not null,
  name text not null,
  list_type text not null check (list_type in ('retail','wholesale','educational','staff')),
  unique (workspace_id, code)
);

create table pos_prices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  price_list_id uuid not null references pos_price_lists(id) on delete cascade,
  sku_id uuid not null references pos_skus(id) on delete cascade,
  currency char(3) not null,
  amount_minor bigint not null,
  map_minor bigint,
  starts_at timestamptz,
  ends_at timestamptz,
  unique (price_list_id, sku_id, currency, starts_at)
);

create table pos_promotions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  code text,
  name text not null,
  promo_type text not null,
  exclusivity_group text,
  priority int not null default 100,
  rules jsonb not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_scope uuid[], -- null = all
  event_id uuid,
  active boolean not null default true,
  usage_limit int,
  usage_count int not null default 0
);

create table pos_tax_jurisdictions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  code text not null,
  name text not null,
  country char(2) not null,
  region text,
  unique (workspace_id, code)
);

create table pos_tax_rates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  jurisdiction_id uuid not null references pos_tax_jurisdictions(id) on delete cascade,
  tax_class text not null,
  rate_bps int not null, -- basis points; 825 = 8.25%
  starts_at timestamptz not null,
  ends_at timestamptz
);

create table pos_inventory_balances (
  workspace_id uuid not null,
  location_id uuid not null references pos_locations(id),
  sku_id uuid not null references pos_skus(id),
  on_hand int not null default 0,
  reserved int not null default 0,
  quarantine int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (location_id, sku_id),
  check (on_hand >= 0 or on_hand = on_hand) -- real neg control in app/policy
);

create table pos_inventory_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  location_id uuid not null,
  sku_id uuid not null,
  delta_on_hand int not null default 0,
  delta_reserved int not null default 0,
  delta_quarantine int not null default 0,
  reason_code text not null,
  reference_type text not null,
  reference_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table pos_reservations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sale_id uuid not null,
  location_id uuid not null,
  sku_id uuid not null,
  qty int not null,
  expires_at timestamptz not null,
  status text not null check (status in ('active','committed','released','expired')),
  created_at timestamptz not null default now()
);

create table pos_customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  display_name text,
  email citext,
  phone text,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  marketing_policy_hash text,
  tax_exempt boolean not null default false,
  tax_exempt_cert text,
  store_credit_minor bigint not null default 0,
  pii_redacted boolean not null default false,
  legal_hold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pos_customer_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  customer_id uuid not null references pos_customers(id),
  account_type text not null check (account_type in ('b2b','educational')),
  legal_name text not null,
  price_list_id uuid references pos_price_lists(id),
  payment_terms text not null default 'NET30',
  credit_limit_minor bigint not null default 0,
  credit_used_minor bigint not null default 0,
  require_po boolean not null default true,
  on_hold boolean not null default false,
  bill_to jsonb not null default '{}',
  ship_to jsonb not null default '{}',
  sales_rep_user_id uuid
);

create table pos_sales (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  location_id uuid not null,
  register_id uuid,
  shift_id uuid,
  cashier_user_id uuid not null,
  customer_id uuid,
  account_id uuid,
  event_id uuid,
  campaign_id uuid,
  channel text not null check (channel in ('direct_pos','direct_b2b')),
  status text not null,
  currency char(3) not null,
  subtotal_minor bigint not null,
  discount_total_minor bigint not null,
  tax_total_minor bigint not null,
  grand_total_minor bigint not null,
  is_training boolean not null default false,
  offline_origin boolean not null default false,
  client_device_id text,
  idempotency_key text not null,
  notes_internal text,
  notes_customer text,
  po_number text,
  exchange_group_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table pos_sale_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references pos_sales(id) on delete cascade,
  workspace_id uuid not null,
  line_no int not null,
  sku_id uuid not null,
  edition_id uuid,
  book_id uuid,
  title_snapshot text not null,
  isbn_snapshot text,
  qty int not null check (qty > 0),
  unit_price_minor bigint not null,
  line_discount_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  product_class text not null,
  attributes jsonb not null default '{}',
  fulfillment_mode text not null default 'carry_out',
  price_trace jsonb not null,
  cost_snapshot_minor bigint,
  unique (sale_id, line_no)
);

create table pos_sale_tax_lines (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references pos_sales(id) on delete cascade,
  sale_line_id uuid references pos_sale_lines(id) on delete cascade,
  jurisdiction_id uuid not null,
  tax_class text not null,
  rate_bps int not null,
  taxable_base_minor bigint not null,
  tax_minor bigint not null
);

create table pos_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sale_id uuid not null references pos_sales(id) on delete cascade,
  tender_type text not null,
  amount_minor bigint not null,
  status text not null,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  gift_card_id uuid,
  reference text,
  change_minor bigint not null default 0,
  created_at timestamptz not null default now()
);

create table pos_refunds (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sale_id uuid not null references pos_sales(id),
  status text not null,
  reason_code text not null,
  total_minor bigint not null,
  approved_by uuid,
  idempotency_key text not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table pos_refund_lines (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references pos_refunds(id) on delete cascade,
  sale_line_id uuid not null,
  qty int not null,
  amount_minor bigint not null,
  restock_mode text not null check (restock_mode in ('restock','quarantine','none'))
);

create table pos_gift_cards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  code_hash text not null unique,
  code_last4 text not null,
  currency char(3) not null,
  initial_balance_minor bigint not null,
  balance_minor bigint not null,
  status text not null,
  expires_at timestamptz,
  issued_sale_id uuid,
  created_at timestamptz not null default now()
);

create table pos_stored_value_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  instrument_type text not null check (instrument_type in ('gift_card','store_credit')),
  instrument_id uuid not null, -- gift_card_id or customer_id
  delta_minor bigint not null,
  balance_after_minor bigint not null,
  reason_code text not null,
  reference_type text,
  reference_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table pos_transfers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  from_location_id uuid not null,
  to_location_id uuid not null,
  transfer_type text not null check (transfer_type in ('standard','kit','return_kit','receiving')),
  status text not null,
  event_id uuid,
  notes text,
  created_by uuid not null,
  shipped_at timestamptz,
  received_at timestamptz,
  closed_at timestamptz
);

create table pos_transfer_lines (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references pos_transfers(id) on delete cascade,
  sku_id uuid not null,
  qty_expected int not null,
  qty_shipped int,
  qty_received int,
  qty_counted_return int
);

create table pos_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  location_id uuid not null references pos_locations(id),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  campaign_id uuid,
  status text not null,
  p_and_l jsonb,
  created_at timestamptz not null default now()
);

create table pos_fulfillments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sale_id uuid not null,
  sale_line_id uuid,
  mode text not null,
  status text not null,
  address jsonb,
  tracking_url text,
  expires_at timestamptz,
  fulfilled_at timestamptz
);

create table pos_digital_codes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sku_id uuid not null,
  code_enc bytea not null, -- encrypted at rest
  status text not null check (status in ('available','allocated','revoked')),
  allocated_sale_line_id uuid,
  allocated_at timestamptz
);

create table pos_audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table pos_outbox (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table pos_idempotency (
  workspace_id uuid not null,
  key text not null,
  request_hash text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, key)
);

create table pos_sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  local_sale_uuid uuid not null,
  reason text not null,
  payload jsonb not null,
  status text not null default 'open',
  resolved_by uuid,
  created_at timestamptz not null default now()
);

create table pos_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  sale_id uuid not null,
  channel text not null check (channel in ('print','email','sms')),
  storage_path text,
  created_at timestamptz not null default now()
);

create table pos_assortment_items (
  location_id uuid not null references pos_locations(id) on delete cascade,
  sku_id uuid not null references pos_skus(id) on delete cascade,
  primary key (location_id, sku_id)
);

create table pos_staff_assignments (
  workspace_id uuid not null,
  user_id uuid not null,
  location_id uuid not null,
  role_code text not null,
  expires_at timestamptz,
  primary key (user_id, location_id, role_code)
);

-- indexes (critical)
create index on pos_sales (workspace_id, completed_at desc);
create index on pos_sales (shift_id);
create index on pos_sale_lines (sku_id);
create index on pos_inventory_ledger (location_id, sku_id, created_at);
create index on pos_outbox (published_at) where published_at is null;
create index on pos_sku_barcodes (code);
create index on pos_customers (workspace_id, email);
```

### 5.2 Money helper

```ts
// src/lib/pos/money.ts
export type Money = { currency: string; minor: number };
export const add = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error('currency_mismatch');
  return { currency: a.currency, minor: a.minor + b.minor };
};
export const fromMajor = (currency: string, major: number) => ({
  currency,
  minor: Math.round(major * 100), // USD/CAD; extend for 0/3 decimal currencies table
});
```

### 5.3 Rounding

Default **half-up** at line tax level; persist `tax_minor` integers; document in tests. Multi-jurisdiction: compute each rate on taxable base independently then sum.

---

## 6. RLS & Tenancy

Until full `workspaces` table exists, map `workspace_id` to a stable tenant key:

**v1 pragmatic approach:** `workspace_id = auth.jwt()->>'workspace_id'` claim **or** fallback `user_id` as single-tenant workspace for current Book OS owners.

Recommended migration path:
1. Add `workspaces`, `workspace_members`  
2. POS tables RLS: member can select; privileged roles execute via Edge Functions using service role after checking membership + PERM  

Example policy pattern:

```sql
alter table pos_sales enable row level security;

create policy pos_sales_select on pos_sales for select to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

-- inserts/updates from clients restricted; commits via edge functions
```

Lane clients **read** catalog/stock via RLS; **writes** for sale commit go through Edge Functions.

---

## 7. API Surface

All Edge Functions: verify JWT, load permissions, validate idempotency, return JSON.

### API-001 `POST /functions/v1/pos-sale-quote`
Compute price/tax without committing.  
Body: `{ locationId, customerId?, accountId?, lines[], coupons[] }`  
Resp: totals + price_traces + warnings.

### API-002 `POST /functions/v1/pos-sale-commit`
Start sale + reservations + optional PaymentIntent.  
Headers: `Idempotency-Key`  
Body: quote snapshot hash + tenders plan + shiftId + registerId + offline flags  
Resp: `{ saleId, status, stripeClientSecret?, reservations[] }`

### API-003 `POST /functions/v1/pos-payment-intent`
Create/update Intent for balance due.

### API-004 `POST /functions/v1/pos-payment-webhook`
Stripe webhook; verify signature; capture finalize.

### API-005 `POST /functions/v1/pos-sale-finalize-cash`
Finalize pure cash/offline-synced cash sales.

### API-006 `POST /functions/v1/pos-sale-void`
Void pending sale; cancel Intent; release reservations.

### API-007 `POST /functions/v1/pos-refund`
Create refund + Stripe refund + stock.

### API-008 `POST /functions/v1/pos-shift-open` / `pos-shift-close`

### API-009 `POST /functions/v1/pos-transfer` (create/ship/receive/recon)

### API-010 `POST /functions/v1/pos-sync`
Replay offline batch.

### API-011 `GET /functions/v1/pos-reports/*`

### API-012 `POST /functions/v1/pos-giftcard-redeem`

### API-013 `POST /functions/v1/pos-manager-challenge`
Validates step-up; returns short-lived `approval_token` bound to action hash.

### RPC reads (PostgREST)
- catalog search view `pos_catalog_search`  
- inventory balances  
- sale detail  

### Idempotency behavior
Store canonical response for `(workspace_id, key)`. If request_hash differs → `409 idempotency_key_reuse`.

---

## 8. Payment Integration (Stripe)

### 8.1 Objects
- PaymentIntent for each card portion (or single Intent for remaining balance after non-card tenders).  
- Prefer **one Intent for final card amount** after gift/store credit applied.  
- Terminal: `collection_method` using Stripe Terminal SDK.  
- Metadata: `sale_id`, `workspace_id`, `location_id`, `is_training`.

### 8.2 Finalize algorithm (card)
1. Client confirms Terminal success OR webhook `payment_intent.succeeded`.  
2. Function locks sale row (`select for update`).  
3. If already `captured`, return success.  
4. Verify Intent amount == sum(card payments).  
5. Commit inventory reservations → ledger.  
6. Activate gift cards / allocate digital codes.  
7. Write receipt jobs.  
8. Outbox `EVT-SALE-CAPTURED`.  
9. Set sale status `captured`.

### 8.3 Refunds
Stripe Refund with `amount`, metadata `refund_id`. Failure → surface Finance queue; do not restock until money reversed OR policy `restock_on_accept`.

### 8.4 PCI
No PAN/CVV in logs, DB, or analytics. Receipts show last4 only if provided by Stripe.

---

## 9. Tax Engine Interface

```ts
export interface TaxProvider {
  quote(input: TaxQuoteInput): Promise<TaxQuoteResult>;
}

export type TaxQuoteInput = {
  workspaceId: string;
  locationId: string;
  currency: string;
  customer?: { taxExempt: boolean; cert?: string };
  lines: Array<{
    lineId: string;
    skuId: string;
    taxClass: string;
    qty: number;
    unitPriceMinor: number;
    discountMinor: number;
  }>;
};
```

`BuiltinTablesProvider` reads `pos_tax_rates` effective-dated by location timezone **as-of** timestamp.

---

## 10. Pricing Resolution Algorithm

```
function resolvePrice(sku, ctx): PriceTrace {
  list = pickPriceList(ctx.customer, ctx.account, ctx.staffFlag) // retail default
  base = findPriceRow(list, sku, ctx.currency, ctx.at)
  candidates = [base]
  autos = findAutomaticPromos(sku, ctx.location, ctx.event, ctx.at)
  coupons = validateCoupons(ctx.coupons, sku, ctx)
  apply stacking:
    group by exclusivity_group
    choose best allowed per rules (priority, then lowest price)
  manual = ctx.manualDiscount if permitted else challenge
  mapCheck(base.map_minor)
  return { unitPriceMinor, components[], warnings[] }
}
```

Persist full trace on line.

---

## 11. Inventory Reservation & Commit Protocol

```
Begin tx
  For each physical component qty:
    Update balances set reserved = reserved + qty, on_hand = on_hand - qty
      where available (on_hand - reserved_before) >= qty  -- OR policy
    Write ledger deltas
    Insert reservation active expires_at = now()+ttl
Commit

On capture:
  Mark reservations committed (no further on_hand change if already decremented into reserved path)

Alternative model ( equally acceptable if consistent ):
  Reserve without decrementing on_hand; on capture decrement on_hand and clear reserved.
```

**Chosen standard for MANGU v1:**  
`available = on_hand - reserved`  
Reserve increases `reserved`; capture: `on_hand -= qty; reserved -= qty`.  
Release/expire: `reserved -= qty`.

Bundles expand to components before reserve.

Digital: allocation from `pos_digital_codes` where status=`available` `for update skip locked`.

---

## 12. Offline Queue & Sync Protocol

### Client storage
- IndexedDB database `mangu-pos`  
- Stores: `catalog_cache`, `price_cache`, `stock_snapshot`, `queue[]`  
- Encrypt queue payloads with AES-GCM; key from session wrap (Tech detail: derive from user session + device secret)

### Queue item
```json
{
  "localSaleUuid": "uuid",
  "idempotencyKey": "uuid",
  "createdAt": "ISO",
  "type": "cash_sale",
  "body": { /* commit payload */ },
  "checksum": "sha256"
}
```

### Sync
`POST pos-sync` with batch ordered by createdAt.  
Server validates stock; on failure push `pos_sync_conflicts` and **do not** drop money payload — Manager resolves (force with override / cancel & notify).

### Forbidden offline
Gift redeem, digital allocate, B2B credit invoice, card unless Terminal offline features explicitly enabled and tested.

---

## 13. Domain Events & Intelligence Pipelines

### Outbox events

| Event | When | Payload (min) |
|---|---|---|
| EVT-SALE-CAPTURED | capture | saleId, channel, locationId, eventId?, lines[{bookId,editionId,skuId,qty,unitPrice,discount}], totals, currency, at |
| EVT-SALE-REFUNDED | refund | saleId, refundId, lines, totals |
| EVT-SALE-VOIDED | void | saleId |
| EVT-INV-LOW-STOCK | threshold | locationId, skuId, available |
| EVT-SHIFT-CLOSED | Z | shiftId, totals |
| EVT-GIFT-LIABILITY-CHANGED | balance | instrument, delta, balance |
| EVT-PROMO-REDEEMED | capture | promoId, saleId |
| EVT-SYNC-CONFLICT-OPENED | sync | conflictId |

### Worker
Edge cron / queue consumer marks `pos_outbox.published_at`, upserts aggregate tables:

```sql
create table pos_metrics_daily (
  workspace_id uuid,
  day date,
  location_id uuid,
  channel text,
  units bigint,
  revenue_minor bigint,
  returns_units bigint,
  returns_minor bigint,
  primary key (workspace_id, day, location_id, channel)
);
```

ECC reads views joining books/series.

PII: events contain ids not emails.

---

## 14. Frontend Application Design

### Routing
- `/pos` → RegisterPicker  
- `/pos/lane/:registerId` → Sell shell  
- `/pos/backoffice/*` → admin routes  

### State
- `RegisterSessionContext`: location, register, shift, permissions, online flag  
- Cart state machine (`saleMachine.ts`) aligning §6 FRD states  
- Prefer server quote on each Pay; optimistic UI for scans  

### Scan buffer
Global capture of rapid keyboard input ending with Enter; ignore if focus in `data-no-scan` fields OR implement always-on scan listener with 50ms inter-key heuristic.

### Accessibility
- Lane: large totals, ARIA live region for scan results  
- Manager modal focus trap  

### Training
`is_training` stamped from register/shift; Stripe test key selection server-side.

---

## 15. Hardware Bridges

| Device | Integration |
|---|---|
| Scanner | HID keyboard wedge → scan buffer |
| Camera | BarcodeDetector API / wasm fallback |
| Terminal | `@stripe/terminal-js` |
| Printer | `window.print` CSS thermal layout; optional QZ Tray bridge later |
| Drawer | ESC/POS kick via printer bridge |

Maintain `docs/pos/HARDWARE-MATRIX.md` (create during implementation sprint).

---

## 16. Security & Threat Model

| Threat | Mitigation |
|---|---|
| Cross-tenant read | RLS + workspace checks |
| Privilege escalation | PERM checks server-side only |
| Replay commits | Idempotency keys |
| Double refund | Row locks + remaining qty checks |
| Gift card guessing | Hash codes; rate limit redeem |
| Offline tampering | Encryption + server revalidation + conflict |
| Card data leakage | Stripe only |
| Manager PIN brute force | Lockout + step-up SSO preferred |
| Log injection / secret leak | Structured logs redaction |
| AI tool abuse | No payment scopes on agent tokens |

### Audit
`pos_audit_log` written inside same TX as sensitive mutations when possible.

---

## 17. Observability

Metrics:
- `pos_sale_commit_latency_ms`  
- `pos_payment_success_rate`  
- `pos_sync_queue_depth`  
- `pos_sync_conflict_count`  
- `pos_reservation_expire_count`  
- `pos_stripe_webhook_lag_ms`  

Tracing: correlate `sale_id`, `idempotency_key`, `payment_intent_id`.

Alerts: webhook failures, conflict spike, shift abandoned, payout mismatch job.

---

## 18. Performance & Scalability

| Path | Budget |
|---|---|
| Catalog search | p95 < 150ms |
| Quote | p95 < 200ms |
| Commit + reserve | p95 < 400ms excl. Stripe |
| Report daily | < 5s for 10k sales/day |

Indexes listed in §5. Partition `pos_audit_log` / `pos_inventory_ledger` by month when volume warrants.

---

## 19. Testing Strategy

### Unit
- money, tax half-up, pricing stack, bundle explode, change due  

### Integration (Supabase local)
- commit idempotency  
- reserve/commit/release  
- refund remaining qty  
- gift card atomic redeem  
- webhook finalize  

### E2E (Playwright)
- UC-001 happy path  
- split tender  
- shift close variance  
- offline sync mock  

### Chaos
- kill network mid-pay  
- duplicate webhook  

### UAT
FRD §10 script  

CI: extend `.github/workflows/ci.yml` with `pos` unit tests under `src/lib/pos/**/*.test.ts`.

---

## 20. Migration Plan

### M0 Scaffold
Flags, empty views, tables locations/registers/skus/prices/tax/inventory.

### M1 Lane MVP
Shifts, cart, cash+Stripe online, receipts email, sales events.

### M2 Returns + gift cards + offline cash.

### M3 Transfers/kits + events.

### M4 B2B accounts/invoices.

### M5 ECC polish + anomaly jobs.

Data migration: seed SKUs from published books/editions; generate ISBN barcodes.

---

## 21. Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_POS_TRAINING_STRIPE_PUBLISHABLE_KEY=

# Edge secrets
STRIPE_SECRET_KEY=
STRIPE_TERMINAL_LOCATION_FALLBACK=
STRIPE_WEBHOOK_SECRET=
POS_OFFLINE_MAX_HOURS=12
POS_RESERVATION_TTL_SECONDS=900
POS_CODE_ENCRYPTION_KEY=
```

Never put secret keys in Vite env.

---

## 22. Sequence Diagrams

### 22.1 Card sale

```
Cashier -> SPA: Pay
SPA -> pos-sale-commit: idempotent
pos-sale-commit -> DB: sale pending + reserve
pos-sale-commit -> Stripe: PaymentIntent
pos-sale-commit -> SPA: client_secret / Terminal
SPA -> Terminal: collect
Terminal -> Stripe: approve
Stripe -> pos-payment-webhook: succeeded
pos-payment-webhook -> DB: capture + stock commit + outbox
SPA -> SPA: show receipt (poll sale status)
```

### 22.2 Offline cash

```
SPA -> Queue: enqueue localSale
... reconnect ...
SPA -> pos-sync: batch
pos-sync -> DB: commit or conflict
```

### 22.3 Refund

```
SPA -> pos-refund: lines+reason (+approval_token)
pos-refund -> Stripe: refund
pos-refund -> DB: refund rows + inventory + outbox EVT-SALE-REFUNDED
```

---

## 23. Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `pos.unauthorized` | 401 | Auth |
| `pos.forbidden` | 403 | PERM |
| `pos.validation` | 400 | Input |
| `pos.shift_required` | 409 | No open shift |
| `pos.stock_unavailable` | 409 | Stock |
| `pos.price_changed` | 409 | Revalidate |
| `pos.promo_invalid` | 400 | Coupon |
| `pos.payment_declined` | 402 | Card |
| `pos.payment_pending` | 409 | In flight |
| `pos.idempotency_key_reuse` | 409 | Hash mismatch |
| `pos.sale_not_returnable` | 409 | Policy |
| `pos.credit_exceeded` | 409 | B2B |
| `pos.offline_forbidden_tender` | 409 | Offline rules |
| `pos.conflict_requires_resolution` | 409 | Sync |
| `pos.stripe_error` | 502 | Upstream |
| `pos.not_found` | 404 | Entity |

---

## 24. Appendix

### 24.1 TypeScript domain types (excerpt)

```ts
export type ProductClass =
  | 'print_book' | 'ebook_code' | 'audiobook_code' | 'bundle'
  | 'merchandise' | 'gift_card' | 'event_ticket' | 'service_fee';

export type SaleStatus =
  | 'cart' | 'pending_payment' | 'captured' | 'partially_refunded'
  | 'refunded' | 'voided' | 'cancelled' | 'dispute_open';

export interface CartLine {
  key: string;
  skuId: string;
  qty: number;
  attributes: { signed?: boolean; inscription?: string };
  fulfillmentMode: 'carry_out' | 'pickup_later' | 'ship_to_customer' | 'digital_delivery';
  quoted?: QuotedLine;
}
```

### 24.2 Permission check pseudocode

```ts
assertPerm(user, 'pos.refund.approve.high', { locationId });
assertApprovalToken(token, hash(actionPayload));
```

### 24.3 Report SQL sketch

```sql
select b.title, sum(l.qty) units, sum(l.qty*l.unit_price_minor - l.line_discount_minor) revenue_minor
from pos_sale_lines l
join pos_sales s on s.id = l.sale_id
left join pos_editions e on e.id = l.edition_id
left join books b on b.id = coalesce(l.book_id, e.book_id)
where s.status in ('captured','partially_refunded')
  and s.is_training = false
  and s.completed_at >= $1 and s.completed_at < $2
group by b.title
order by units desc;
```

### 24.4 Alignment checklist (Manual → Tech)

| Manual | Implementation |
|---|---|
| Direct Sales channel | `channel=direct_pos/b2b` |
| Pricing Engine | `pos_prices` + promotions |
| ISBN | `pos_editions.isbn13` + barcodes |
| Inventory Health | balances + ledger + alerts |
| Sales Engine metrics | outbox + metrics_daily |
| ECC | dashboard widgets views |
| Event Engine | `pos_outbox` |
| Permissions XII | PERM + assignments |
| AI governance | no payment scopes |

### 24.5 Implementation sprint slicing (engineering)

| Sprint | Deliverables | Exit |
|---|---|---|
| S0 | Migrations LOC/REG/SKU/PRICE/TAX/INV; feature flag; empty shell | typecheck |
| S1 | Shift open/close cash; cart scan; quote; cash finalize; receipt email | UC-001 cash |
| S2 | Stripe Terminal + webhook finalize; split tender | UC-001 card |
| S3 | Returns; gift cards; audit; reports daily | Finance UAT subset |
| S4 | Offline queue + sync + conflicts | Chaos Q-04 |
| S5 | Transfers; events; kits; signed | UC-005 |
| S6 | B2B invoices | UC-006 |
| S7 | ECC widgets; anomaly; hardening | BR OBJ-07/08 |

### 24.6 Definition of Done (per FR)
1. Migration + types  
2. Edge/RPC implemented with PERM  
3. Unit/integration tests for money path  
4. AC automated or UAT noted  
5. Audit/outbox verified  
6. Docs updated if behavior differs (change control)

---

## Approval

| Role | Name | Date |
|---|---|---|
| Engineering Lead | TBD | |
| Security | TBD | |
| Product | TBD | |

---

**End of Technical Specification v1.0.0**
