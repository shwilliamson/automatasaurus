# Automatasaurus

An automated software development workflow powered by Claude Code. Uses specialized subagents, stop hooks, and skills to enable extended autonomous development sessions with multiple coordinated personas.

## Overview

Automatasaurus creates a team of AI personas that work together through GitHub issues and PRs to build software. Each persona has specific expertise and responsibilities, and they coordinate their work using established software development practices.

**This repository contains the workflow orchestration framework.** Install it into your project to enable AI-assisted software development with coordinated agents.

## Workflow

The workflow operates in two phases:

### Phase 1: Discovery (Interactive)

```
User describes feature/project
    ↓
Product Manager: Leads discovery conversation
  - Goals and success metrics
  - Users and stakeholders
  - Business logic and constraints
  - Infrastructure requirements
    ↓
PM brings in specialists as needed:
  - Architect: Technical feasibility, patterns
  - Product Owner: User stories, acceptance criteria
  - UI/UX: Design requirements
    ↓
Product Owner: Creates GitHub issues with:
  - User stories and acceptance criteria
  - Dependencies ("Depends on #X")
  - Organized into milestones
    ↓
User approves milestone/issue breakdown
    ↓
User: "Start working on the issues"
```

### Phase 2: Autonomous Loop (PM Coordinated)

```
┌─────────────────────────────────────────────────────────────────────┐
│ PM COORDINATION LOOP                                                │
│                                                                     │
│ 1. PM: Select next issue                                           │
│    - Check dependencies (all deps closed?)                         │
│    - Consider priority labels                                       │
│    - Consult PO if unclear                                         │
│                                                                     │
│ 2. PM: Route to specialists                                         │
│    └→ UI/UX: Add specs if UI work needed                           │
│                                                                     │
│ 3. Developer: Implement                                             │
│    - Create branch: {issue-num}-{slug}                             │
│    - Commit frequently at logical checkpoints                      │
│    - If stuck (5 attempts) → Escalate to Architect                 │
│    - If Architect stuck → Notify human, wait                       │
│    - Open PR with "Closes #X"                                      │
│                                                                     │
│ 4. Review Cycle                                                     │
│    ├→ Architect: REQUIRED review                                   │
│    ├→ UI/UX: Review if UI-relevant (can decline "N/A")            │
│    └→ Developer: Address feedback, push fixes                      │
│                                                                     │
│ 5. Tester: Final Verification                                       │
│    - Run automated tests                                            │
│    - Manual verification if needed (Playwright)                    │
│    - If issues → Back to Developer                                 │
│    - If passes → Merge PR                                          │
│                                                                     │
│ 6. PM: Continue to next issue                                       │
│    └→ Loop until all issues complete                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Personas

| Persona | Role | Responsibilities |
|---------|------|------------------|
| **Product Owner** | Requirements | User stories, acceptance criteria, issue creation, follow-ups |
| **Product Manager** | Coordination | Leads discovery, drives the loop, selects issues, routes to specialists |
| **Architect** | Design | System design, ADRs, required PR reviews, stuck-issue analysis |
| **Developer** | Implementation | Feature development, bug fixes, PRs, addresses feedback |
| **Tester** | Quality | Test execution, Playwright verification, final merge |
| **UI/UX Designer** | Experience | Design specs, accessibility (optional, can decline for backend PRs) |

## Agent Comment Format

All agents prefix their comments with their identity:

```markdown
**[PM]** Starting work on issue #5. Routing to Developer.
**[Developer]** Fixed in commit abc1234. Ready for re-review.
**[Architect]** LGTM. Clean separation of concerns.
**[UI/UX]** N/A - No UI changes in this PR.
**[Tester]** Verified and approved. Merging.
**[Product Owner]** Created follow-up issue #12 for discovered scope.
```

## Features

- **Stop Hooks**: Intelligent evaluation ensures tasks are complete before stopping
- **Subagent Coordination**: Specialized agents with role-specific completion criteria
- **GitHub Integration**: All work coordinated through issues, PRs, and labels
- **Playwright MCP**: Browser automation for E2E testing and visual verification
- **Notifications**: Desktop alerts when agents need attention or finish work
- **Escalation Flow**: Developer → Architect → Human (when stuck)
- **Language Skills**: On-demand coding standards for Python, JavaScript, CSS
- **Project Commands**: Configurable commands for any project stack
- **Extended Sessions**: Designed for autonomous work over extended periods

## Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and authenticated
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Node.js (for Playwright MCP and npm-based projects)

**GitHub CLI Setup:**
```bash
# Install (macOS)
brew install gh

