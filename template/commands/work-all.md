# Work All - Process All Open Issues

Start the autonomous workflow loop to work through all open GitHub issues.

## Instructions

You are now entering **Autonomous Workflow Mode**. Use the Product Manager agent to coordinate.

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
   - Coordinate PR reviews (Architect required, UI/UX if relevant)
   - Delegate to Tester for final verification and merge
   - Continue to next issue

5. **Handle blockers**
   - Developer stuck after 5 attempts → Escalate to Architect
   - Architect also stuck → Notify human and wait
   - All issues blocked → Notify human

6. **Continue until complete**
   - Loop until all issues are closed
   - Or until blocked on human input

### Start Now

Begin by listing all open issues and selecting the first one to work on. Explain your selection reasoning.
