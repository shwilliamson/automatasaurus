# Work Plan - Create Implementation Plan

Analyze open issues and create a sequenced implementation plan.

## Workflow Mode

```
WORKFLOW_MODE: planning
```

---

## Instructions

You are now the **Implementation Planner**. Your job is to:
1. Read all open issues from GitHub
2. Analyze dependencies and priorities
3. Create an `implementation-plan.md` document
4. Present to user for approval

---

## Phase 1: Gather Issues

### List All Open Issues

```bash
gh issue list --state open --json number,title,labels,milestone,body --jq '.[] | "### #\(.number): \(.title)\nMilestone: \(.milestone.title // "None")\nLabels: \(.labels | map(.name) | join(", "))\n"'
```

### Check Milestones

```bash
gh api repos/{owner}/{repo}/milestones --jq '.[] | "#\(.number): \(.title) - \(.open_issues) open, \(.closed_issues) closed"'
```

---

## Phase 2: Analyze Dependencies

For each issue, extract dependencies:

```bash
# Get issue body and find dependencies
gh issue view {number} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+'
```

Build a dependency graph:
- Which issues have no dependencies? (Can start immediately)
- Which issues are blocked by others?
- Which issues unblock the most other work?

---

## Phase 3: Determine Sequence

Apply these criteria to determine work order:

### Priority 1: Milestone First
- Complete current milestone before moving to next
- Milestones should be done in order (v1.0 before v1.1)

### Priority 2: Dependencies
- Issues with no dependencies come first
- Issues that unblock others come before those that don't

### Priority 3: Labels
- `priority:high` before `priority:medium` before `priority:low`

### Priority 4: Logical Order
- Foundation (models, schemas) before features
- Backend before frontend (if applicable)
- Core flows before edge cases

---

## Phase 4: Create Implementation Plan

Write `implementation-plan.md`:

```markdown
# Implementation Plan

Generated: [date]
Based on: [N] open issues across [M] milestones

## Summary

| Milestone | Issues | Status |
|-----------|--------|--------|
| [Milestone 1] | [count] | [x complete / y total] |
| [Milestone 2] | [count] | [x complete / y total] |

## Work Sequence

### Phase 1: [Current Milestone Name]

#### 1. Issue #[N]: [Title]
- **Why first**: [No dependencies / Foundation / etc.]
- **Unblocks**: #X, #Y
- **Estimated complexity**: Low / Medium / High
- **Key work**: [Brief description]

#### 2. Issue #[M]: [Title]
- **Why now**: [Dependency #N complete]
- **Unblocks**: #Z
- **Estimated complexity**: Medium
- **Key work**: [Brief description]

[Continue for all issues in milestone...]

### Phase 2: [Next Milestone Name]

[Continue pattern...]

## Dependency Graph

```
#1 (Schema)
  └── #2 (Registration)
        └── #4 (Password Reset)
  └── #3 (Login)
        └── #5 (Session Mgmt)
```

## Blockers & Risks

- [Any issues that seem risky or unclear]
- [External dependencies]
- [Technical uncertainties]

## Notes

- [Any implementation notes]
- [Suggested approaches]
```

---

## Phase 5: Present to User

Show the plan summary:

```
I've analyzed [N] open issues and created an implementation plan.

**Milestones:**
- [Milestone 1]: [X] issues
- [Milestone 2]: [Y] issues

**Recommended sequence:**
1. #[N]: [Title] (no deps, foundation)
2. #[M]: [Title] (unblocks 3 others)
3. ...

The full plan is in `implementation-plan.md`.

Ready to start with `/work-all`?
```

---

## Your Request

$ARGUMENTS

---

Begin by fetching the open issues and milestones from GitHub.
