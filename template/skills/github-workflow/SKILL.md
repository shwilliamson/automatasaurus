---
name: github-workflow
description: Manages GitHub workflow including issues, PRs, milestones, labels, and the review process. Use when working with GitHub issues, creating PRs, managing reviews, or coordinating the development workflow.
---

# GitHub Workflow Skill

This skill provides guidance for managing the software development workflow through GitHub.

## Issue State Labels

These labels track issue progress through the workflow:

| Label | Description | When to Apply |
|-------|-------------|---------------|
| `ready` | No blocking dependencies, can be worked | Issue can be picked up |
| `in-progress` | Currently being implemented | Developer starts work |
| `blocked` | Waiting on dependencies or input | Has unresolved blockers |
| `needs-review` | PR open, awaiting reviews | PR created |
| `needs-testing` | Reviews complete, awaiting tester | All reviewers approved |

### Applying State Labels

```bash
# Mark issue as in progress
gh issue edit {number} --add-label "in-progress" --remove-label "ready"

# Mark as needing review (when PR is opened)
gh issue edit {number} --add-label "needs-review" --remove-label "in-progress"

# Mark as needing testing (when reviews pass)
gh issue edit {number} --add-label "needs-testing" --remove-label "needs-review"
```

## Dependency Tracking

### Documenting Dependencies

In issue body, use explicit dependency references:

```markdown
## Dependencies
Depends on #12 (User authentication)
Depends on #15 (Database schema)
```

If no dependencies:
```markdown
## Dependencies
None - can be worked independently
```

### Parsing Dependencies

```bash
# Find dependencies for an issue
gh issue view {number} --json body --jq '.body' | grep -oE "Depends on #[0-9]+" | grep -oE "[0-9]+"

# Check if all dependencies are closed
gh issue view {dep_number} --json state --jq '.state'
```

### Finding Ready Issues

```bash
# List open issues with "ready" label
gh issue list --state open --label "ready"

# List issues with priority (for ordering)
gh issue list --state open --label "ready" --label "priority:high"
```

## Agent Identification

**IMPORTANT:** All GitHub interactions must include an agent identifier header. Since all agents share the same GitHub user, this is essential for tracking who did what.

Format: `**[Agent Name]**` at the start of every issue body, PR description, and comment.

## Issue Creation

### Feature Issue (Full Format)

```bash
gh issue create \
  --title "Feature: {Short descriptive title}" \
  --label "feature" \
  --label "ready" \
  --label "priority:medium" \
  --body "$(cat <<'EOF'
**[Product Owner]**

## User Story
As a [type of user],
I want [goal/desire],
So that [benefit/value].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
[Notes from Architect if applicable]

## UI/UX Requirements
[Describe if UI work needed, or "None - backend only"]

## Dependencies
[List dependencies or "None"]
Depends on #X
Depends on #Y

## Out of Scope
[Explicitly list what is NOT included]
EOF
)"
```

### Bug Issue

```bash
gh issue create \
  --title "Bug: {Title}" \
  --label "bug" \
  --label "ready" \
  --body "$(cat <<'EOF'
**[Product Owner]**

## Description
[What is the bug]

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
[What should happen]

## Actual Behavior
[What happens instead]

## Environment
- OS:
- Version:

## Dependencies
None
EOF
)"
```

### Follow-up Issue (Discovered During Implementation)

```bash
gh issue create \
  --title "Follow-up: {Description}" \
  --label "enhancement" \
  --label "blocked" \
  --body "$(cat <<'EOF'
**[Product Owner]**

## Background
Discovered during implementation of #{original_issue}.

## User Story
As a [user],
I want [goal],
So that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
Depends on #{original_issue} (must be completed first)
EOF
)"
```

## Pull Request Creation

### Standard PR Format

```bash
gh pr create \
  --title "{type}: {description}" \
  --body "$(cat <<'EOF'
**[Developer]**

## Summary
[Brief description of changes]

Closes #{issue-number}

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows project conventions
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated if needed
EOF
)"
```

## PR Review Templates

All agents use the format: `**[Agent Name]** comment text`

### Architect (Required Reviewer)

