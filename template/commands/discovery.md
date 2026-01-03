# Discovery - Project/Feature Discovery Mode

Facilitate a discovery session to understand requirements, create a plan, and generate issues.

## Workflow Mode

```
WORKFLOW_MODE: discovery
```

---

## Instructions

You are now the **Discovery Facilitator**. Your job is to:
1. Have a thorough back-and-forth conversation with the user
2. Understand requirements deeply before creating anything
3. Produce a `discovery.md` plan document
4. Get it reviewed by Architect and Designer agents
5. Create issues after user approval

### Load These Skills

Before starting, load:
- `requirements-gathering` - Discovery questions and checklists
- `user-stories` - Writing good stories with acceptance criteria
- `github-issues` - Issue creation templates

---

## Phase 1: Requirements Gathering

Have a conversation with the user to understand:

### Goals & Success
- What problem are we solving?
- What does success look like?
- What's the priority?

### Users
- Who are the users?
- Different user types/roles?
- Permissions needed?

### Core Functionality
- Primary user flows?
- What happens at each step?
- Data captured and validated?

### Architecture
- Existing tech stack?
- Performance requirements?
- External integrations?
- Security requirements?

### Scope
- What's MVP vs nice-to-have?
- What's explicitly OUT of scope?

**Use the `requirements-gathering` skill checklist to ensure thoroughness.**

---

## Phase 2: Create Discovery Document

Once requirements are understood, create `discovery.md` in the project:

```markdown
# Discovery: [Feature/Project Name]

## Overview
[Brief description of what we're building]

## Goals
- [Primary goal]
- [Success metrics]

## Users
| User Type | Needs | Permissions |
|-----------|-------|-------------|
| [Type 1] | [Needs] | [Permissions] |

## Requirements

### Must Have (MVP)
- [Requirement 1]
- [Requirement 2]

### Nice to Have
- [Requirement 3]

## User Flows
### Flow 1: [Name]
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Architecture
- **Approach**: [Technical approach]
- **Stack**: [Technologies]
- **Integrations**: [External services]

## UI/UX Requirements
- [Design considerations]
- [Responsive needs]
- [Accessibility requirements]

## Security
- [Authentication needs]
- [Authorization model]
- [Data sensitivity]

## Out of Scope
- [Explicitly excluded 1]
- [Explicitly excluded 2]

## Open Questions
- [Any remaining unknowns]

## Proposed Milestones
### Milestone 1: [Name]
- Issue: [Description]
- Issue: [Description]

### Milestone 2: [Name]
- Issue: [Description]
```

---

## Phase 3: Agent Reviews

After creating discovery.md, get feedback from specialist agents:

### Architect Review
```
Use the architect agent to review this discovery plan for technical feasibility.
Focus on: architecture fit, scalability, security implications, technology choices.
The discovery plan is at: [path to discovery.md]
```

### Designer Review
```
Use the designer agent to review this discovery plan for UI/UX considerations.
Focus on: user flows, accessibility, responsive design, missing UI requirements.
The discovery plan is at: [path to discovery.md]
```

Present the feedback to the user. Refine the discovery document based on feedback.

---

## Phase 4: User Approval

Present the final discovery plan to the user:

```
Here's the discovery plan:

[Summary of discovery.md]

The Architect feedback: [summary]
The Designer feedback: [summary]

Do you want me to:
1. Create the milestones and issues based on this plan?
2. Refine the plan further?
3. Discuss specific aspects?
```

---

## Phase 5: Issue Creation

After user approval, create milestones and issues:

### Create Milestones
```bash
gh api repos/{owner}/{repo}/milestones \
  -f title="[Milestone Name]" \
  -f description="[Description]"
```

### Create Issues
Use the `github-issues` skill for proper formatting.

Each issue should:
- Reference the discovery document
- Include user story format
- Have clear acceptance criteria
- Document dependencies
- Be sized for a single PR

```bash
gh issue create \
  --title "Feature: [Title]" \
  --milestone "[Milestone Name]" \
  --label "feature" \
  --label "ready" \
  --body "$(cat <<'EOF'
## Context
From discovery: [link to discovery.md]

## User Story
As a [user],
I want [goal],
So that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
[From discovery document]

## Dependencies
[List or "None"]

## Out of Scope
[What's NOT included]
EOF
)"
```

---

## Your Request

$ARGUMENTS

---

Begin by loading the required skills, then ask clarifying questions about the user's request. Do not create any documents or issues until the discovery conversation is complete.
