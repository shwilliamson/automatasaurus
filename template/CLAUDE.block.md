# Automatasaurus - Claude Code Automation Framework

This project uses Automatasaurus, an automated software development workflow powered by Claude Code. It uses specialized subagents, stop hooks, and skills to coordinate work across multiple personas.

## Workflow

### Two-Phase Operation

**Phase 1: Discovery (Interactive)**
- `/discovery` command facilitates requirements conversation with user
- Brings in specialists (Architect, Designer) for review as topics arise
- Creates GitHub issues organized into milestones
- User approves before autonomous work begins

**Phase 2: Autonomous Loop (Command Orchestrated)**
- `/work-all` command selects next issue based on dependencies and priority
- Routes to Designer for specs if UI work needed
- Developer implements and opens PR
- Review cycle: Architect (required), Designer (if UI)
- Tester verifies, then orchestration merges
- Loop continues until all issues complete or limits reached

**Note:** Commands (`/discovery`, `/work`, `/work-all`) act as the orchestrator. There is no separate PM agent.

### Escalation Flow

When stuck:
1. Developer tries up to 5 times
2. Escalates to Architect for analysis
3. If Architect also stuck - Notify human and wait

## Project Commands

**IMPORTANT**: Always check `.claude/commands.md` for project-specific commands before running any development, test, or build commands. Each target project will have its own commands configured.

Common command categories:
- `install` - Install dependencies
- `dev` - Start development server
- `test` - Run tests
- `test:e2e` - Run E2E tests with Playwright
- `build` - Build for production
- `lint` - Check code style

## Agents

The following agents are available in `.claude/agents/`:

| Agent | Role | Model | Review Status |
|-------|------|-------|---------------|
| `architect` | System design, ADRs, stuck-issue analysis, PR review | Opus | **Required** |
| `designer` | UI/UX specs, accessibility, design review | Sonnet | If UI changes |
| `developer` | Implementation, PRs, addressing feedback | Sonnet | N/A |
| `tester` | QA, Playwright, verification | Sonnet | **Required** |

**Note:** Commands handle orchestration. Agents are autonomous workers invoked by commands.

## Agent Identification (REQUIRED)

Since all agents share the same GitHub user, **every agent MUST clearly identify themselves** in ALL GitHub interactions. This is non-negotiable.

### Standard Header Format

Every GitHub comment, issue body, and PR description must start with:

```
**[Agent Name]**
```

### Agent Identifiers

| Agent | Identifier |
|-------|------------|
| Architect | `**[Architect]**` |
| Designer | `**[Designer]**` |
| Developer | `**[Developer]**` |
| Tester | `**[Tester]**` |
| Product Owner | `**[Product Owner]**` |

### Where to Use

**Comments (issues and PRs):**
```markdown
**[Product Owner]** Starting work on issue #5. Routing to Developer.
**[Developer]** Fixed in commit abc1234. Ready for re-review.
**[Architect]** LGTM. Clean separation of concerns.
```

**Issue bodies:**
```markdown
**[Product Owner]**

## User Story
As a user, I want...
```

**PR descriptions:**
```markdown
**[Developer]**

## Summary
This PR implements...

Closes #42
```

**PR reviews:**
```markdown
**[Architect]** Approving - clean architecture.

Suggestions (not blocking):
- Consider adding logging
```

### Why This Matters

- Provides clear audit trail of which agent did what
- Helps humans understand the workflow
- Essential for debugging when things go wrong
- Makes handoffs between agents visible

## State Labels

| Label | Description |
|-------|-------------|
| `ready` | No blocking dependencies, can be worked |
| `in-progress` | Currently being implemented |
| `blocked` | Waiting on dependencies or input |
| `needs-review` | PR open, awaiting reviews |
| `needs-testing` | Reviews complete, awaiting tester |
| `priority:high/medium/low` | Work order priority |

## Dependency Tracking

Issues document dependencies in their body:

```markdown
## Dependencies
Depends on #12 (User authentication)
Depends on #15 (Database schema)
```

PM parses these to determine issue order.

## MCP Integrations

### Playwright MCP
The tester agent has access to Playwright MCP for browser-based testing:
- Visual verification of UI changes
- E2E user flow testing
- Screenshot capture
- Interactive debugging

Usage: `Use playwright mcp to open a browser to [URL]`

## Stop Hook Behavior

The system uses intelligent stop hooks to ensure:
1. Tasks are fully completed before stopping
2. Open issues checked for more work
3. PRs reviewed and merged
4. Proper agent handoffs
5. Notifications sent when stuck or complete

## Technology Preferences

- **Always use typings** in all languages (TypeScript, Python type hints, etc.)
- **Defer to existing patterns** - when working in existing codebases, use existing tools, frameworks, patterns, and dependencies
- **Minimal new dependencies** - add new dependencies only out of necessity

