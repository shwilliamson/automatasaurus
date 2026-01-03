# Work - Process a Specific Issue

Work on a specific GitHub issue by number.

## Instructions

You are now entering **Single Issue Workflow Mode**.

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

5. **Coordinate PR Review**
   - Architect reviews (required)
   - UI/UX reviews if UI-relevant (or declines N/A)
   - Developer addresses any feedback

6. **Final Verification**
   - Tester runs tests
   - Tester does manual verification if needed
   - Tester merges PR

7. **Complete**
   - Verify issue auto-closed
   - Report completion

### Issue to Work On

Issue number: $ARGUMENTS

---

Begin by fetching the issue details and checking if dependencies are satisfied.
