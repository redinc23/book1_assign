# Appendix — Milestone Engine Checklists & Gate Matrix
# MANGU POS Build Spec Pack

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-LIFE-001` |
| Version | `1.0.0` |
| Normative for | FR-LIFE-*, TS-DOM-READY |

Default checklist seeds for M0–M20. Workspaces MAY customize item titles; **blocker codes** remain stable.

Legend: **BLOCK** = blocks advance; **WARN** = surfaces warning but not hard-block unless workspace policy elevates.

---

## Global gate policies

1. Open editorial issues with `severity=critical` → **BLOCK** for advance to M12 approval and any M13–M16 advance (`CRITICAL_ISSUES_OPEN`).
2. Waiver Decision may bypass specific blocker codes listed in `decisions.metadata.waives: string[]`.
3. Readiness score = `0.5 * checklist% + 0.5 * structural%` (structural = automated blocker absence), clamped 0–100.
4. `ready_for_review` when readiness ≥ 90 and no BLOCK items; approval still required for advance.

---

## M0 — Market Intelligence

**Intent:** Decide whether the title deserves investment.

| Checklist item | Blocker code if incomplete |
|----------------|----------------------------|
| Market notes captured (comps, category demand) | `M0_MARKET_NOTES` |
| Go / No-Go Decision recorded | `M0_GO_DECISION` |
| Risk assumptions listed | WARN `M0_RISKS` |

**Structural:** `decisions` contains go/no-go OR genome.commercial.launchHypothesis present.

---

## M1 — Concept Discovery

| Item | Code |
|------|------|
| Working title set | `M1_TITLE` |
| Logline or hook present | `M1_LOGLINE_HOOK` |
| Audience defined | `M1_AUDIENCE` |
| Publication type selected | `M1_PUB_TYPE` |

---

## M2 — Story Foundation

| Item | Code |
|------|------|
| Premise documented | `M2_PREMISE` |
| Central conflict documented | `M2_CONFLICT` |
| External & internal stakes documented | `M2_STAKES` |
| Promise to reader documented | `M2_PROMISE` |

---

## M3 — Book Genome

| Item | Code |
|------|------|
| Identity layer completeness ≥ threshold | `M3_IDENTITY` |
| Creative layer completeness ≥ threshold | `M3_CREATIVE` |
| Narrative essentials present | `M3_NARRATIVE` |
| Protagonist character exists | `PROTAGONIST_MISSING` |
| Primary theme set | `M3_THEME` |

Default threshold: 70% of configured required paths.

---

## M4 — Story Architecture

| Item | Code |
|------|------|
| Structure pattern selected | `M4_STRUCTURE` |
| Acts defined (≥1) | `M4_ACTS` |
| Ending intent noted | `M4_ENDING` |
| POV strategy set | `M4_POV` |

---

## M5 — Outline Development

| Item | Code |
|------|------|
| Outline notes present at book or chapter level | `M5_OUTLINE` |
| Beat list drafted OR chapter purposes drafted | `M5_BEATS` |
| Open mystery loops listed (if genre needs) | WARN `M5_LOOPS` |

---

## M6 — Chapter Planning

| Item | Code |
|------|------|
| Chapter count ≥ workspace min (default 8) | `CHAPTERS_INSUFFICIENT` |
| Each chapter has title + purpose | `M6_CHAPTER_PURPOSE` |
| Sequences unique and contiguous policy OK | `M6_SEQUENCE` |
| POV assigned for ≥80% chapters | WARN `M6_POV_COVERAGE` |

---

## M7 — Scene Planning

| Item | Code |
|------|------|
| Each chapter has ≥1 scene OR waiver | `SCENES_INCOMPLETE` |
| Scenes have goal + conflict | `M7_SCENE_DRAMATICS` |
| Locations assigned for major scenes | WARN `M7_LOCATIONS` |

---

## M8 — First Draft

| Item | Code |
|------|------|
| word_count ≥ 80% word_goal (configurable) | `WORDCOUNT_BELOW_THRESHOLD` |
| No chapter left in `planned` with empty manuscript | `M8_EMPTY_CHAPTERS` |
| Cast principals appear in manuscript (heuristic/manual check) | WARN `M8_CAST_APPEARANCE` |
| Draft complete Decision or checklist ack | `M8_DRAFT_ACK` |

---

## M9 — Developmental Editing

| Item | Code |
|------|------|
| Dev edit pass checklist complete | `M9_CHECKLIST` |
| No open critical issues | `CRITICAL_ISSUES_OPEN` |
| High story/character issues resolved or waived | `M9_HIGH_STORY_ISSUES` |
| Story health reviewed | WARN `M9_HEALTH_REVIEW` |

---

## M10 — Line Editing

| Item | Code |
|------|------|
| Line edit checklist complete | `M10_CHECKLIST` |
| Voice/style issues triaged | `M10_VOICE` |
| No open critical issues | `CRITICAL_ISSUES_OPEN` |

---

## M11 — Copyediting

| Item | Code |
|------|------|
| Copyedit checklist complete | `M11_CHECKLIST` |
| Style guide acknowledged | `M11_STYLEGUIDE` |
| Grammar category issues open count = 0 or waived | `M11_GRAMMAR_OPEN` |

---

## M12 — Proofreading

| Item | Code |
|------|------|
| Proof checklist complete | `M12_CHECKLIST` |
| Zero critical open issues | `CRITICAL_ISSUES_OPEN` |
| Final text freeze Decision | `M12_TEXT_FREEZE` |

---

## M13 — Production

| Item | Code |
|------|------|
| Required products defined | `M13_PRODUCTS` |
| Cover asset approved | `ASSET_COVER_UNAPPROVED` |
| Interior or ebook package approved | `ASSET_INTERIOR_UNAPPROVED` |
| ISBN assigned for required formats | `ISBN_MISSING` |
| Metadata completeness ≥ 90% | `METADATA_INCOMPLETE` |
| Accessibility notes captured | WARN `M13_A11Y` |
| Preflight all green | `M13_PREFLIGHT` |

---

## M14 — Marketing Preparation

| Item | Code |
|------|------|
| Marketing brief exists | `M14_BRIEF` |
| ≥1 campaign ready/scheduled | `CAMPAIGN_MISSING` |
| Cover reveal / social assets planned | `M14_SOCIAL` |
| ARC plan noted (or N/A waiver) | WARN `M14_ARC` |

---

## M15 — Pre-Launch

| Item | Code |
|------|------|
| Distribution targets selected | `M15_DISTRIBUTION` |
| Price record exists | `PRICE_MISSING` |
| Retail metadata packet exported/reviewed | `M15_PACKET` |
| Launch date set | `M15_LAUNCH_DATE` |
| Pre-launch checklist green | `M15_CHECKLIST` |

---

## M16 — Publication

| Item | Code |
|------|------|
| Publisher approval Decision | `PUBLISHER_APPROVAL_MISSING` |
| Products marked released | `M16_RELEASE_FLAGS` |
| Live links / channel confirmations recorded | `M16_CHANNEL_CONFIRM` |
| Publication event logged | `M16_EVENT` |

---

## M17 — Post-Launch

| Item | Code |
|------|------|
| Monitoring checklist started | `M17_MONITOR` |
| Review response plan | WARN `M17_REVIEWS` |
| Hotfix process acknowledged | WARN `M17_HOTFIX` |

---

## M18 — Catalog Growth

| Item | Code |
|------|------|
| Catalog placement notes | `M18_CATALOG` |
| Related titles / cross-promo notes | WARN `M18_CROSS` |
| Backlist pricing review | WARN `M18_BACKLIST` |

---

## M19 — Franchise Expansion

| Item | Code |
|------|------|
| Expansion Decision (pursue/defer/reject) | `M19_DECISION` |
| Rights opportunities listed | WARN `M19_RIGHTS` |
| Series/universe implications noted | WARN `M19_UNIVERSE` |

---

## M20 — Legacy Management

| Item | Code |
|------|------|
| Stewardship plan fields recorded | `M20_STEWARDSHIP` |
| Archive/reissue policy noted | `M20_ARCHIVE` |
| Canon custody owner assigned | WARN `M20_CUSTODY` |

---

## Readiness API example response

```json
{
  "milestone": "M8",
  "readiness": 72,
  "checklistCompletion": 66,
  "blockers": [
    {
      "code": "WORDCOUNT_BELOW_THRESHOLD",
      "message": "Word count 54,000 is below 80% of goal 80,000",
      "severity": "block"
    }
  ]
}
```

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial M0–M20 checklist & gate matrix |
