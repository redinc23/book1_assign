# MANGU Book OS — Canonical Data Dictionary (Build-Grade)

| Field | Value |
|---|---|
| Document ID | `DATA-BOOKOS-001` |
| Version | `1.0.0` |
| Status | Normative for schema + UI field work |
| Related | FRD-BOOKOS-001, TECH-BOOKOS-001 |

This dictionary defines **field-level** contracts. If a column is listed as Must for a phase, migrations and forms must include it (progressive disclosure allowed in UI).

Legend: **P0/P1/P2/P3** = phase introduced · **Req@M#** = required to exit that milestone (default template)

---

## 1. `books` (ENT-Book)

| Field | Type | Phase | Req | Notes |
|---|---|---|---|---|
| id | uuid PK | P0 | system | |
| user_id | uuid | P0 | system | legacy owner |
| org_id | uuid? | P1 | system | tenancy |
| series_id | uuid? | P3 | | |
| universe_id | uuid? | P3 | | |
| title | text | P0 | always | display title |
| working_title | text | P1 | M1 | |
| official_title | text | P1 | M16 | |
| subtitle | text | P1 | | |
| author | text | P0 | always | primary author string (multi-author later) |
| genre | text | P0 | M1 | |
| subgenre | text | P1 | M1 | |
| logline | text | P1 | M1 | one sentence |
| premise | text | P1 | M1 | |
| elevator_pitch | text | P1 | M1 | |
| core_theme | text | P1 | M2 | |
| pov | text | P1 | M4 | |
| tone | text | P1 | | |
| mood | text | P1 | | |
| narrative_style | text | P1 | M4 | |
| audience | text | P1 | M0/M1 | |
| reading_level | text | P1 | | |
| language | text | P1 | M13 | default `en` |
| publication_type | text | P1 | M1 | book\|comic\|… |
| isbn | text | P2 | M13 | |
| asin | text | P2 | | |
| cover_url | text | P0 | M13 | |
| progress | int | P0 | | 0–100 denormalized |
| phase | text | P0 | | legacy label |
| current_milestone | text | P1 | | `M0`…`M20` |
| status | text | P0 | | universal lifecycle |
| approval_status | text | P1 | | |
| word_count | int | P0 | M8 | aggregated |
| target_word_count | int | P0 | M1 | |
| deadline | date | P0 | | |
| target_release_window | text | P1 | M1 | |
| comparable_titles | jsonb | P1 | M0 | [{title,author,notes}] |
| pricing | jsonb | P2 | | |
| attributes | jsonb | P1 | | genome layers |
| ai | jsonb | P1 | | universal AI fields |
| scores | jsonb | P2 | | health scores |
| settings | jsonb | P1 | | gates, autonomy defaults |
| version | int | P1 | | optimistic concurrency |
| tags | text[] | P1 | | |
| notes | text | P1 | | |
| created_at / updated_at | timestamptz | P0 | | |

### `books.attributes` genome layer keys (normative namespaces)

```text
identity.*, narrative.*, ensemble.*, world.*, theme.*,
reader_experience.*, production.*, franchise.*, commercial.*, operational.*
```

---

## 2. `characters` (ENT-Character)

| Field | Type | Phase | Req | Notes |
|---|---|---|---|---|
| id | uuid | P0 | | |
| book_id | uuid | P0 | | |
| name | text | P0 | always | preferred display |
| legal_name | text | P1 | | |
| aliases | text[] | P1 | | |
| nicknames | text[] | P1 | | |
| role | text | P0 | M2 | Protagonist/Antagonist/… |
| archetype | text | P0 | | |
| pronouns | text | P1 | | |
| species | text | P1 | | |
| gender_identity | text | P1 | | |
| age | text | P1 | | store text for “apparent age” flexibility |
| birthday | text | P1 | | |
| occupation | text | P1 | | |
| alive | boolean | P1 | | default true |
| arc | text | P0 | M2 | |
| transformation | text | P1 | M2 | |
| image_url | text | P0 | | |
| connections | int | P0 | | denormalized count |
| # Psychology (also may live under attributes.psychology) | | | | |
| core_wound | text | P1 | M2 if major | |
| core_fear | text | P1 | M2 if major | |
| core_desire | text | P1 | M2 if major | |
| need | text | P1 | M2 if major | |
| want | text | P1 | M2 if major | |
| lie_believed | text | P1 | M2 if major | |
| fatal_flaw | text | P1 | | |
| greatest_strength | text | P1 | | |
| motivation | text | P1 | M2 if major | |
| # Physical | | | | |
| height | text | P1 | | |
| weight | text | P1 | | |
| hair | text | P1 | | |
| eyes | text | P1 | | |
| voice | text | P1 | | |
| scars | text | P1 | | |
| clothing | text | P1 | | |
| distinguishing_features | text | P1 | | |
| voice_model | jsonb | P1 | | Dialogue Coach |
| attributes | jsonb | P1 | | domains 1–12 |
| ai | jsonb | P1 | | |
| first_appearance_scene_id | uuid? | P1 | | |
| last_appearance_scene_id | uuid? | P1 | | |
| status / version / notes / timestamps | | P0–P1 | | universal |

**Major character rule:** role ∈ {Protagonist, Antagonist, Deuteragonist} OR `attributes.narrative.importance = 'major'`.

---

## 3. `chapters` (ENT-Chapter)

