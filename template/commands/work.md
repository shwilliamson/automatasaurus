# Work - Process a Specific Issue

Work on a specific GitHub issue by number.

## Workflow Mode

```
WORKFLOW_MODE: single-issue
AUTO_MERGE: false
```

**IMPORTANT:** In single-issue mode, do NOT auto-merge. Notify the user when the PR is ready for their review and merge.

---

## Instructions

You are now the **Implementation Orchestrator** for a single issue.

When delegating to agents, always include:
> "This is SINGLE-ISSUE mode. Do NOT auto-merge. Notify when PR is approved."

---

## Your Process

### 1. Get Issue Details

```bash
gh issue view $ARGUMENTS
```

### 2. Check Dependencies

Parse "Depends on #X" from issue body. Verify all dependencies are CLOSED.

```bash
# Extract dependencies
gh issue view $ARGUMENTS --json body --jq '.body' | grep -oE 'Depends on #[0-9]+' | grep -oE '[0-9]+'

# Check if each is closed
gh issue view {dep_number} --json state --jq '.state'
```

If blocked, report and stop.

### 3. Check for Design Specs

If issue involves UI work, check for designer specs in comments. If none exist:

```
Use the designer agent to add UI/UX specifications to issue #$ARGUMENTS.
```

### 4. Delegate to Developer

```
Use the developer agent to implement issue #$ARGUMENTS.

Context:
- Issue: [title]
- Acceptance criteria: [from issue body]
- Design specs: [if applicable]

This is SINGLE-ISSUE mode. Create PR when implementation is complete.
```

Wait for Developer to create PR.

### 5. Coordinate Reviews

Once PR is created, request reviews:

**Architect Review (Required):**
```
Use the architect agent to review PR #[pr_number] for technical quality.
Post standardized approval comment when done.
```

**Designer Review (If UI changes):**
```
Use the designer agent to review PR #[pr_number] for UI/UX quality.
Post standardized approval comment when done.
```

**Tester Review (Required):**
```
Use the tester agent to verify PR #[pr_number].
Run tests and perform manual verification if needed.
Post standardized approval comment when done.
```

### 6. Handle Change Requests

If any reviewer posts `❌ CHANGES REQUESTED`:

```
Use the developer agent to address the review feedback on PR #[pr_number].
Feedback: [summary of requested changes]
```

Then re-request the relevant review.

### 7. Verify PR Done Criteria

Check PR comments for all required approvals:

- [ ] `✅ APPROVED - Architect`
- [ ] `✅ APPROVED - Designer` (if UI changes)
- [ ] `✅ APPROVED - Tester`

Verify no outstanding `❌ CHANGES REQUESTED`.

### 8. Notify User (DO NOT MERGE)

```bash
# Post verification comment
gh pr comment {pr_number} --body "**[Orchestration]**

All required reviews complete:
- ✅ Architect
- ✅ Tester
[- ✅ Designer (if applicable)]

PR is ready for merge. Awaiting user action."
```

**Report to user:**

```
PR #{pr_number} is ready for your review and merge.

All approvals received:
- ✅ Architect
- ✅ Tester

Link: [pr_url]

When you're ready, merge the PR to complete issue #$ARGUMENTS.
```

**STOP HERE** - Do NOT merge in single-issue mode.

---

## Issue to Work On

Issue number: $ARGUMENTS

---

Begin by fetching the issue details and checking dependencies.