For stack-specific preferences when starting new projects, see the relevant skills:
- `python-standards` - Python tooling and framework preferences
- `javascript-standards` - Frontend framework and tooling preferences
- `infrastructure-standards` - Cloud, IaC, and local dev preferences

## Development Conventions

### Git Workflow
- Branch naming: `{issue-num}-{slug}` (e.g., `42-user-authentication`)
- Commit frequently at logical checkpoints
- Commit format: `type: description (#issue)`
- PR body must include: `Closes #{issue-number}`
- PRs require Architect approval before merge
- Tester performs final verification and merge

### Scope Management

**Keep issues focused.** When working on an issue, you may discover additional work that is outside the current scope. Rather than expanding the issue:

1. **Create a new issue** for the out-of-scope work using the `github-issues` skill
2. **Reference it** in a comment: "Discovered while working on this - see #X"
3. **Continue with the original scope** - don't let discoveries derail the current task

This applies to:
- Refactoring opportunities noticed during implementation
- Bugs discovered in unrelated code
- Missing features that would be "nice to have"
- Technical debt items worth tracking

**Important:** Before creating a new issue, check for duplicates (see `github-issues` skill).

### Code Style
- Follow existing patterns in the codebase
- Keep functions small and focused
- Write tests for new functionality
- Handle errors appropriately

### Documentation
- Update README for user-facing changes
- Create ADRs for significant architectural decisions
- Document APIs and complex logic

## Slash Commands

Primary way to invoke workflows:

| Command | Description |
|---------|-------------|
| `/discovery [feature]` | Start discovery to understand requirements and create plan |
| `/work-plan` | Analyze open issues, create sequenced implementation plan |
| `/work-all` | Work through all open issues autonomously |
| `/work [issue#]` | Work on a specific issue |

Examples:
```
/discovery user authentication system
/work-plan
/work-all
/work 42
```

## Agent Invocation

Agents can also be invoked explicitly:
```
Use the architect agent to design the authentication system
Use the tester agent to create a test plan for this feature
Use the tester agent with playwright to verify the login flow
```

Or they are automatically selected based on task context.

## GitHub Integration

This project uses the `gh` CLI for GitHub operations. Ensure you are authenticated:
```bash
gh auth status
```

## Skills

Available skills in `.claude/skills/`:

### Workflow Skills
- `workflow-orchestration` - Full workflow loop documentation
- `work-issue` - Core logic for implementing a single issue (used by /work and /work-all)
- `github-workflow` - Issue/PR management, state labels
- `github-issues` - Issue creation, sizing, milestones
- `pr-writing` - Best practices for writing clear PR descriptions
- `code-review` - Best practices for performing thorough code reviews
- `agent-coordination` - Multi-agent workflow patterns
- `project-commands` - Finding and using project-specific commands
- `notifications` - User notification system for questions, approvals, and alerts

### Language Standards
- `python-standards` - Python coding conventions, typing, testing patterns
- `javascript-standards` - JS/TS conventions, React patterns, testing
- `css-standards` - CSS/SCSS conventions, layouts, accessibility

**Note**: Load the appropriate language skill before writing code in that language.

## Notification System

Agents can alert the user when attention is needed:

```bash
# Question that blocks progress
.claude/hooks/request-attention.sh question "Which approach should I take?"

# Approval needed
.claude/hooks/request-attention.sh approval "PR is ready for review"

# Got stuck
.claude/hooks/request-attention.sh stuck "Cannot resolve this error"

# Work complete
.claude/hooks/request-attention.sh complete "All tasks finished"
```

Notifications are also sent automatically on stop based on context.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `WORKFLOW_MODE` | Set to "automated" for autonomous operation |
| `GITHUB_WORKFLOW` | Set to "enabled" for GitHub integration |
| `AUTOMATASAURUS_SOUND` | Set to "false" to disable notification sounds |
| `AUTOMATASAURUS_LOG` | Custom log file location |

## Circuit Breaker Configuration

Limits are configured in `.claude/settings.json` under `automatasaurus.limits`:

```json
{
  "automatasaurus": {
    "limits": {
      "maxIssuesPerRun": 20,
      "maxEscalationsBeforeStop": 3,
      "maxRetriesPerIssue": 5,
      "maxConsecutiveFailures": 3
    }
  }
}
```

| Limit | Default | Purpose |
|-------|---------|---------|
| `maxIssuesPerRun` | 20 | Max issues to process in `/work-all` before stopping |
| `maxEscalationsBeforeStop` | 3 | Stop if Architect escalates to human this many times |
| `maxRetriesPerIssue` | 5 | Developer attempts before escalating to Architect |
| `maxConsecutiveFailures` | 3 | Stop after this many failed issues in a row |

**To override:** Add your own `automatasaurus.limits` section to your project's `.claude/settings.json`. Custom values survive framework updates.