| Field | Type | Phase | Req@ |
|---|---|---|---|
| id, book_id | uuid | P0 | |
| number | int | P0 | always |
| sequence | int | P1 | equals number unless custom |
| act | text/int | P1 | M5 |
| title | text | P0 | always |
| purpose | text | P1 | M6 |
| synopsis | text | P1 | M6 |
| status | text | P0 | |
| word_count / target_word_count | int | P0 | M8 targets |
| pov | text | P0 | M6 |
| pov_character_id | uuid? | P1 | M6 |
| opening_emotion | text | P1 | M6 |
| closing_emotion | text | P1 | M6 |
| conflict | text | P1 | M6 |
| resolution | text | P1 | |
| cliffhanger | text | P1 | |
| foreshadowing | text | P1 | |
| reveal | text | P1 | |
| themes | text[] | P1 | |
| scene_count | int | P1 | denorm |
| estimated_reading_time | int | P1 | minutes |
| draft_version | text | P1 | |
| approval_status | text | P1 | |
| attributes / ai / version / notes / timestamps | | P1 | |

---

## 4. `scenes` (ENT-Scene)

| Field | Type | Phase | Req@ |
|---|---|---|---|
| id, book_id, chapter_id | uuid | P1 | |
| sequence | int | P1 | always |
| title | text | P1 | |
| synopsis | text | P1 | M7 |
| pov_character_id | uuid? | P1 | M7 |
| location_id | uuid? | P1 | M7 |
| characters_present | uuid[] | P1 | M7 |
| purpose | text | P1 | M7 |
| conflict | text | P1 | M7 |
| outcome | text | P1 | M7 |
| emotional_shift | text | P1 | M7 |
| plot_advancement | text | P1 | M7 |
| word_goal / word_count | int | P1 | |
| status / version / attributes / ai / notes / timestamps | | P1 | |

---

## 5. `locations` (ENT-Location)

| Field | Type | Phase | Notes |
|---|---|---|---|
| id, book_id | uuid | P1 | |
| name | text | P1 | required |
| location_type | text | P1 | city, building, region… |
| parent_location_id | uuid? | P1 | hierarchy |
| short_description / long_description | text | P1 | |
| sensory_notes | text | P1 | |
| climate | text | P1 | |
| cultural_notes | text | P1 | |
| attributes / ai / status / version / timestamps | | P1 | |

---

## 6. `relationships` (ENT-Relationship)

| Field | Type | Phase | Notes |
|---|---|---|---|
| id, book_id | uuid | P1 | |
| from_type / from_id | text/uuid | P1 | required |
| to_type / to_id | text/uuid | P1 | required |
| relationship_type | text | P1 | controlled vocab |
| strength | numeric? | P1 | 0–1 or 1–10 (pick 0–1) |
| since_event_id | uuid? | P1 | |
| notes | text | P1 | |
| status / attributes / timestamps | | P1 | |

### Controlled `relationship_type` (v1)

`family`, `parent_of`, `child_of`, `sibling`, `ally`, `rival`, `enemy`, `mentor`, `mentee`, `romantic`, `married`, `member_of`, `leads`, `located_in`, `owns`, `created`, `conflicts_with`, `knows`, `serves`, `betrays`.

---

## 7. Editorial / Production / Marketing (evolved)

### `editorial_issues` (from `editorial_tasks`)

| Field | Type | Phase |
|---|---|---|
| id, book_id, title | | P0 |
| description | text | P1 |
| chapter | text | P0 legacy label |
| chapter_id / scene_id | uuid? | P1 |
| assignee / assignee_user_id | text/uuid | P0/P1 |
| severity | text | P0 |
| status | text | P0 |
| type | text | P0 |
| anchor | jsonb | P1 | `{start,end,quote}` |
| entity_type / entity_id | | P1 |
| source | text | P1 | `human\|agent:<key>` |
| created_at | | P0 |

### `production_tasks` — keep P0; add `blocker boolean`, `milestone_code`, `asset_id?` in P2.

### `marketing_items` — keep P0; add `campaign_id?`, `messaging_pillar`, `asset_ids[]` in P2.

---

## 8. Manuscript tables

See Tech Spec §5.3.3. Additional rules:

- Word count algorithm: split on whitespace; Unicode aware; shared `countWords(text)` in `src/lib/words.ts`.
- Empty body allowed; word_count 0.
- `format` v1 = `markdown` only.

---

## 9. AI tables — status enums (normative)

**agent_jobs.status:** `queued|running|succeeded|failed|cancelled`  
**proposals.status:** `pending|approved|rejected|applied|failed`  
**approvals.status:** `pending|approved|rejected|cancelled`  
**milestone_states.status:** `locked|available|in_progress|blocked|complete|waived`

---

## 10. JSON schema registry (process)

1. Each `attributes` namespace versioned under `docs/schemas/<entity>/<version>.json` (add as implemented).  
2. App validates on write.  
3. Unknown keys allowed only under `attributes.extensions.*` and ignored by gates.

---

## 11. Seed expectations for QA fixtures

Minimum fixture book for gate tests:

- 1 book with logline/premise/genre/audience/target_word_count  
- 2 characters (protagonist+antagonist) with psych fields  
- 3 chapters with purpose/synopsis/pov  
- 6 scenes satisfying M7 fields  
- 1 location  
- 1 relationship between protagonists  
- 1 open critical editorial issue (for deny-M12 tests)

---

## Document control

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial build-grade data dictionary |
