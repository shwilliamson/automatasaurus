---
name: github-issues
description: Best practices for breaking down work into GitHub issues, proper sizing, level of detail, and milestone organization. Use during discovery/planning phases or when creating follow-up issues.
---

# GitHub Issue Creation Skill

This skill provides guidance for breaking down work into well-structured GitHub issues that enable efficient autonomous development.

## Core Principles

### 1. One PR Per Issue
Each issue should be completable in a **single pull request**. This enables:
- Clear ownership and accountability
- Easier code review
- Atomic commits that can be reverted
- Parallel work by different agents

### 2. Vertical Slices Over Horizontal Layers
Prefer issues that deliver end-to-end functionality over issues that implement a single layer.

**Good (Vertical Slice):**
- "User can register with email and password"
- Includes: API endpoint + validation + database + basic UI

**Avoid (Horizontal Layer):**
- "Create user database schema"
- "Create user API endpoints"
- "Create user registration UI"

Exception: Foundation work that genuinely must come first (database migrations, core utilities).

### 3. Testable Acceptance Criteria
Every issue must have criteria that can be objectively verified:
- Specific, measurable outcomes
- Edge cases explicitly stated
- Error handling defined

## Issue Sizing Guidelines

### Right-Sized Issue
- Completable in 1-4 hours of focused work
- Single, clear objective
- 3-7 acceptance criteria
- Can be understood without extensive context

### Too Large (Split It)
Signs an issue is too large:
- More than 7 acceptance criteria
- Touches more than 3-4 files significantly
- Has multiple distinct user-facing outcomes
- Requires "and" to describe ("implement auth AND user profiles")

**How to split:**
- By user action (register vs login vs logout)
- By data entity (users vs sessions vs permissions)
- By happy path vs error handling
- By required vs optional features

### Too Small (Combine It)
Signs an issue is too small:
- Trivial change (rename, typo fix)
- No meaningful acceptance criteria
- Less than 15 minutes of work
- Only makes sense with other changes

## What to Include in Each Issue

### Always Include

```markdown
## User Story
As a [specific user type],
I want [concrete action],
So that [measurable benefit].

## Acceptance Criteria
- [ ] Specific, testable criterion
- [ ] Include happy path behavior
- [ ] Include key error cases
- [ ] Include edge cases that matter

## Dependencies
Depends on #X (reason)
-- OR --
None - can be worked independently

## Out of Scope
- Explicitly list what this issue does NOT cover
- Prevents scope creep during implementation
```

### Include When Relevant

```markdown
## Technical Notes
- Architecture decisions from Architect
- Specific patterns to follow
- Performance requirements
- Security considerations

## UI/UX Requirements
- Link to designs or describe expected behavior
- Responsive requirements
- Accessibility requirements
```

### Do NOT Include
- Implementation details (let Developer decide)
- Specific file names or code structure
- Step-by-step coding instructions
- Time estimates

## Dependency Management

### Explicit Dependencies
Always document what must be completed first:

```markdown
## Dependencies
Depends on #12 (database schema must exist)
Depends on #15 (auth middleware required)
```

### Implicit Dependencies
Consider logical order even without explicit deps:
- Database before API
- API before UI
- Auth before protected features
- Core before edge cases

### Breaking Circular Dependencies
If A needs B and B needs A:
1. Identify the minimum viable piece of each
2. Create a foundation issue with just the core
3. Build both features on that foundation

## Milestone Organization

### What is a Milestone?
A group of issues that together deliver a coherent, usable capability.

### Milestone Guidelines

1. **Logical groupings**: Issues that together = working feature
2. **Ordered by value**: Earlier milestones = higher value/lower risk
3. **3-10 issues per milestone**: Small enough to feel achievable
4. **Clear definition of done**: What can users do when complete?
5. **Independent when possible**: Milestone N shouldn't require N+1

### Example Milestone Structure

**Project: E-commerce Checkout**

**Milestone 1: v1.0 - Basic Cart** (Foundation)
- #1: Product display with "Add to Cart" button
- #2: Cart page showing items and quantities
- #3: Update/remove items from cart
- #4: Cart persists across page refreshes

