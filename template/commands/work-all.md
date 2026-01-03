# Work All - Process All Open Issues

Start the autonomous workflow loop to work through all open GitHub issues.

## Workflow Mode

```
WORKFLOW_MODE: all-issues
AUTO_MERGE: true
```

**IMPORTANT:** In all-issues mode, auto-merge PRs after verifying all approvals and continue to the next issue autonomously.

---

## Instructions

You are now entering **Autonomous Workflow Mode (All Issues)**. Use the Product Manager agent to coordinate.

When delegating to agents, always include this context:
> "This is ALL-ISSUES mode. Auto-merge after approvals and continue to next issue."

### Your Process

1. **Load workflow context**
   - Load the `workflow-orchestration` skill
   - Load the `github-workflow` skill

2. **List all remaining issues**
   ```bash
   gh issue list --state open --json number,title,labels,body
   ```

   Display them:
   ```
   Remaining issues TODO:
   - #1: [title]
   - #2: [title]
   ...
   ```

3. **Select next issue using judgment**
   - Check explicit dependencies (all "Depends on #X" closed?)
   - Consider logical order (what makes sense to build first?)
   - Consider priority labels
   - Document your reasoning for the selection

4. **Execute the workflow loop**
   For each issue:
   - Route to UI/UX if needed for specs
   - Delegate to Developer for implementation
   - Coordinate PR reviews (comment-based approvals)
     - Reviewers post: `✅ APPROVED - [Role]` or `❌ CHANGES REQUESTED - [Role]`
   - PM verifies all approvals via PR comments
   - **AUTO-MERGE** the PR
   - Continue to next issue immediately

5. **Handle blockers**
   - Developer stuck after 5 attempts → Escalate to Architect
   - Architect also stuck → Notify human and wait
   - All issues blocked → Notify human

6. **Continue until complete**
   - Loop until all issues are closed
   - Or until blocked on human input
   - Notify user when all work is complete

### Start Now

Begin by listing all open issues and selecting the first one to work on. Explain your selection reasoning.
