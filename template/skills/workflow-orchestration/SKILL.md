---
name: workflow-orchestration
description: Defines the autonomous development workflow loop. Use when coordinating work between agents, managing issue lifecycles, or running the main development loop.
---

# Workflow Orchestration

This skill defines the Automatasaurus autonomous development workflow.

## Workflow Modes

The system operates in different modes depending on how work is initiated:

| Mode | Command | Description | Merge Behavior |
|------|---------|-------------|----------------|
| `discovery` | `/discovery` | Interactive planning with user | N/A - creates issues |
| `single-issue` | `/work {number}` | Work on one specific issue | **Notify only** - user merges |
| `all-issues` | `/work-all` | Process all open issues | **Auto-merge** and continue |

### Mode Context Passing

When delegating to agents, always pass the current mode:

```
# Single-issue mode
"This is SINGLE-ISSUE mode. Do NOT auto-merge. Notify user when PR is approved."

# All-issues mode
"This is ALL-ISSUES mode. Auto-merge after approvals and continue to next issue."
```

### Mode Enforcement

**CRITICAL:** The merge step must respect the current mode:

- **Single-issue mode**: After all approvals, post verification comment but **DO NOT merge**. Report to user that PR is ready.
- **All-issues mode**: After all approvals, post verification comment, approve, **merge**, and continue to next issue.

