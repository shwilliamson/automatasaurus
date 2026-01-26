---
name: work-issue
description: Core implementation logic for working on a single GitHub issue. Used by both /work command and /work-all subagents to ensure consistent behavior.
---

# Work Issue Skill

This skill contains the implementation logic for working on a single GitHub issue. It is loaded by:
- `/work {n}` command (direct invocation)
- `/work-all` subagents (spawned for context isolation)

## Input

This skill expects an `ISSUE_NUMBER` to be provided by the caller.

## Workflow

```
1. PRE-FLIGHT CHECK → Verify commands.md exists and is complete
2. SETUP ORCHESTRATION FOLDER
3. GET ISSUE DETAILS
4. CHECK DEPENDENCIES → If blocked, report and stop
5. GET DESIGN SPECS (if UI) → Invoke designer agent with briefing
6. IMPLEMENT → Invoke developer agent with briefing
7. COORDINATE REVIEWS → Architect (required), Designer (if UI), Tester (required)
8. HANDLE CHANGE REQUESTS → Loop until all approved
9. COMMIT ORCHESTRATION FILES → Preserve audit trail in branch
10. REPORT RESULT → Success, Blocked, or Escalated
```

---

## Step 1: Pre-flight Check

Before starting work, verify the project is set up for E2E testing.

### Check commands.md Exists and Is Complete

```bash
# Check if commands.md exists
if [ ! -f .claude/commands.md ]; then
  echo "ERROR: .claude/commands.md does not exist"
fi

# Read and check for required commands
cat .claude/commands.md
```

**Required commands that must be documented:**
- Development server command (how to run the app)
- Development server URL (where the app runs)
- Test command (how to run tests)

### If commands.md Is Missing or Incomplete

**STOP** and report to the user:

```
PRE-FLIGHT FAILED: commands.md is incomplete

Before I can work on issues, .claude/commands.md must document:
- How to start the development server
- The URL where the app runs
- How to run tests

Please update .claude/commands.md with these commands, or I won't be able to verify the implementation works.
```

**Do NOT proceed** until commands.md is complete. The Tester agent will need this to run E2E verification, and skipping E2E verification is unacceptable.

### If commands.md Is Complete

Continue to Step 2.

---

## Step 2: Setup Orchestration Folder

Create a folder for this issue's briefings and reports:

```bash
# Get issue title for slug
ISSUE_TITLE=$(gh issue view {ISSUE_NUMBER} --json title --jq '.title')
SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | head -c 30)

# Create orchestration folder
mkdir -p orchestration/issues/{ISSUE_NUMBER}-${SLUG}
```

All briefings and reports for this issue will go in this folder.

---

## Step 3: Get Issue Details

```bash
gh issue view {ISSUE_NUMBER}
```

Extract:
- Title
- Acceptance criteria
- Dependencies
- Labels (UI-related?)

---

## Step 4: Check Dependencies

Parse "Depends on #X" from issue body:

```bash
gh issue view {ISSUE_NUMBER} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+' | grep -oE '[0-9]+'
```

For each dependency, check if closed:

```bash
gh issue view {dep_number} --json state --jq '.state'
```

**If any dependency is OPEN:**
```
Report: "BLOCKED: Issue #{ISSUE_NUMBER} is blocked on #{dep_number}"
Stop here.
```

---

## Step 5: Get Design Specs (If UI Work)

Check if issue involves UI (labels contain "ui", "frontend", or issue mentions UI work).

If UI work needed and no design specs in comments:

### 5a. Write Designer Briefing

Write `orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-design-specs.md`:

```markdown
# Agent Briefing: design-specs
Generated: {timestamp}

## Your Task
Add UI/UX specifications to issue #{ISSUE_NUMBER}.

## Context
- Issue: #{ISSUE_NUMBER} - {title}
- This issue involves UI work and needs design specifications before implementation

## Resources (Read as Needed)
- Issue details: `gh issue view {ISSUE_NUMBER}`
- design-system.md: Available design tokens and patterns
- Existing components in codebase for consistency

## Expected Output
Post design specifications as an issue comment following your AGENT.md template, including:
- Design intent
- User flow
- Visual design with token references
- Component states
- Accessibility requirements
- Responsive behavior
```

### 5b. Spawn Designer Agent

```
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Designer specs for issue #{ISSUE_NUMBER}"
  prompt: |
    You are the Designer agent. Load your role from .claude/agents/designer/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-design-specs.md first.

    After completing your work, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-design-specs.md
```

### 5c. Read Designer Report

After designer returns, read `REPORT-design-specs.md` to understand what was produced.

---

## Step 6: Implement

Update issue label:
```bash
gh issue edit {ISSUE_NUMBER} --add-label "in-progress" --remove-label "ready"
```

### 6a. Write Developer Briefing

Write `orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-implement.md`:

