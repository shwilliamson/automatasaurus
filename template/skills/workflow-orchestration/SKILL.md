---
name: workflow-orchestration
description: Defines the autonomous development workflow. Use when orchestrating work between agents, managing issue lifecycles, or understanding the development loop.
---

# Workflow Orchestration

This skill defines how the Automatasaurus workflow operates.

## Architecture Overview

### Playbooks (Orchestration)

Playbooks run in the main conversation and orchestrate agents:

| Command | Purpose | Produces |
|---------|---------|----------|
| `discovery` | Requirements gathering | `discovery.md`, issues |
| `work-plan` | Implementation planning | `implementation-plan.md` |
| `work {n}` | Single issue | PR (user merges) |
| `work-all` | All issues | PRs merged, issues closed |

### Agents (Autonomous Workers)

Agents perform discrete tasks without user dialogue:

| Agent | Tasks |
|-------|-------|
| `developer` | Implements issues, creates PRs |
| `architect` | Reviews discovery plans, reviews PRs, helps stuck developers |
| `designer` | Reviews discovery plans, reviews PRs, adds design specs |
| `tester` | Runs tests, manual verification with Playwright |

---

## Workflow Modes

The system operates in different modes:

| Mode | Trigger | Merge Behavior |
|------|---------|----------------|
| `discovery` | `discovery` playbook | N/A - creates issues |
| `planning` | `work-plan` playbook | N/A - creates plan |
| `single-issue` | `work {n}` playbook | **Notify only** - user merges |
| `all-issues` | `work-all` playbook | **Auto-merge** and continue |

### Mode Context Passing

When delegating to agents, include mode context:

```
# Single-issue mode
"This is SINGLE-ISSUE mode. Do NOT auto-merge. Notify when PR is approved."

# All-issues mode
"This is ALL-ISSUES mode. Auto-merge after approvals and continue to next issue."
```

**Default:** If mode unclear, default to single-issue (safer).

---

## Two-Phase Workflow

### Phase 1: Discovery (Interactive)

```
User: discovery playbook "feature description"
           ↓
    Main conversation facilitates requirements gathering
    (loads requirements-gathering, user-stories skills)
           ↓
    Produces discovery.md
           ↓
    Spawns Architect → reviews technical feasibility
    Spawns Designer → reviews UI/UX considerations
           ↓
    User approves → Creates milestones and issues
```

### Phase 2: Implementation (Autonomous)

```
User: work-plan playbook (optional)
           ↓
    Analyzes issues, creates implementation-plan.md
           ↓
User: work-all playbook
           ↓
    LOOP for each issue:
      - Check dependencies
      - Spawn Developer → implements, creates PR
      - Spawn Architect → reviews PR
      - Spawn Designer → reviews PR (if UI)
      - Spawn Tester → verifies PR
      - Check PR Done Criteria
      - Merge (if all-issues mode)
      - Continue to next
           ↓
    All complete → Notify user
```

---

## PR Done Criteria

Both the work and work-all playbooks use these criteria to determine when a PR is ready:

### Required Approvals

| Review | When Required |
|--------|---------------|
| `✅ APPROVED - Architect` | Always |
| `✅ APPROVED - Designer` | If PR has UI changes |
| `✅ APPROVED - Tester` | Always |

### Criteria Checklist

- [ ] All required approval comments present
- [ ] No outstanding `❌ CHANGES REQUESTED`
- [ ] CI/automated tests passing

### Then What?

| Mode | Action |
|------|--------|
| `single-issue` | Post verification comment, **notify user**, stop |
| `all-issues` | Post verification, **merge**, continue to next issue |

---

## Issue State Labels

Track issue progress:

| Label | Description |
|-------|-------------|
| `ready` | No blocking dependencies |
| `in-progress` | Currently being implemented |
| `blocked` | Waiting on dependencies |
| `needs-review` | PR open, awaiting reviews |

### State Flow

```
[new] → ready (if no deps) OR blocked (if deps)
  ↓
ready → in-progress (when selected)
  ↓
in-progress → needs-review (when PR opened)
  ↓
needs-review → [closed] (when merged)
```

---

## Dependency Parsing

Issues declare dependencies in their body:

```markdown
## Dependencies
Depends on #12
Depends on #15
```

An issue is "ready" when all dependencies are closed.

---

## Review Flow

### Standardized Review Comments

Since all agents share the same GitHub identity, reviews use standardized comments:

**Approval:**
```
✅ APPROVED - [Role]
[Summary]
```

**Changes Requested:**
```
❌ CHANGES REQUESTED - [Role]
[Issues to address]
```

### Review Process

```
1. Developer creates PR

2. Architect reviews (REQUIRED)
   Posts: ✅ APPROVED - Architect
   Or: ❌ CHANGES REQUESTED - Architect

3. Designer reviews (if UI)
   Posts: ✅ APPROVED - Designer
   Or: N/A - no UI changes

4. Tester verifies (REQUIRED)
   Posts: ✅ APPROVED - Tester
   Or: ❌ CHANGES REQUESTED - Tester

5. If changes requested:
   Developer fixes
   Re-request relevant review

6. When all approved:
   Orchestration checks mode
   → single-issue: notify user
   → all-issues: merge and continue
```

---

## Escalation Procedures

### Developer → Architect

After 5 failed attempts:
```
Use the architect agent to analyze issue #{number}.
Developer has tried: [list]
Error: [description]
```

### Architect → Human

If Architect also stuck:
```bash
\.codex/hooks/request-attention.sh stuck "Unable to resolve issue #{number}"
```

Mark issue as blocked, continue to next issue.

---

## Artifact Files

The workflow produces these artifacts:

| File | Command | Purpose |
|------|---------|---------|
| `discovery.md` | `/discovery` | Requirements, flows, architecture |
| `implementation-plan.md` | `work-plan` | Sequenced work order |

---

## GitHub Commands Reference

```bash
# List open issues
gh issue list --state open --json number,title,labels

# Check issue dependencies
gh issue view {n} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+'

# View PR comments for approvals
gh pr view {n} --comments

# Post orchestration comment
gh pr comment {n} --body "**[Product Owner]** ..."

# Merge PR
gh pr merge {n} --squash --delete-branch

# Check issue state
gh issue view {n} --json state --jq '.state'
```