**Default behavior:** If mode is unclear, default to `single-issue` (safer - don't auto-merge).

---

## Two-Phase Workflow

### Phase 1: Planning (Interactive with User)

User initiates with a request like "Let's plan [feature/project]"

```
1. Product Owner: Gather requirements from user
   - Ask clarifying questions
   - Document acceptance criteria

2. Architect: Make technology decisions
   - Create ADRs for significant decisions
   - Define technical approach

3. Product Owner: Create GitHub issues
   - One issue per PR-sized chunk
   - Include acceptance criteria
   - Add "Depends on #X" for dependencies
   - Apply appropriate labels

4. User: Approve issue breakdown

5. User: Kick off with "Start working on the issues"
```

### Phase 2: Main Loop (PM Coordinated, Autonomous)

PM drives this loop until all issues are complete.

## The Main Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    PM COORDINATION LOOP                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CHECK FOR WORK                                          │
│     gh issue list --state open --json number,title,labels   │
│     - If no open issues → Notify complete, exit             │
│     - Parse dependencies, identify "ready" issues           │
│                                                             │
│  2. SELECT NEXT ISSUE (with PO)                            │
│     - Filter to issues with no open dependencies            │
│     - Consider priority labels                              │
│     - Select highest priority ready issue                   │
│     - Add "in-progress" label                               │
│                                                             │
│  3. ROUTE TO SPECIALISTS                                    │
│     If issue needs UI/UX:                                   │
│       → UI/UX Designer adds specs to issue                 │
│                                                             │
│  4. DEVELOPMENT                                             │
│     → Developer implements (see Developer Flow below)      │
│                                                             │
│  5. PR REVIEW CYCLE (Comment-Based)                         │
│     → Reviewers post standardized comments                 │
│       ✅ APPROVED - [Role] or ❌ CHANGES REQUESTED - [Role] │
│     → Developer addresses feedback                          │
│     (see Review Flow below)                                 │
│                                                             │
│  6. PM VERIFIES & MERGES                                    │
│     → PM checks all required approvals via comments        │
│     → PM posts verification, approves, and merges          │
│                                                             │
│  7. POST-MERGE                                              │
│     - Verify issue closed                                   │
│     - Check if PO needs to create follow-ups               │
│     - Loop back to step 1                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Parsing

Issues declare dependencies in their body:

```markdown
## Dependencies
Depends on #12
Depends on #15
```

**Parsing logic:**
```bash
# Get issue body and extract dependencies
gh issue view {number} --json body -q '.body' | grep -oE 'Depends on #[0-9]+' | grep -oE '[0-9]+'

# Check if dependency is closed
gh issue view {dep_number} --json state -q '.state'
```

An issue is "ready" when:
- All issues it depends on are closed
- It does not have the `blocked` label

## Label State Machine

```
[new issue] → ready (if no deps) or blocked (if deps)
     ↓
ready → in-progress (when selected)
     ↓
in-progress → needs-review (when PR opened)
     ↓
needs-review → [closed] (when PM verifies approvals and merges)
```

| Label | Meaning |
|-------|---------|
| `ready` | No blocking dependencies, can be worked |
| `in-progress` | Currently being implemented |
| `blocked` | Waiting on dependencies or human input |
| `needs-review` | PR open, awaiting code reviews |
| `priority:high` | Work on first |
| `priority:medium` | Normal priority |
| `priority:low` | Work on last |

## Developer Flow

```
1. Create branch
   git checkout -b feature/issue-{number}-{slug}

2. Implement feature
   - Load appropriate language skill
   - Follow coding standards
   - Reference commands.md for project commands

3. Write tests
   - Unit tests for new code
   - Integration tests if needed

4. Run tests (up to 5 attempts)
   - If tests fail, debug and fix
   - Track attempt count
   - After 5 failed attempts → Escalate to Architect

5. If stuck → Escalate
   .claude/hooks/request-attention.sh stuck "Cannot resolve: [description]"
   → Architect analyzes and suggests fixes
   → If Architect also stuck → Notify human

6. Open PR
   gh pr create --title "feat: Description (#123)" --body "..."
   - Include "Closes #123" in body
   - Update issue label to "needs-review"
```

## Review Flow (Comment-Based)

Since all agents share the same GitHub user, reviews are tracked via standardized comments.

### Standardized Review Comments

**Approval:**
```
✅ APPROVED - [Agent Role]
[Summary of review findings]
```

**Changes Requested:**
```
❌ CHANGES REQUESTED - [Agent Role]
[Specific issues to address]
```

### Review Process

```
1. Architect Review (REQUIRED)
   - Review code quality, patterns, architecture
   - Post standardized comment: "**[Architect]** ✅ APPROVED - Architect ..."
   - Or request changes: "**[Architect]** ❌ CHANGES REQUESTED - Architect ..."

2. Product Owner Review (for features)
   - Verify acceptance criteria are met
   - Post standardized comment: "**[Product Owner]** ✅ APPROVED - Product Owner ..."

3. UI/UX Review (if UI-relevant)
   - Review visual implementation
   - Post: "**[UI/UX]** ✅ APPROVED - UI/UX ..." or "**[UI/UX]** N/A - no UI changes"

4. Developer addresses feedback
   - Comment: "**[Developer]** Fixed in {commit}..."
   - Push changes
   - Wait for updated review comments

5. PM Verifies & Merges
   - Check PR comments for all required approvals
   - Post verification comment listing approvals
   - Post official GitHub approval
   - Merge PR
```

## PM Verification & Merge Flow

**CRITICAL:** Behavior depends on workflow mode. Check context passed to you.

### Step 1-3: Same for Both Modes

```
1. Check PR comments for required approvals
   - Look for: ✅ APPROVED - Architect
   - Look for: ✅ APPROVED - Product Owner (for features)
   - Verify no outstanding ❌ CHANGES REQUESTED

2. Verify tests pass
   - Check CI status on PR
   - Ensure all automated tests green

3. Post verification comment
   gh pr comment {number} --body "**[Product Manager]**

   All required reviews complete:
   - ✅ Architect
   - ✅ Product Owner

   [Mode-specific message - see below]"
```

### Single-Issue Mode: STOP and Notify

```
4. DO NOT MERGE - Report to user instead:
   "PR #{number} is ready for your review and merge.

   All approvals received:
   - ✅ Architect
   - ✅ Product Owner

   Link: {pr_url}

   When you're ready, merge the PR to complete the issue."

5. STOP - Wait for user to merge
```

### All-Issues Mode: Auto-Merge and Continue

```
4. Approve and merge
   gh pr review {number} --approve --body "**[Product Manager]** All reviews verified."
   gh pr merge {number} --squash --delete-branch

5. Verify issue auto-closed
   - Check issue state
   - Comment on issue confirming completion

6. Continue to next issue
```

## Escalation Procedures

### Developer → Architect Escalation

After 5 failed attempts to resolve an issue:

```bash
# Developer comments on PR/issue
**[Developer]** Escalating to Architect after 5 attempts.

Issue: [Description of what's failing]
Attempted solutions:
1. [What was tried]
2. [What was tried]
...

# Architect analyzes
**[Architect]** Analysis: [Root cause]
Suggested approach: [Solution]
```

### Architect → Human Escalation

If Architect cannot resolve:

```bash
# Notify human
.claude/hooks/request-attention.sh stuck "Architect escalation: [description]"

# Comment on issue
**[Architect]** Escalating to human. Unable to resolve:
- Problem: [Description]
- Attempted: [What was tried]
- Blocker: [What's preventing resolution]
```

## Comment Format

All agents prefix comments with their identity:

```markdown
**[Product Owner]** Added acceptance criteria for edge case handling.

**[Architect]** Consider extracting this into a separate service.

**[UI/UX]** N/A - no UI changes in this PR.

**[Developer]** Fixed the null check issue in commit abc123.

**[Product Manager]** All reviews verified. Merging PR.
```

### Standardized Review Comments

For PR reviews, use standardized format so PM can verify approvals:

```markdown
**[Architect]**

✅ APPROVED - Architect

Clean separation of concerns. LGTM.
```

```markdown
**[Product Owner]**

❌ CHANGES REQUESTED - Product Owner

Acceptance criteria issue:
- Missing validation for email field

Please address before merge.
```

## GitHub Commands Reference

```bash
# List open issues
gh issue list --state open

# View issue with dependencies
gh issue view {number}

# Update issue labels
gh issue edit {number} --add-label "in-progress" --remove-label "ready"

# Create PR
gh pr create --title "..." --body "Closes #{number}\n\n..."

# List PR reviews
gh pr view {number} --json reviews

# Add PR comment
gh pr comment {number} --body "**[Agent]** comment"

# Approve PR
gh pr review {number} --approve --body "**[Agent]** Approved"

# Request changes
gh pr review {number} --request-changes --body "**[Agent]** Please fix..."

# Merge PR
gh pr merge {number} --squash --delete-branch
```

## Notifications

Use the notification system for key events:

```bash
# All issues complete
.claude/hooks/request-attention.sh complete "All issues have been implemented and merged!"

# Stuck - need human help
.claude/hooks/request-attention.sh stuck "Unable to resolve: [description]"

# PR ready for human review (optional checkpoint)
.claude/hooks/request-attention.sh approval "PR #{number} ready for final review"
```