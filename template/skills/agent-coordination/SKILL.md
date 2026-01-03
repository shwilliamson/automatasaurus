---
name: agent-coordination
description: Patterns for invoking and coordinating Automatasaurus agents. Use when delegating tasks to specialist agents.
---

# Agent Coordination Skill

This skill provides patterns for invoking the Automatasaurus agents.

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `developer` | Implements issues, creates PRs | When code needs to be written |
| `architect` | Technical reviews, analysis | For PR reviews, discovery reviews, stuck issues |
| `designer` | UI/UX reviews, design specs | For PR reviews, discovery reviews, design specs |
| `tester` | Testing, verification | For PR verification, running tests |

---

## Invocation Patterns

### Developer - Implement an Issue

```
Use the developer agent to implement issue #{number}.

Context:
- Issue: [title]
- Acceptance criteria: [from issue body]
- Design specs: [if applicable, from designer comments]

This is [MODE] mode. Create PR when implementation is complete.
```

### Architect - Review Discovery Plan

```
Use the architect agent to review this discovery plan for technical feasibility.

Focus on:
- Architecture fit
- Scalability
- Security implications
- Technology choices

The discovery plan is at: [path to discovery.md]
```

### Architect - Review PR

```
Use the architect agent to review PR #{pr_number} for technical quality.

Post a standardized approval comment when done:
- ✅ APPROVED - Architect
- OR ❌ CHANGES REQUESTED - Architect
```

### Architect - Analyze Stuck Issue

```
Use the architect agent to analyze issue #{number}.

Developer has tried:
1. [attempt 1]
2. [attempt 2]
...

Error: [description]
```

### Designer - Review Discovery Plan

```
Use the designer agent to review this discovery plan for UI/UX considerations.

Focus on:
- User flows
- Accessibility
- Responsive design
- Missing UI requirements

The discovery plan is at: [path to discovery.md]
```

### Designer - Add Specs to Issue

```
Use the designer agent to add UI/UX specifications to issue #{number}.

Review the issue requirements and add design specs as a comment.
```

### Designer - Review PR

```
Use the designer agent to review PR #{pr_number} for UI/UX quality.

If no UI changes, post: "**[Designer]** N/A - No UI changes in this PR."

Otherwise post standardized approval:
- ✅ APPROVED - Designer
- OR ❌ CHANGES REQUESTED - Designer
```

### Tester - Verify PR

```
Use the tester agent to verify PR #{pr_number}.

Run tests and perform manual verification if needed.
Post a standardized approval comment when done:
- ✅ APPROVED - Tester
- OR ❌ CHANGES REQUESTED - Tester
```

---

## Parallel Invocation

When reviews are independent, invoke agents in parallel:

```
# Invoke these in parallel (single message, multiple tool calls)
Use the architect agent to review PR #123
Use the designer agent to review PR #123
Use the tester agent to verify PR #123
```

---

## Handoff Information

When delegating, include:

1. **Issue/PR number** - What to work on
2. **Context** - Acceptance criteria, design specs
3. **Mode** - single-issue or all-issues (affects merge behavior)
4. **Expected output** - What to produce (PR, comment, etc.)

---

## Quality Gates

Each agent has quality gates:

| Agent | Gate |
|-------|------|
| Developer | Tests passing, PR created |
| Architect | Technical review complete |
| Designer | Design review complete |
| Tester | All tests pass, verification complete |

---

## Escalation Flow

```
Developer stuck (5 attempts)
    ↓
Architect analyzes
    ↓
If still stuck → Human escalation
    .claude/hooks/request-attention.sh stuck "..."
```
