# Work - Process a Specific Issue

Work on a specific GitHub issue by number.

## Workflow Mode

```
WORKFLOW_MODE: single-issue
AUTO_MERGE: false
```

**IMPORTANT:** In single-issue mode, do NOT auto-merge. Notify the user when the PR is ready for their review and merge.

---

## Instructions

You are now entering **Single Issue Workflow Mode**.

When delegating to agents, always include this context:
> "This is SINGLE-ISSUE mode. Do NOT auto-merge. Notify user when PR is approved."

### Your Process

1. **Get the issue details**
   ```bash
   gh issue view $ARGUMENTS
   ```

2. **Check dependencies**
   - Parse "Depends on #X" from issue body
   - Verify all dependencies are CLOSED
   - If blocked, report and stop

3. **Check if UI/UX specs needed**
   - If issue involves UI work and no specs exist, route to UI/UX Designer first

4. **Delegate to Developer**
   - Developer creates branch: `{issue-number}-{slug}`
   - Developer implements with frequent commits
   - Developer writes tests
   - Developer opens PR with "Closes #{issue}"

5. **Coordinate PR Review (Comment-Based)**
   - Architect reviews and posts: `✅ APPROVED - Architect` or `❌ CHANGES REQUESTED - Architect`
   - Product Owner reviews and posts approval/changes comment
   - UI/UX reviews if UI-relevant (or declines N/A)
   - Developer addresses any feedback

6. **Verify All Approvals (DO NOT MERGE)**
   - Check PR comments for all required approvals
   - Verify no outstanding change requests
   - Post verification comment confirming all approvals received
   - **STOP HERE** - Do NOT merge

7. **Notify User**
   - Report that PR is ready for user review and merge
   - Provide PR link
   - List all approvals received
   - User will merge when ready

### Issue to Work On

Issue number: $ARGUMENTS

---

Begin by fetching the issue details and checking if dependencies are satisfied.