```bash
# Approval
gh pr review {number} --approve --body "**[Architect]** LGTM. Clean architecture and good separation of concerns."

# Request changes
gh pr review {number} --request-changes --body "**[Architect]** Please address the following:

1. [Issue and recommendation]
2. [Issue and recommendation]

These changes are needed before merge."

# Comment only
gh pr comment {number} --body "**[Architect]** Consider extracting this into a separate service for better testability."
```

### UI/UX (Optional - Can Decline)

```bash
# N/A - Not UI relevant
gh pr comment {number} --body "**[UI/UX]** N/A - No UI changes in this PR.

Reviewed: Backend/infrastructure changes only, no user-facing impact."

# Approval
gh pr review {number} --approve --body "**[UI/UX]** UI implementation looks good. Matches specs and accessibility requirements met."

# Request changes
gh pr review {number} --request-changes --body "**[UI/UX]** UI issues found:

1. [Issue and fix]
2. [Issue and fix]

Please address before merge."
```

### Tester (Final Verification)

```bash
# Approval and merge
gh pr review {number} --approve --body "**[Tester]** Verified and approved. All tests passing."
gh pr merge {number} --squash --delete-branch
gh pr comment {number} --body "**[Tester]** Merged successfully."

# Issues found
gh pr review {number} --request-changes --body "**[Tester]** Found issues during verification:

1. [Issue description]
2. [Issue description]

Returning to Developer for fixes."
```

### Developer (Responding to Reviews)

```bash
# Acknowledge and fix
gh pr comment {number} --body "**[Developer]** Fixed in commit abc1234:

- [What was fixed]
- [What was fixed]

Ready for re-review."

# Request re-review
gh pr edit {number} --add-reviewer "{reviewer}"
```

### Product Owner

```bash
# Issue creation confirmation
gh issue comment {number} --body "**[Product Owner]** Created issues #1-5 for the authentication feature."

# Priority clarification
gh issue comment {number} --body "**[Product Owner]** Issue #{number} priority is high - this unblocks other work."

# Follow-up creation
gh issue comment {original_number} --body "**[Product Owner]** Created follow-up issue #{new_number} for scope discovered during implementation."

# Acceptance
gh issue comment {number} --body "**[Product Owner]** Acceptance criteria met. Closing issue."
```

### Product Manager

```bash
# Workflow coordination
gh issue comment {number} --body "**[PM]** Starting work on this issue. Routing to Developer."

# Status update
gh issue comment {number} --body "**[PM]** PR #{pr_number} created. Routing for reviews."

# Completion
gh issue comment {number} --body "**[PM]** Issue #{number} completed and merged. Moving to next issue."
```

## Label Management

### Priority Labels

| Label | Description |
|-------|-------------|
| `priority:high` | Work on first |
| `priority:medium` | Normal priority |
| `priority:low` | Work on last |

### Type Labels

| Label | Description |
|-------|-------------|
| `feature` | New functionality |
| `bug` | Bug fix |
| `enhancement` | Improvement to existing feature |
| `documentation` | Docs only |
| `security` | Security-related |

### Creating Labels

```bash
# Create state labels
gh label create "ready" --description "No blocking dependencies" --color "0E8A16"
gh label create "in-progress" --description "Currently being worked" --color "FBCA04"
gh label create "blocked" --description "Waiting on dependencies" --color "D93F0B"
gh label create "needs-review" --description "PR awaiting reviews" --color "1D76DB"
gh label create "needs-testing" --description "Awaiting final verification" --color "5319E7"

# Create priority labels
gh label create "priority:high" --description "High priority" --color "B60205"
gh label create "priority:medium" --description "Medium priority" --color "FBCA04"
gh label create "priority:low" --description "Low priority" --color "0E8A16"
```

## Workflow Status Commands

```bash
# Check open issues
gh issue list --state open

# Check issues by state
gh issue list --state open --label "ready"
gh issue list --state open --label "in-progress"
gh issue list --state open --label "blocked"

# Check PRs needing review
gh pr list --state open

# Check PR review status
gh pr view {number} --json reviews --jq '.reviews[] | "\(.author.login): \(.state)"'

# Check if PR is ready to merge
gh pr view {number} --json reviewDecision --jq '.reviewDecision'
```

## Milestone Management

```bash
# Create milestone
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="v0.1.0" \
  -f description="MVP release"

# List milestones
gh api repos/{owner}/{repo}/milestones

# Assign issue to milestone
gh issue edit {number} --milestone "v0.1.0"
```
