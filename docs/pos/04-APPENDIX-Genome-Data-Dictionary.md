# Appendix — Genome & Entity Data Dictionary
# MANGU POS Build Spec Pack

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-DICT-001` |
| Version | `1.0.0` |
| Normative for | FR-GENOME-*, FR-CHAR-*, FR-STORY-*, FR-WORLD-*, Tech Spec §5 |

This dictionary defines **canonical field paths** for JSONB genomes and core relational columns. Paths use dot notation. Unless marked REQUIRED at create, fields are progressively enriched and enforced by milestone configs.

---

## 1. Conventions

| Concept | Rule |
|---------|------|
| Path | `genome.identity.logline` |
| Types | `string`, `string[]`, `number`, `boolean`, `enum`, `object`, `ref:character`, `ref:chapter`, `ref:scene`, `ref:location` |
| Empty | Prefer omit or `null`; avoid empty strings for enum fields |
| Arrays | Ordered unless noted |
| Refs | Store UUID; UI resolves display name |
| Localization | Store plain text Phase 1; i18n map MAY wrap later |

Status enums for records: `draft | working | review | approved | published | archived`.

---

## 2. Book Genome Layers (Volume X)

Stored on `books.genome` as JSON object with keys `identity`, `creative`, `narrative`, `character`, `world`, `reader`, `commercial`, `franchise`, `publishing`, `evolution`.

### 2.1 Layer 1 — Identity Genome (`genome.identity`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `workingTitle` | string | Working title | M1 |
| `finalTitle` | string | Locked title | M15 |
| `subtitle` | string | Subtitle | |
| `authors` | string[] | Author display names | M1 |
| `contributors` | object[] | `{name, role}` | |
| `publicationType` | enum | book, ebook, comic, … | M1 |
| `primaryLanguage` | string | BCP-47 | M1 |
| `genre` | string | Primary genre | M1 |
| `subgenres` | string[] | | |
| `seriesName` | string | Denorm until series_id | |
| `seriesPosition` | number | | |
| `logline` | string | One-sentence pitch | M1–M3 |
| `hook` | string | Marketing/creative hook | M1 |
| `audience` | string | Target reader | M1–M3 |
| `ageRange` | string | | M13 meta |
| `comps` | string[] | Comp titles | M0–M3 |
| `uniqueSellingProposition` | string | | M3 |

### 2.2 Layer 2 — Creative Genome (`genome.creative`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `premise` | string | | M2–M3 |
| `themes.primary` | string | | M3 |
| `themes.secondary` | string[] | | |
| `tone` | string | | M3 |
| `mood` | string | | |
| `styleNotes` | string | | |
| `promiseToReader` | string | | M2 |
| `contentWarnings` | string[] | | M14 |
| `sensitivityFlags` | string[] | | M9+ |

### 2.3 Layer 3 — Narrative Genome (`genome.narrative`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `structurePattern` | enum | three_act, hero_journey, episodic, custom | M4 |
| `centralConflict` | string | | M2–M4 |
| `stakes.external` | string | | M2 |
| `stakes.internal` | string | | M2 |
| `stakes.philosophical` | string | | |
| `povStrategy` | string | | M3–M6 |
| `tense` | enum | past, present, mixed | |
| `timelineShape` | string | linear, nonlinear, dual | M4 |
| `endingIntent` | string | | M4 |
| `acts` | object[] | `{id, name, purpose, chapterRange?}` | M4 |
| `beats` | object[] | `{id, name, purpose, actId?}` | M4–M5 |

### 2.4 Layer 4 — Character Genome summary (`genome.character`)

| Path | Type | Description |
|------|------|-------------|
| `protagonistId` | ref:character | |
| `antagonistId` | ref:character | |
| `castSummary` | string | |
| `relationshipThesis` | string | |
| `arcOverview` | string | |

### 2.5 Layer 5 — World Genome summary (`genome.world`)

| Path | Type | Description |
|------|------|-------------|
| `settingSummary` | string | |
| `timePeriod` | string | |
| `magicOrTechRulesSummary` | string | |
| `continuityRulesSummary` | string | |
| `primaryLocations` | ref:location[] | |

### 2.6 Layer 6 — Reader Experience (`genome.reader`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `targetEmotionArc` | string | | M4 |
| `pacingIntent` | string | | M4 |
| `heatLevel` | string | romance/content | |
| `violenceLevel` | string | | |
| `complexity` | string | | |
| `comparableReaderExperience` | string | | |
| `discussionGuideHooks` | string[] | | M18 |

### 2.7 Layer 7 — Commercial Genome (`genome.commercial`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `positioningStatement` | string | | M14 |
| `keywords` | string[] | | M13 |
| `categories` | string[] | BISAC-like | M13 |
| `pricingIntent` | string | | M15 |
| `territoriesIntent` | string[] | | M15 |
| `formatsIntent` | string[] | print,ebook,audio | M13 |
| `launchHypothesis` | string | | M0/M14 |

### 2.8 Layer 8 — Franchise Genome (`genome.franchise`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `universeName` | string | | M19 |
| `spinoffPotential` | string | | M19 |
| `sharedCharacters` | ref:character[] | | |
| `canonPolicy` | string | | M19 |
| `adaptationPotential` | string | | M19 |

### 2.9 Layer 9 — Publishing Genome (`genome.publishing`)

| Path | Type | Description | Gate hints |
|------|------|-------------|------------|
| `imprint` | string | | M13 |
| `editorialPath` | string | | |
| `productionNotes` | string | | M13 |
| `distributionNotes` | string | | M15 |
| `accessibilityTargets` | string[] | | M13 |
| `legalNotes` | string | | |

### 2.10 Layer 10 — Evolution Genome (`genome.evolution`)

| Path | Type | Description |
|------|------|-------------|
| `versionNotes` | string | |
| `majorPivots` | object[] | `{date, summary, decisionId?}` |
| `lessonsLearned` | string[] | |
| `postPubChangeLog` | string[] | M17+ |

---

## 3. Story Genome (`books.story_genome`) — Volume XIV (selected)

| Path | Type | Gate |
|------|------|------|
| `identity.storyQuestion` | string | M2 |
| `premise.whatIf` | string | M2 |
| `structure.pattern` | string | M4 |
| `conflict.primary` | string | M2 |
| `conflict.secondary` | string[] | |
| `emotion.openingFeel` | string | M4 |
| `emotion.midpointFeel` | string | M4 |
| `emotion.endingFeel` | string | M4 |
| `theme.statement` | string | M3 |
| `mystery.openLoops` | string[] | M5–M8 |
| `pacing.riskNotes` | string | M8–M10 |
| `continuity.riskNotes` | string | M9 |
| `health.scores` | object | derived |

---

## 4. Character Relational Columns + Genome — Volume XIII

### 4.1 Relational columns (queryable)

`name`, `role`, `status`, `summary`, `core_wound`, `core_desire`, `core_fear`, `arc`, `voice_profile`, `importance`, `genome jsonb`

### 4.2 Extended `characters.genome` domains

#### Domain I — Identity
`identity.aliases[]`, `identity.titles[]`, `identity.nicknames[]`, `identity.species`, `identity.gender`, `identity.age`, `identity.birthday`, `identity.occupation`, `identity.socialClass`

#### Domain II — Physical
`physical.height`, `physical.weight`, `physical.hair`, `physical.eyes`, `physical.voice`, `physical.scars`, `physical.clothing`, `physical.distinguishingFeatures[]`

#### Domain III — Psychological
`psych.need`, `psych.want`, `psych.lieBelieved`, `psych.fatalFlaw`, `psych.greatestStrength`, `psych.motivation`, `psych.internalConflict`, `psych.externalConflict`, `psych.transformation`

#### Domain IV — Personality
`personality.traits[]`, `personality.values[]`, `personality.temperament`, `personality.mbtiOrOther`, `personality.shadow`

#### Domain V — Behavioral
`behavior.habits[]`, `behavior.skills[]`, `behavior.tactics[]`, `behavior.stressResponse`

#### Domain VI — Relationship
`relationships.summary`, `relationships.keyPartnerIds[]`

#### Domain VII — Narrative
`narrative.pov`, `narrative.introductionSceneId`, `narrative.finalSceneId`, `narrative.secrets[]`, `narrative.reveals[]`, `narrative.foreshadowing[]`

#### Domain VIII — Communication
`communication.diction`, `communication.catchphrases[]`, `communication.languages[]`, `communication.dialogueNotes`

#### Domain IX — Skills
`skills.competencies[]`, `skills.knowledgeDomains[]`, `skills.limitations[]`

#### Domain X — Cultural
`cultural.background`, `cultural.beliefs`, `cultural.traditions`, `cultural.taboos[]`

#### Domain XI — Commercial
`commercial.merchPotential`, `commercial.iconographyNotes`

#### Domain XII — Evolution
`evolution.arcStages[]`, `evolution.versionNotes`

### 4.3 Character required-by-importance rules

If `role in (protagonist, antagonist)` OR `importance >= 70`:

- REQUIRED by M3: `name`, `role`, `core_desire`, `core_fear`, `summary`  
- REQUIRED by M6: `arc` or `genome.psych.transformation`, `voice_profile`  

---

## 5. Chapter / Scene fields

### Chapters
| Column/Path | Type | Notes |
|-------------|------|-------|
| sequence | int | unique per book |
| title | string | |
| purpose | string | M6 |
| pov_character_id | uuid? | |
| pov_label | string? | |
| emotional_shift | string | |
| word_goal | int | |
| word_count | int | derived |
| manuscript | text | Studio |
| status | enum | planned→approved |
| metadata.actId | string | |
| metadata.stakes | string | |
| metadata.outlineNotes | string | M5 |

### Scenes
| Column/Path | Type | Notes |
|-------------|------|-------|
| chapter_id | uuid | required |
| sequence | int | unique per chapter |
| title | string | |
| purpose / goal / conflict / outcome | string | M7 |
| emotional_shift | string | |
| location_id | uuid? | |
| pov_character_id | uuid? | |
| word_count | int | |
| status | enum | |
| genome | jsonb | optional dramatic metadata |

---

## 6. Canon / Timeline / Relationship fields

### Canon fact
`domain` (character|world|timeline|object|theme|other), `fact`, `status`, `source_label`, `source_entity_type`, `source_entity_id`, `confidence`, `risk`, `effective_from`, `effective_to`, `supersedes_id`

### Timeline event
`absolute_time`, `relative_time`, `event`, `importance`, `canon_status`, `location_id`, `notes`

### Relationship
`source_type`, `source_id`, `relationship_type`, `target_type`, `target_id`, `strength`, `confidence`, `status`, `evidence`, `effective_from`, `effective_to`

---

## 7. Editorial issue fields

| Field | Type | Notes |
|-------|------|-------|
| title | string | required |
| category | enum | FR-EDIT-002 |
| subcategory | string | optional |
| severity | enum | |
| priority | int 0–100 | optional |
| description | string | |
| suggested_fix | string | |
| status | enum | workflow |
| chapter_id / scene_id / character_id | uuid? | |
| assignee_user_id | uuid? | |
| root_cause | string | high+ |
| lesson_learned | string | high+ |
| resolution | string | on resolve |
| ai_recommendation | string | optional |
| related_issue_ids | uuid[] | metadata |

---

## 8. Asset / Metadata / Campaign fields

### Asset
`name`, `asset_type`, `format`, `storage_bucket`, `storage_path`, `status`, `version`, `checksum`, `metadata.dimensions`, `metadata.colorProfile`, `metadata.copyright`, `approved_by`, `approved_at`

### ISBN record
`isbn13`, `format`, `product_id`, `status` (unassigned|reserved|assigned|retired), `notes`

### Metadata (books.metadata)
`blurb`, `shortBlurb`, `keywords[]`, `categories[]`, `contributors[]`, `copyrightYear`, `publisherName`, `imprint`, `publicationDate`, `pageCount`, `accessibilitySummary`

### Campaign
`name`, `channel`, `objective`, `budget`, `status`, `progress`, `kpis`, `starts_at`, `ends_at`

---

## 9. Validation snippets (normative)

```ts
const MILESTONE_RE = /^M([0-9]|1[0-9]|20)$/;
function assertImportance(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new ValidationError('importance');
}
function assertIsbn13(isbn: string) {
  // ISO 2108 checksum validation
}
```

---

## 10. Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial genome/entity dictionary |
