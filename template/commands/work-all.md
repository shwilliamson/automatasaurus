# Work All - Process All Open Issues

Autonomously work through all open GitHub issues.

## Workflow Mode

```
WORKFLOW_MODE: all-issues
AUTO_MERGE: true
```

**IMPORTANT:** In all-issues mode, auto-merge PRs after verifying all approvals and continue to the next issue autonomously.

---

## Instructions

You are now the **Autonomous Implementation Orchestrator**.

When delegating to agents, always include:
> "This is ALL-ISSUES mode. Auto-merge after approvals and continue to next issue."

---

## Load Context

1. Load the `workflow-orchestration` skill
2. Load the `github-workflow` skill
3. Check for `implementation-plan.md` (if exists, follow it)

---

## Main Loop

```
LOOP:
  1. LIST OPEN ISSUES
     - Check milestones and priorities
     - If no open issues → Notify complete, exit

  2. SELECT NEXT ISSUE
     - Follow implementation-plan.md if exists
     - Otherwise use selection criteria (see below)

  3. IMPLEMENT ISSUE
     - Check dependencies (all closed?)
     - Get design specs if needed
     - Delegate to Developer

  4. COORDINATE REVIEWS
     - Architect review (required)
     - Designer review (if UI)
     - Tester review (required)
     - Handle change requests

  5. VERIFY & MERGE
     - Check all approvals received
     - Post verification comment
     - Merge PR
     - Verify issue closed

  6. CONTINUE
     - Report progress
     - Loop back to step 1

END LOOP
```

---

## Issue Selection Criteria

If no `implementation-plan.md` exists, select issues by:

### 1. Milestone First
- Complete current milestone before next
- Milestones in order (v1.0 before v1.1)

### 2. Dependencies
- Issues with no open dependencies first
- Issues that unblock others prioritized

### 3. Priority Labels
- `priority:high` → `priority:medium` → `priority:low`

### 4. Logical Order
- Foundation (schemas, models) before features
- Backend before frontend if applicable

---

## For Each Issue

### Step 1: Check Dependencies

```bash
gh issue view {number} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+' | grep -oE '[0-9]+'
```

If any dependency is open, skip to next issue.

### Step 2: Get Design Specs (If UI)

```
Use the designer agent to add UI/UX specifications to issue #{number}.
```

### Step 3: Delegate to Developer

```
Use the developer agent to implement issue #{number}.

Context:
- Issue: [title]
- Acceptance criteria: [from issue body]
- Design specs: [if applicable]

This is ALL-ISSUES mode. Create PR when implementation is complete.
```

### Step 4: Coordinate Reviews

**Architect:**
```
Use the architect agent to review PR #{pr_number} for technical quality.
```

**Designer (if UI):**
```
Use the designer agent to review PR #{pr_number} for UI/UX quality.
```

**Tester:**
```
Use the tester agent to verify PR #{pr_number}.
Run tests and perform manual verification if needed.
```

### Step 5: Handle Change Requests

If `❌ CHANGES REQUESTED`:
```
Use the developer agent to address the review feedback on PR #{pr_number}.
```

Then re-request the relevant review.

### Step 6: Verify & Merge

Check for all required approvals:
- `✅ APPROVED - Architect`
- `✅ APPROVED - Designer` (if UI)
- `✅ APPROVED - Tester`

```bash
# Post verification
gh pr comment {pr_number} --body "**[Orchestration]**

All required reviews complete:
- ✅ Architect
- ✅ Tester

Proceeding with merge."

# Approve
gh pr review {pr_number} --approve --body "**[Orchestration]** All reviews verified."

# Merge
gh pr merge {pr_number} --squash --delete-branch

# Verify issue closed
gh issue view {issue_number} --json state --jq '.state'
```

### Step 7: Report & Continue

```
Issue #{number} complete. PR #{pr_number} merged.

Progress: [X/Y] issues complete
Current milestone: [milestone] - [a/b] complete

Continuing to next issue...
```

---

## Handling Blockers

### Developer Stuck (After 5 Attempts)

```
Use the architect agent to analyze the stuck issue #{number}.

Developer has tried:
1. [attempt 1]
2. [attempt 2]
...

Error: [error message]
```

If Architect also stuck → Notify human:
```bash
.claude/hooks/request-attention.sh stuck "Unable to resolve issue #{number}. [description]"
```

Mark issue as blocked and continue to next issue.

### All Issues Blocked

If all remaining issues are blocked:
```bash
.claude/hooks/request-attention.sh stuck "All issues blocked. Circular dependency or external blocker."
```

---

## Completion

When all issues are closed:

```bash
.claude/hooks/request-attention.sh complete "All issues implemented and merged!"
```

Report final summary:
```
All work complete!

Completed: [N] issues
Milestones finished: [list]
Total PRs merged: [N]
```

---

Begin by listing all open issues and selecting the first one to work on.