**Milestone 2: v1.1 - Checkout Flow**
- #5: Shipping address form
- #6: Payment method selection (mock)
- #7: Order confirmation page
- #8: Order confirmation email

**Milestone 3: v1.2 - Payment Integration**
- #9: Stripe integration
- #10: Payment error handling
- #11: Refund support

### Creating Milestones

```bash
# Create with description
gh api repos/{owner}/{repo}/milestones \
  -f title="v1.0 - Basic Cart" \
  -f description="Users can add items to cart and modify quantities"

# Assign issue to milestone
gh issue edit {number} --milestone "v1.0 - Basic Cart"

# View milestone progress
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues) complete"'
```

## Issue Templates by Type

**IMPORTANT:** All issue bodies must start with an agent identifier (`**[Agent Name]**`).

### Feature Issue

```bash
gh issue create \
  --title "Feature: {User-facing capability}" \
  --label "feature" \
  --label "ready" \
  --label "priority:medium" \
  --milestone "v1.0 - Milestone Name" \
  --body "$(cat <<'EOF'
**[Product Owner]**

## User Story
As a [user type],
I want [action],
So that [benefit].

## Acceptance Criteria
- [ ] Primary happy path works
- [ ] Key error case handled
- [ ] Edge case covered

## Dependencies
None

## Out of Scope
- Future enhancement X
- Related feature Y
EOF
)"
```

### Bug Fix Issue

```bash
gh issue create \
  --title "Bug: {What's broken}" \
  --label "bug" \
  --label "ready" \
  --label "priority:high" \
  --body "$(cat <<'EOF'
**[Product Owner]**

## Description
[Clear description of the bug]

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
[What should happen]

## Actual Behavior
[What happens instead]

## Acceptance Criteria
- [ ] Bug no longer occurs
- [ ] Regression test added
- [ ] Related edge cases verified

## Dependencies
None
EOF
)"
```

### Technical Debt / Refactor Issue

```bash
gh issue create \
  --title "Refactor: {What and why}" \
  --label "enhancement" \
  --label "ready" \
  --label "priority:low" \
  --body "$(cat <<'EOF'
**[Architect]**

## Problem
[Current state and why it's problematic]

## Proposed Solution
[High-level approach, not implementation details]

## Acceptance Criteria
- [ ] Behavior unchanged (existing tests pass)
- [ ] New structure in place
- [ ] No performance regression

## Dependencies
None

## Out of Scope
- Feature changes
- Additional refactoring
EOF
)"
```

## Common Anti-Patterns

### Vague Acceptance Criteria
**Bad:** "User experience is good"
**Good:** "Form shows inline validation errors within 100ms of blur"

### Missing Error Cases
**Bad:** "User can submit form"
**Good:** "User can submit form; invalid inputs show specific error messages"

### Hidden Dependencies
**Bad:** Creating UI issue without noting API must exist
**Good:** "Depends on #12 (API endpoint must be available)"

### Scope Creep in Issue
**Bad:** Adding "nice to have" items during implementation
**Good:** Create follow-up issue for discovered scope

### Too Much Detail
**Bad:** "Create file user.js with function validateEmail using regex /^.../"
**Good:** "Email addresses are validated before submission"

## Breaking Down a Feature Request

When given a large feature request:

1. **Identify the core user journey** - What's the minimum path?
2. **Extract foundation work** - Database, APIs, shared utilities
3. **Split by user action** - Each action = potential issue
4. **Identify optional enhancements** - Move to later milestone
5. **Map dependencies** - What must come first?
6. **Group into milestones** - What's usable together?

### Example: "Add user authentication"

**Discovery reveals:**
- Email/password registration
- Login/logout
- Password reset
- Session management
- Remember me
- OAuth (optional, later)

**Breakdown:**

Milestone 1: Core Auth
- #1: User registration (email, password, validation)
- #2: User login (email, password, session creation)
- #3: User logout (session destruction)
- #4: Session middleware (protect routes)

Milestone 2: Password Management
- #5: Password reset request (email link)
- #6: Password reset completion (new password)
- #7: Change password (when logged in)

Milestone 3: Enhanced Auth (future)
- #8: Remember me functionality
- #9: OAuth - Google
- #10: OAuth - GitHub