```markdown
# Agent Briefing: implement
Generated: {timestamp}

## Your Task
Implement issue #{ISSUE_NUMBER}: {title}

## Context
- Acceptance criteria: {from issue body}
- Mode: {single-issue/all-issues}

## Prior Agent Activity
{If designer created specs, summarize from REPORT-design-specs.md:}
- **Designer**: Created UI specifications including {summary of specs}

## Resources (Read as Needed)
- Issue details: `gh issue view {ISSUE_NUMBER}`
- Design specs: Check issue comments for "**[Designer]** Design Specifications"
- design-system.md: Available design tokens
- Existing patterns in codebase

## Expected Output
- Working implementation matching acceptance criteria
- Tests passing
- PR created with "Closes #{ISSUE_NUMBER}" in body
```

### 6b. Spawn Developer Agent

```
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Implement issue #{ISSUE_NUMBER}"
  prompt: |
    You are the Developer agent. Load your role from .claude/agents/developer/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-implement.md first.

    After completing your work, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-implement.md
```

### 6c. Read Developer Report and Get PR Number

After developer returns, read `REPORT-implement.md` to understand what was done.

Get PR number from report or:
```bash
gh pr list --search "head:{ISSUE_NUMBER}-" --json number --jq '.[0].number'
```

---

## Step 7: Coordinate Reviews

Update issue label:
```bash
gh issue edit {ISSUE_NUMBER} --add-label "needs-review" --remove-label "in-progress"
```

### 7a. Write Review Briefings

Write briefings for each reviewer, including prior agent activity.

**BRIEFING-architect-review.md:**
```markdown
# Agent Briefing: architect-review
Generated: {timestamp}

## Your Task
Review PR #{pr_number} for technical quality.

## Context
- Issue: #{ISSUE_NUMBER} - {title}
- Developer has completed implementation

## Prior Agent Activity
- **Developer**: {summary from REPORT-implement.md - what was built, key decisions, any concerns}

## Resources (Read as Needed)
- PR details: `gh pr view {pr_number}`
- PR diff: `gh pr diff {pr_number}`

## Expected Output
Post standardized review comment:
- ✅ APPROVED - Architect (if acceptable)
- ❌ CHANGES REQUESTED - Architect (if issues found)
```

**BRIEFING-designer-review.md (if UI):**
```markdown
# Agent Briefing: designer-review
Generated: {timestamp}

## Your Task
Review PR #{pr_number} for UI/UX quality.

## Context
- Issue: #{ISSUE_NUMBER} - {title}
- You provided design specs earlier

## Prior Agent Activity
- **Designer** (specs): {summary from REPORT-design-specs.md}
- **Developer**: {summary from REPORT-implement.md}

## Resources (Read as Needed)
- PR details: `gh pr view {pr_number}`
- Your original design specs in issue comments

## Expected Output
Post standardized review comment:
- ✅ APPROVED - Designer
- ❌ CHANGES REQUESTED - Designer
- N/A - No UI changes (if applicable)
```

**BRIEFING-test.md:**
```markdown
# Agent Briefing: test
Generated: {timestamp}

## Your Task
Verify PR #{pr_number} meets acceptance criteria.

## Context
- Issue: #{ISSUE_NUMBER} - {title}

## Prior Agent Activity
- **Developer**: {summary from REPORT-implement.md}

## Resources (Read as Needed)
- PR details: `gh pr view {pr_number}`
- Issue acceptance criteria: `gh issue view {ISSUE_NUMBER}`
- Test commands: Check `.claude/commands.md`

## Expected Output
Post standardized review comment:
- ✅ APPROVED - Tester (all tests pass, criteria verified)
- ❌ CHANGES REQUESTED - Tester (issues found)
```

### 7b. Spawn Review Agents (Parallel)

Spawn all reviewers in parallel (single message, multiple Task calls):

```
# Architect review
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Architect review PR #{pr_number}"
  prompt: |
    You are the Architect agent. Load your role from .claude/agents/architect/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-architect-review.md first.

    After completing your review, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-architect-review.md

# Designer review (if UI)
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Designer review PR #{pr_number}"
  prompt: |
    You are the Designer agent. Load your role from .claude/agents/designer/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-designer-review.md first.

    After completing your review, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-designer-review.md

# Tester verification
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Tester verify PR #{pr_number}"
  prompt: |
    You are the Tester agent. Load your role from .claude/agents/tester/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-test.md first.

    After completing verification, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-test.md
```

### 7c. Read All Review Reports

After all reviewers return, read their reports:
- `REPORT-architect-review.md`
- `REPORT-designer-review.md` (if UI)
- `REPORT-test.md`

---

## Step 8: Handle Change Requests

Check PR comments for review status:
```bash
gh pr view {pr_number} --comments
```

**If any `❌ CHANGES REQUESTED`:**

### 8a. Write Feedback Briefing

Write `BRIEFING-address-feedback.md`:

```markdown
# Agent Briefing: address-feedback
Generated: {timestamp}

## Your Task
Address review feedback on PR #{pr_number}.

## Context
- Issue: #{ISSUE_NUMBER}
- Reviewers have requested changes

## Prior Agent Activity
- **Architect**: {from REPORT-architect-review.md - what was approved/rejected}
- **Designer**: {from REPORT-designer-review.md - if applicable}
- **Tester**: {from REPORT-test.md - test results}

## Feedback to Address
{List specific feedback items from reviews}

## Resources (Read as Needed)
- PR comments: `gh pr view {pr_number} --comments`

## Expected Output
- All feedback addressed
- Changes pushed
- Comment posted that changes are ready for re-review
```

### 8b. Spawn Developer for Fixes

```
Use the Task tool with:
  subagent_type: "general-purpose"
  model: "sonnet"
  description: "Address feedback PR #{pr_number}"
  prompt: |
    You are the Developer agent. Load your role from .claude/agents/developer/AGENT.md

    Read orchestration/issues/{ISSUE_NUMBER}-{slug}/BRIEFING-address-feedback.md first.

    After completing fixes, write your report to:
    orchestration/issues/{ISSUE_NUMBER}-{slug}/REPORT-address-feedback.md
```

### 8c. Re-request Reviews

After developer pushes fixes, re-run relevant reviews with new briefings.

Repeat until all required approvals are present.

---

## Step 9: Commit Orchestration Files

Before reporting success, commit all briefings and reports to the branch so they're preserved in the PR.

```bash
# Switch to the issue branch
BRANCH=$(gh pr view {pr_number} --json headRefName --jq '.headRefName')
git checkout "$BRANCH"

# Add all orchestration files for this issue
git add orchestration/issues/{ISSUE_NUMBER}-{slug}/

# Commit with clear message
git commit -m "docs: add agent orchestration files for #{ISSUE_NUMBER}

Includes briefings and reports from:
- Designer (if UI)
- Developer
- Architect review
- Tester verification

These provide audit trail of agent coordination."

# Push to the branch
git push
```

This ensures the full agent communication history is preserved in the PR and merged with the code.

---

## Step 10: Report Result

### Check for All Approvals

Required approvals (check PR comments):
- `✅ APPROVED - Architect` (always)
- `✅ APPROVED - Tester` (always)
- `✅ APPROVED - Designer` (if UI changes)

No outstanding `❌ CHANGES REQUESTED`.

### Success

If all approvals present:

```
Report: "SUCCESS: PR #{pr_number} is ready for merge"

Include:
- PR number
- Issue number
- Summary of what was implemented
```

### Blocked

If dependencies not met (from Step 3):

```
Report: "BLOCKED: Issue #{ISSUE_NUMBER} is blocked on #{dep_number}"
```

### Escalated

If developer escalated to architect, and architect also stuck:

```
Report: "ESCALATED: Issue #{ISSUE_NUMBER} requires human intervention"

Include:
- What was tried
- Where it got stuck
- Error details
```

---

## Exit States

The caller (either /work command or /work-all orchestrator) will parse the output for these indicators:

| State | Output Contains | Meaning |
|-------|-----------------|---------|
| SUCCESS | "PR #X is ready for merge" | All reviews approved, ready to merge |
| BLOCKED | "blocked on #" | Dependencies not met |
| ESCALATED | "requires human intervention" or "Escalating" | Stuck, needs human |

---

## Orchestration Folder After Completion

After working on issue #42, the folder should contain:

```
orchestration/issues/42-user-auth/
├── BRIEFING-design-specs.md      # (if UI) What designer was asked to do
├── REPORT-design-specs.md        # (if UI) What designer did
├── BRIEFING-implement.md         # What developer was asked to do
├── REPORT-implement.md           # What developer did
├── BRIEFING-architect-review.md  # What architect was asked to review
├── REPORT-architect-review.md    # Architect's review findings
├── BRIEFING-designer-review.md   # (if UI) What designer was asked to review
├── REPORT-designer-review.md     # (if UI) Designer's review findings
├── BRIEFING-test.md              # What tester was asked to verify
├── REPORT-test.md                # Tester's verification results
├── BRIEFING-address-feedback.md  # (if changes requested) Feedback to address
└── REPORT-address-feedback.md    # (if changes requested) How feedback was addressed
```

This provides a complete audit trail of all agent communication for the issue.

---

## Commands Reference

```bash
# Issue operations
gh issue view {n}
gh issue edit {n} --add-label "X" --remove-label "Y"

# PR operations
gh pr list --search "head:{issue}-"
gh pr view {n} --comments
gh pr comment {n} --body "..."

# Dependency check
gh issue view {n} --json body --jq '.body' | grep -oE 'Depends on #[0-9]+'
gh issue view {n} --json state --jq '.state'

# Orchestration folder
mkdir -p orchestration/issues/{issue}-{slug}
```
