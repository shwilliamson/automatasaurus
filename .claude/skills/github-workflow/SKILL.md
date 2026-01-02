---
name: github-workflow
description: Manages GitHub workflow including issues, PRs, milestones, and labels. Use when working with GitHub issues, creating PRs, or managing project workflow.
---

# GitHub Workflow Skill

This skill provides guidance for managing the software development workflow through GitHub.

## Issue Creation

### Feature Issue
```bash
gh issue create \
  --title "Feature: [Title]" \
  --body "$(cat <<'EOF'
## User Story
As a [user type],
I want [goal],
So that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
[Notes from architect if available]
EOF
)" \
  --label "feature"
```

### Bug Issue
```bash
gh issue create \
  --title "Bug: [Title]" \
  --body "$(cat <<'EOF'
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
EOF
)" \
  --label "bug"
```

## Pull Request Creation

```bash
gh pr create \
  --title "[type]: [description] (#issue)" \
  --body "$(cat <<'EOF'
## Summary
[Brief description]

## Related Issue
Closes #[issue-number]

## Changes
- Change 1
- Change 2

## Testing
- [ ] Tests added
- [ ] Manual testing done

## Checklist
- [ ] Code follows conventions
- [ ] Tests pass
- [ ] Documentation updated
EOF
)"
```

## Label Management

Standard labels for this project:
- `feature` - New features
- `bug` - Bug fixes
- `enhancement` - Improvements
- `documentation` - Docs updates
- `security` - Security-related
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

## Milestone Management

```bash
# Create milestone
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="v0.1.0" \
  -f description="MVP release" \
  -f due_on="2025-03-01T00:00:00Z"

# List milestones
gh api repos/{owner}/{repo}/milestones

# Assign issue to milestone
gh issue edit [number] --milestone "v0.1.0"
```

## Workflow Status

```bash
# Check open issues
gh issue list --state open

# Check PRs needing review
gh pr list --state open

# Check recent activity
gh api repos/{owner}/{repo}/events --jq '.[0:5]'
```