# Authenticate
gh auth login

# Verify
gh auth status
```

## Project Structure

```
automatasaurus/
├── CLAUDE.md                              # Claude Code project context
├── README.md                              # This file
├── .mcp.json                              # MCP server configuration (Playwright)
└── .claude/
    ├── settings.json                      # Claude Code settings with hooks
    ├── commands/                          # Slash commands
    │   ├── discovery.md                   # /discovery - Discovery mode
    │   ├── work-all.md                    # /work-all - Process all issues
    │   └── work.md                        # /work - Process single issue
    ├── commands.md                        # Project-specific commands
    ├── commands.template.md               # Template for new projects
    ├── hooks/                             # Notification and stop hooks
    │   ├── notify.sh                      # Desktop notification system
    │   ├── on-stop.sh                     # Auto-notify on stop
    │   └── request-attention.sh           # Explicit attention requests
    ├── agents/                            # Persona subagents
    │   ├── product-owner/                 # Requirements & issue creation
    │   ├── product-manager/               # Workflow coordinator
    │   ├── architect/                     # Design & required PR reviews
    │   ├── developer/                     # Implementation & PRs
    │   ├── tester/                        # QA, Playwright, merge authority
    │   └── ui-ux/                         # Design specs (optional)
    └── skills/                            # Reusable skills
        ├── workflow-orchestration/        # Full workflow documentation
        ├── github-workflow/               # Issue/PR/label management
        ├── github-issues/                 # Task breakdown, issue sizing, milestones
        ├── pr-writing/                    # PR description best practices
        ├── code-review/                   # Code review best practices
        ├── agent-coordination/            # Multi-agent patterns
        ├── project-commands/              # Command discovery
        ├── notifications/                 # Alert system docs
        ├── python-standards/              # Python conventions
        ├── javascript-standards/          # JS/TS conventions
        └── css-standards/                 # CSS/SCSS conventions
```

## Installation

### Future: CLI Tool (Coming Soon)

```bash
# Install globally
npm install -g automatasaurus

