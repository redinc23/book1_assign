# Appendix — RBAC & Capability Matrix
# MANGU POS Build Spec Pack

| Field | Value |
|-------|-------|
| Document ID | `MANGU-POS-RBAC-001` |
| Version | `1.0.0` |
| Normative for | FR-TENANT-004, TS-SEC-CAP |

## Roles

| Role | Description |
|------|-------------|
| `owner` | Full control of workspace |
| `publisher` | Business approvals, portfolio |
| `editor_dev` | Developmental editorial authority |
| `editor_line` | Line/copy/proof |
| `author` | Creative content on assigned books |
| `producer` | Production assets |
| `marketer` | Campaigns |
| `rights_manager` | Rights & licensing |
| `analyst` | Read dashboards |
| `viewer` | Read-only |
| `agent_service` | Server principal only |

## Capability matrix

Legend: **Y** = allowed by default role; **—** = denied; **A** = allowed only for books where user is owner/assignee (implementation MAY start as Y for members in Phase 1, tighten Phase 2).

| Capability | owner | publisher | editor_dev | editor_line | author | producer | marketer | rights_manager | analyst | viewer |
|------------|:-----:|:---------:|:----------:|:-----------:|:------:|:--------:|:--------:|:--------------:|:-------:|:------:|
| book.create | Y | Y | Y | — | Y | — | — | — | — | — |
| book.archive | Y | Y | — | — | A | — | — | — | — | — |
| book.delete | Y | — | — | — | — | — | — | — | — | — |
| genome.edit | Y | Y | Y | — | A | — | — | — | — | — |
| character.edit | Y | Y | Y | — | A | — | — | — | — | — |
| manuscript.edit | Y | Y | Y | Y | A | — | — | — | — | — |
| milestone.advance | Y | Y | Y | — | — | — | — | — | — | — |
| milestone.approve | Y | Y | — | — | — | — | — | — | — | — |
| editorial.create | Y | Y | Y | Y | Y | Y | Y | — | — | — |
| editorial.verify | Y | Y | Y | Y | — | — | — | — | — | — |
| asset.upload | Y | Y | — | — | — | Y | Y | — | — | — |
| asset.approve | Y | Y | — | — | — | Y | — | — | — | — |
| campaign.edit | Y | Y | — | — | — | — | Y | — | — | — |
| rights.edit | Y | Y | — | — | — | — | — | Y | — | — |
| agent.run | Y | Y | Y | Y | Y | Y | Y | Y | — | — |
| agent.approve | Y | Y | Y | — | — | — | — | — | — | — |
| members.manage | Y | Y | — | — | — | — | — | — | — | — |
| workspace.settings | Y | Y | — | — | — | — | — | — | — | — |
| export.run | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| import.run | Y | Y | — | — | — | — | — | — | — | — |
| snapshot.restore | Y | Y | — | — | — | — | — | — | — | — |
| sales.import | Y | Y | — | — | — | — | — | — | Y | — |
| read.all | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

### Critical risk agent approvals

Proposals with `riskClass=critical` require role `publisher` or `owner` regardless of `agent.approve` on lower roles.

## Suggested SQL helper

```sql
create or replace function public.has_capability(target_workspace uuid, cap text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and (
        wm.role = 'owner'
        or cap = any(wm.capabilities)
        or cap = any(public.role_default_capabilities(wm.role))
      )
  );
$$;
```

`role_default_capabilities(role)` returns the matrix defaults above.

## QA test matrix (minimum)

For each role fixture user:

1. Attempt `advance_milestone` to M16  
2. Attempt `asset.approve`  
3. Attempt `members.manage` invite  
4. Attempt cross-workspace read  

Expect allow/deny per table.

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-07-19 | Initial RBAC matrix |
