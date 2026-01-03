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

### Applying State Labels

```bash
# Mark issue as in progress
gh issue edit {number} --add-label "in-progress" --remove-label "ready"

# Mark as needing review (when PR is opened)
gh issue edit {number} --add-label "needs-review" --remove-label "in-progress"

# Issue is closed automatically when PR is merged
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

## Comment-Based Review Tracking

**IMPORTANT:** Since all agents share the same GitHub user identity, we cannot use GitHub's native multi-reviewer approval system. Instead, reviews are tracked via **standardized comments**.

### How It Works

1. Each required reviewer posts a standardized comment indicating their review status
2. Orchestration monitors PR comments to verify all required reviews are complete
3. When all required approvals are present, orchestration handles merge (based on mode)

### Standardized Review Comment Format

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

### Required Reviews Per PR

| Review | When Required |
|--------|---------------|
| Architect | Always |
| Designer | If PR has UI changes |
| Tester | Always |

---

## PR Review Templates

All agents use the format: `**[Agent Name]** comment text` with the standardized approval/rejection prefix.

### Architect (Required)

```bash
# Approval
gh pr comment {number} --body "**[Architect]**

✅ APPROVED - Architect

Clean architecture and good separation of concerns. LGTM."

# Request changes
gh pr comment {number} --body "**[Architect]**

❌ CHANGES REQUESTED - Architect

Please address the following:
1. [Issue and recommendation]
2. [Issue and recommendation]"
```

### Designer (If UI Changes)

```bash
# N/A - Not UI relevant
gh pr comment {number} --body "**[Designer]** N/A - No UI changes in this PR."

# Approval
gh pr comment {number} --body "**[Designer]**

✅ APPROVED - Designer

UI implementation looks good. Accessibility requirements met."

# Request changes
gh pr comment {number} --body "**[Designer]**

❌ CHANGES REQUESTED - Designer

UI issues found:
1. [Issue and fix]
2. [Issue and fix]"
```

### Tester (Required)

```bash
# Approval
gh pr comment {number} --body "**[Tester]**

✅ APPROVED - Tester

**Automated Tests:** All passing
**Manual Verification:** [Completed/N/A]

Ready for merge."

# Request changes
gh pr comment {number} --body "**[Tester]**

❌ CHANGES REQUESTED - Tester

**Issues Found:**
1. [Issue description]

**Test Failures:**
- [Test name]: [Error]"
```

### Orchestration (Final Verification)

```bash
# Verify all required reviews, then merge (in all-issues mode)
gh pr comment {number} --body "**[Orchestration]**

All required reviews complete:
- ✅ Architect
- ✅ Tester

Proceeding with merge."

gh pr review {number} --approve --body "**[Orchestration]** All reviews verified."
gh pr merge {number} --squash --delete-branch
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

## PR Approval Verification

Orchestration verifies all required reviews before merge decision.

### Checking Review Status

```bash
# Get all PR comments to check for approval comments
gh pr view {number} --comments

# Look for standardized approval comments:
# ✅ APPROVED - Architect
# ✅ APPROVED - Tester
# ✅ APPROVED - Designer (if UI changes)
```

### Approval Checklist

Before merge decision:

1. **Required approvals present**
   - `✅ APPROVED - Architect` (always)
   - `✅ APPROVED - Tester` (always)
   - `✅ APPROVED - Designer` (if UI changes)

2. **No outstanding change requests**
   - No `❌ CHANGES REQUESTED` without subsequent `✅ APPROVED`

3. **CI/tests passing**

### Merge Process (All-Issues Mode)

```bash
# 1. Verify all approvals
gh pr view {number} --comments

# 2. Post verification comment
gh pr comment {number} --body "**[Orchestration]**

All required reviews complete:
- ✅ Architect
- ✅ Tester

Proceeding with merge."

# 3. Approve and merge
gh pr review {number} --approve --body "**[Orchestration]** All reviews verified."
gh pr merge {number} --squash --delete-branch
```

### Notify Only (Single-Issue Mode)

```bash
# Post verification but DO NOT merge
gh pr comment {number} --body "**[Orchestration]**

All required reviews complete:
- ✅ Architect
- ✅ Tester

PR is ready for merge. Awaiting user action."
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
