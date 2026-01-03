---
name: workflow-orchestration
description: Defines the autonomous development workflow loop. Use when coordinating work between agents, managing issue lifecycles, or running the main development loop.
---

# Workflow Orchestration

This skill defines the Automatasaurus autonomous development workflow.

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
│  5. PR REVIEW CYCLE                                         │
│     → Reviews by Architect, UI/UX                          │
│     → Developer addresses feedback                          │
│     (see Review Flow below)                                 │
│                                                             │
│  6. TESTING & MERGE                                         │
│     → Tester verifies and merges                           │
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
needs-review → needs-testing (when reviews complete)
     ↓
needs-testing → [closed] (when merged)
```

| Label | Meaning |
|-------|---------|
| `ready` | No blocking dependencies, can be worked |
| `in-progress` | Currently being implemented |
| `blocked` | Waiting on dependencies or human input |
| `needs-review` | PR open, awaiting code reviews |
| `needs-testing` | Reviews approved, awaiting tester |
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

## Review Flow

```
1. Architect Review (REQUIRED)
   - Review code quality, patterns, architecture
   - Comment: "**[Architect]** ..."
   - Approve or request changes

2. UI/UX Review (if UI-relevant)
   - Review visual implementation
   - Comment: "**[UI/UX]** ..." or "**[UI/UX]** N/A - no UI changes"
   - Approve, request changes, or decline

3. Developer addresses feedback
   - Comment: "**[Developer]** Fixed in {commit}..."
   - Push changes
   - Re-request review if needed

4. Loop until all required approvals received
```

## Tester Flow

```
1. Run automated tests
   - Execute full test suite
   - Verify all tests pass

2. Decide on manual verification
   Consider:
   - Does issue involve UI? → Playwright testing
   - Is it a critical path? → Manual verification
   - Is it low-risk refactor? → Automated only may suffice

3. Manual verification (if needed)
   - Use Playwright MCP for browser testing
   - Verify acceptance criteria met
   - Document verification in PR comment

4. If issues found
   - Comment: "**[Tester]** Found issues: ..."
   - Request changes
   - Back to Developer

5. If all good
   - Comment: "**[Tester]** Verified and approved"
   - Approve PR
   - Merge PR
   - Verify issue auto-closed
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

**[Architect]** LGTM. Clean separation of concerns.

**[UI/UX]** N/A - no UI changes in this PR.

**[Developer]** Fixed the null check issue in commit abc123.

**[Tester]** Verified login flow works correctly. Approved.
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