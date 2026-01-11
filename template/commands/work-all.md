# Work All - Process All Open Issues

Autonomously work through all open GitHub issues using context-isolated subagents.

## Workflow Mode

```
WORKFLOW_MODE: all-issues
AUTO_MERGE: true (handled by this orchestrator (aka Product Owner) after work completes)
```

---

## Instructions

You are the **Autonomous Implementation Orchestrator**. You:
1. Select issues based on dependencies and priority
2. Run the work playbook for each issue in isolation (new Codex tab/run)
3. Parse output to determine result
4. Merge successful PRs
5. Enforce circuit breaker limits

---

## Load Context

1. Load the `workflow-orchestration` skill
2. Load the `github-workflow` skill
3. Check for `implementation-plan.md` (if exists, follow it)

---

## Circuit Breaker Limits

Set limits up front (tune as needed for your repo):

| Limit | Default | Action When Exceeded |
|-------|---------|---------------------|
| `maxIssuesPerRun` | 20 | Stop, report progress |
| `maxEscalationsBeforeStop` | 3 | Stop, notify human |
| `maxConsecutiveFailures` | 3 | Stop, notify human |

Initialize counters:
```
issuesProcessed = 0
escalationCount = 0
consecutiveFailures = 0
```

---

## Main Loop

```
LOOP:
  1. CHECK LIMITS
     - If issuesProcessed >= maxIssuesPerRun → Stop (limit reached)
     - If escalationCount >= maxEscalationsBeforeStop → Stop (escalation limit)
     - If consecutiveFailures >= maxConsecutiveFailures → Stop (failure limit)

  2. LIST OPEN ISSUES
     - Check milestones and priorities
     - If no open issues → Notify complete, exit

  3. SELECT NEXT ISSUE
     - Follow implementation-plan.md if exists
     - Otherwise use selection criteria (see below)
     - Check dependencies (skip if blocked)

  4. RUN WORK PLAYBOOK IN ISOLATION
     - Start a fresh Codex run (or new tab) using the work playbook for {issue_number}
     - Keep context limited to that issue
     - Wait for completion and capture the summary output

  5. PARSE RESULT
     - SUCCESS: Output contains "PR #X is ready" or "All required reviews complete"
     - BLOCKED: Output contains "blocked" or "dependency"
     - ESCALATED: Output contains "Escalating" or "stuck"

  6. HANDLE RESULT
     - SUCCESS: Merge PR, reset consecutiveFailures, increment issuesProcessed
     - BLOCKED: Skip issue, continue to next
     - ESCALATED: Increment escalationCount, consecutiveFailures

  7. CONTINUE
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

## Running Work in Isolation

For each issue:
1. Open a new Codex run/tab so context stays small.
2. Load the work playbook (`.codex/commands/work.md`) with `ISSUE_NUMBER = {issue_number}`.
3. Follow the `work-issue` skill end-to-end (deps, implementation, reviews, tester).
4. Report the result explicitly in the output:
   - SUCCESS: `PR #X is ready for merge`
   - BLOCKED: `Issue #{issue_number} is blocked on #Y`
   - ESCALATED: `Issue #{issue_number} requires human intervention`

---

## Result Parsing

After subagent completes, check output for:

**SUCCESS indicators:**
- "PR #X is ready"
- "All required reviews complete"
- "ready for merge"

**BLOCKED indicators:**
- "blocked"
- "dependency"
- "cannot proceed"

**ESCALATED indicators:**
- "Escalating"
- "stuck"
- "requires human"
- "unable to resolve"

---

## Merge on Success

When result is SUCCESS:

```bash
# Get PR number from subagent output
PR_NUMBER=[parsed from output]

# Post verification
gh pr comment {PR_NUMBER} --body "**[Product Owner]**

All required reviews complete. Proceeding with merge.

Issue processed: {issuesProcessed + 1} of max {maxIssuesPerRun}"

# Merge
gh pr merge {PR_NUMBER} --squash --delete-branch

# Verify issue closed
gh issue view {issue_number} --json state --jq '.state'
```

---

## Progress Reporting

After each issue:

```
Issue #{number}: [SUCCESS/BLOCKED/ESCALATED]
Progress: {issuesProcessed}/{maxIssuesPerRun} issues
Escalations: {escalationCount}/{maxEscalationsBeforeStop}
Current milestone: [name] - [x/y] complete
```

---

## Stopping Conditions

Stop the loop when ANY of these occur:

1. **All issues complete** → Notify success
2. **Limit reached** (`maxIssuesPerRun`) → Report progress, suggest continuing later
3. **Escalation limit** (`maxEscalationsBeforeStop`) → Notify human intervention needed
4. **Failure limit** (`maxConsecutiveFailures`) → Notify something is wrong
5. **All remaining issues blocked** → Notify circular dependency or external blocker

---

## Completion Notifications

**All complete:**
```bash
\.codex/hooks/request-attention.sh complete "All issues implemented and merged!"
```

**Limit reached:**
```bash
\.codex/hooks/request-attention.sh info "Processed {n} issues. Run work-all again to continue."
```

**Escalation/Failure limit:**
```bash
\.codex/hooks/request-attention.sh stuck "Stopped after {n} escalations. Human intervention needed."
```

---

## Final Summary

When stopping for any reason:

```
## Work-All Summary

**Status:** [Complete / Limit Reached / Stopped - Human Needed]

**Issues Processed:** {issuesProcessed}
**Successful Merges:** {successCount}
**Blocked:** {blockedCount}
**Escalated:** {escalatedCount}

**Remaining Open Issues:** {count}

[If applicable: Suggest next steps]
```

---

Begin by loading skills, reading limits from settings, then listing all open issues.
