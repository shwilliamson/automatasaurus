---
name: agent-coordination
description: Coordinates work between multiple persona agents in the Automatasaurus workflow. Use when orchestrating multi-agent tasks or handoffs between personas.
---

# Agent Coordination Skill

This skill provides guidance for coordinating work across the Automatasaurus persona agents.

## Workflow Patterns

### New Feature Development

```
1. Product Owner → Define requirements, create issue
2. Architect → Design solution, create ADR if needed
3. UI/UX → Design user experience (if applicable)
4. SecOps → Threat model and security requirements
5. Developer → Implement solution
6. Tester → Write and run tests
7. SecOps → Security review
8. Product Owner → Accept/reject based on criteria
```

### Bug Fix

```
1. Tester/Product Owner → Document bug in issue
2. Developer → Investigate and diagnose
3. Architect → Consult on complex issues
4. Developer → Implement fix
5. Tester → Verify fix and regression test
6. SecOps → Review if security-related
```

### Security Incident

```
1. SecOps → Assess and document vulnerability
2. Architect → Design remediation approach
3. Developer → Implement fix
4. SecOps → Verify remediation
5. Product Manager → Coordinate disclosure if needed
```

## Agent Invocation Examples

### Sequential Handoff
```
Use the product-owner agent to create a user story for [feature]
Use the architect agent to design the technical approach
Use the developer agent to implement the solution
Use the tester agent to create test coverage
```

### Parallel Consultation
```
Use the secops and architect agents to review this design
Use the tester and developer agents to work on test coverage
```

### Focused Review
```
Use the secops agent to do a security review of PR #123
Use the ui-ux agent to review the accessibility of this component
```

## Handoff Documentation

When handing off between agents, include:
1. What was completed
2. Relevant issue/PR numbers
3. Any decisions made
4. Open questions or blockers

## Quality Gates

Each persona has quality gates that must pass:

| Agent | Gate |
|-------|------|
| Product Owner | Clear acceptance criteria defined |
| Architect | ADR created for significant decisions |
| Developer | Tests passing, PR created |
| Tester | Test plan executed, coverage met |
| SecOps | Security checklist passed |
| UI/UX | Accessibility audit passed |

## Escalation

If an agent is blocked:
1. Document the blocker in the issue
2. Tag the appropriate persona for help
3. Use the stop hook to prevent premature completion
