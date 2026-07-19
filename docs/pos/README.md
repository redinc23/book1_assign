# MANGU Book OS — Point of Sale (POS) Specification Pack

**Product:** MANGU Book Operating System — Commercial Direct Sales Module  
**Document Set Version:** 1.0.0  
**Status:** Ready for Engineering Implementation  
**Date:** 2026-07-19  
**Owner:** Mangu Publishers — Product & Platform  
**Classification:** Internal — Engineering Canonical  

---

## What this pack is

This is the **implementation-grade specification pack** for the entire **MANGU Book OS Point of Sale (POS)** system — the missing operational layer that turns Volume VII’s Distribution, Pricing, Sales, Inventory, and Catalog engines into a real, cashier-ready, event-ready, multi-location commerce system that sells books and related products **directly**.

It is deliberately written so a fresh engineering team can build without inventing product rules.

## Documents

| # | Document | Path | Audience | Purpose |
|---|---|---|---|---|
| 00 | This index | `README.md` | Everyone | Navigation, scope, reading order |
| 01 | Business Requirements (BRD) | [`01-BRD-MANGU-POS.md`](./01-BRD-MANGU-POS.md) | Executives, PMs, Ops, Finance | Why, who, business rules, KPIs, scope |
| 02 | Functional Requirements (FRD) | [`02-FRD-MANGU-POS.md`](./02-FRD-MANGU-POS.md) | Product, Design, QA, Engineering | What the system must do, screen-by-screen, rule-by-rule |
| 03 | Technical Specification | [`03-TECH-SPEC-MANGU-POS.md`](./03-TECH-SPEC-MANGU-POS.md) | Engineering, Security, DevOps, Data | How to build it — architecture, schema, APIs, events, security |

## Canonical product definition

> **MANGU POS** is the Book OS module that captures, authorizes, fulfills, settles, and reports **direct commercial transactions** for sellable editions and merchandise that already exist as Book OS commercial assets (Book → Edition → SKU → Inventory → Price → Channel: Direct Sales).

It is **not** a generic coffee-shop POS bolted on. It is the **Direct Sales channel execution engine** for a publishing company.

## Alignment to Book OS Manual

Anchored in:

- **Volume VII** — Production, Distribution & Commercial Operations (ISBN, Metadata, Distribution, Pricing, Marketing, Sales Engine, Inventory Health, Catalog Intelligence, Executive Command Center)
- **Volume IX** — Master Data Dictionary (universal record headers, AI/analytics fields)
- **Volume X** — Book Genome Layer 7 Commercial Genome
- **Volume XI** — Sales / Financial / Operational Intelligence
- **Volume XII** — Enterprise Platform Architecture (roles, permissions, event engine, APIs, portals, security)
- **Current canonical app stack** — React + TypeScript + Vite + Supabase (PostgreSQL + Auth + RLS + Storage) + Vercel

## Reading order for developers

1. BRD §§1–6 (problem, goals, personas, scope)  
2. FRD §§1–3 (capability map + FR ID conventions)  
3. Tech Spec §§1–4 (architecture + domain model)  
4. FRD capability areas relevant to your sprint  
5. Tech Spec APIs/schema for those areas  
6. Traceability matrix (BRD Appendix T / FRD Appendix X)

## Requirement ID conventions

| Prefix | Meaning |
|---|---|
| `BR-###` | Business requirement |
| `NFR-###` | Non-functional / quality attribute |
| `FR-AREA-###` | Functional requirement (area-coded) |
| `UC-###` | Use case |
| `AC-###` | Acceptance criterion |
| `ENT-###` | Entity |
| `API-###` | API endpoint group |
| `EVT-###` | Domain event |
| `RL-###` | Business rule |
| `PERM-###` | Permission capability |
| `SCR-###` | Screen / view |

## Out-of-band assumptions (locked for v1 unless BRD change-control opens them)

1. Multi-tenant by **organization → workspace** (Book OS XII).  
2. Payments via **Stripe** (Terminal + Online PaymentIntents); no card data stored in Book OS.  
3. Canonical persistence in **Supabase Postgres** with RLS.  
4. POS UI ships inside the Book OS web app (`src/views/pos/*`) plus a kiosk / tablet layout mode.  
5. Offline lane support is **required for physical registers** (local queue + sync).  
6. Every completed sale emits events consumed by **Sales Engine / Analytics / Executive Command Center**.

## Change control

Any requirement change after sprint kickoff requires:

1. Impact note (BR / FR / schema / API)  
2. Version bump of this pack  
3. Traceability matrix update  

---

*End of index.*