# Initialize in your project
cd your-project
automatasaurus init
```

### Current: Manual Installation

1. Clone this repository
2. Copy the `.claude` folder and `.mcp.json` to your project
3. Customize `.claude/commands.md` with your project's commands
4. Ensure GitHub CLI is authenticated: `gh auth status`
5. Start Claude Code:

```bash
claude
```

## Usage

### Slash Commands

The primary way to invoke workflows:

| Command | Description |
|---------|-------------|
| `/discovery [feature]` | Start discovery to understand requirements and create plan |
| `/work-all` | Work through all open issues autonomously |
| `/work [issue#]` | Work on a specific issue |

### `/discovery` - Discovery Mode

```
/discovery user authentication system
```

The Product Manager will:
- Lead a discovery conversation about goals, constraints, and requirements
- Bring in specialists (Architect, Product Owner, UI/UX) as topics arise
- Work with Product Owner to create well-formed GitHub issues
- Organize issues into milestones
- Get your approval before any implementation

### `/work-all` - Autonomous Loop

```
/work-all
```

The PM will:
- List all remaining issues
- Select next issue based on dependencies and priority
- Coordinate the full workflow (Developer → Reviews → Tester → Merge)
- Continue until all issues complete or blocked on human input

### `/work` - Single Issue

```
/work 42
```

Works on just issue #42:
- Checks dependencies are satisfied
- Routes through the full workflow
- Stops after that issue is merged

### Invoking Specific Agents

You can also invoke agents directly:

```
Use the architect agent to review the database schema
Use the tester agent to create a test plan for the API
Use the tester agent with playwright to verify the checkout flow
```

## Dependency Tracking

Issues track dependencies in their body:

```markdown
## Dependencies
Depends on #12 (User authentication)
Depends on #15 (Database schema)
```

The PM uses this to determine issue order - an issue is only "ready" when all dependencies are closed.

## State Labels

| Label | Description |
|-------|-------------|
| `ready` | No blocking dependencies, can be worked |
| `in-progress` | Currently being implemented |
| `blocked` | Waiting on dependencies or input |
| `needs-review` | PR open, awaiting reviews |
| `needs-testing` | Reviews complete, awaiting tester |
| `priority:high/medium/low` | Work order priority |

## Escalation Flow

When the Developer gets stuck after 5 attempts:

```
Developer stuck
    ↓
Escalate to Architect
    ↓
Architect analyzes and provides guidance
    ↓
If Architect also stuck → Notify human and wait
```

## Notifications

Agents send desktop notifications when they need your attention:

| Type | Trigger | Sound |
|------|---------|-------|
| **Question** | Agent has a blocking question | Submarine |
| **Approval** | PR or decision needs approval | Submarine |
| **Stuck** | Agent encountered an issue | Basso |
| **Complete** | All work finished | Hero |

## Configuration

### Project Commands

Edit `.claude/commands.md` for your project's commands:

```markdown
## Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start development server | `npm run dev` |
| Run all tests | `npm test` |
| Run E2E tests | `npx playwright test` |
```

### MCP Servers

The `.mcp.json` file configures Playwright for browser testing:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Notifications

Configure notification behavior via environment variables:

```bash
# Disable sound alerts
export AUTOMATASAURUS_SOUND=false

# Custom log location
export AUTOMATASAURUS_LOG=/path/to/log
```

## Language Skills

The developer agent loads language-specific skills on demand:

| Language | Skill | Covers |
|----------|-------|--------|
| Python | `python-standards` | PEP 8, type hints, pytest, async patterns |
| JavaScript/TypeScript | `javascript-standards` | ESM, React, testing, error handling |
| CSS/SCSS | `css-standards` | BEM, CSS variables, flexbox/grid, accessibility |

## Customization

### Adding a New Persona

1. Create `.claude/agents/<persona-name>/AGENT.md`
2. Define the frontmatter:
   ```yaml
   ---
   name: persona-name
   description: When to use this agent
   tools: Read, Edit, Write, Bash, Grep, Glob
   model: sonnet
   ---
   ```
3. Write a detailed system prompt including:
   - Responsibilities
   - When to use this agent
   - Comment format: `**[Agent Name]** comment text`
4. Update `CLAUDE.md` with the new persona

### Creating Skills

1. Create `.claude/skills/<skill-name>/SKILL.md`
2. Add frontmatter:
   ```yaml
   ---
   name: skill-name
   description: What this skill does and when to use it
   ---
   ```
3. Document the workflow or knowledge
4. Skills are loaded on-demand when relevant

## Roadmap

- [ ] CLI tool for easy installation (`automatasaurus init`)
- [ ] Project detection and automatic command configuration
- [ ] Additional MCP integrations (database, API testing)
- [ ] Custom persona templates
- [ ] Workflow visualization
- [ ] Integration with CI/CD

## Contributing

Contributions welcome:
- New persona definitions
- Improved stop hook prompts
- Additional skills and language standards
- Workflow patterns
- CLI tool development

## References

- [Claude Code Documentation](https://code.claude.com/docs)
- [Subagents Reference](https://code.claude.com/docs/en/sub-agents)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Skills Reference](https://code.claude.com/docs/en/skills)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [GitHub CLI](https://cli.github.com/)
- [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## License

This project is licensed under the [MIT License](LICENSE).
