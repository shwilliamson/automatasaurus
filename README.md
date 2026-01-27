# Automatasaurus

<img src="logo.jpeg" alt="Automatasaurus Logo" width="200">

An automated software development workflow powered by Claude Code. Uses specialized subagents, stop hooks, and skills to enable extended autonomous development sessions with multiple coordinated agents.

## Quick Start

Get automatasaurus running in your project in under a minute:

```bash
# Prerequisites: Claude Code CLI and GitHub CLI must be installed
# Install: https://claude.ai/code and https://cli.github.com/

# Initialize in your project
cd your-project
npx automatasaurus init

# Start Claude Code
claude

# Begin discovery for a new feature
/auto-discovery user authentication system

# Review and sequence the implementation plan
/auto-plan

# Generate agent-specific context files
/auto-evolve

# Work through all issues autonomously
/auto-work-all
```

That's it! The framework installs agents, skills, hooks, and slash commands into your project. See [Prerequisites](#prerequisites) for detailed setup instructions.

## Overview

Automatasaurus creates a team of AI agents that work together through GitHub issues and PRs to build software. Each agent has specific expertise and responsibilities, and they coordinate their work using established software development practices.

**This repository contains the workflow orchestration framework.** Install it into your project to enable AI-assisted software development with coordinated agents.

## Workflow

The workflow operates in two phases:

### Phase 1: Discovery (Interactive)

```
User: /auto-discovery "feature description"
    ↓
Discovery command facilitates conversation:
  - Goals and success metrics
  - Users and stakeholders
  - Business logic and constraints
  - Infrastructure requirements
    ↓
Brings in specialists for review:
  - Architect: Technical feasibility
  - Designer: UI/UX considerations
    ↓
Creates GitHub issues with:
  - User stories and acceptance criteria
  - Dependencies ("Depends on #X")
  - Organized into milestones
    ↓
User approves milestone/issue breakdown
    ↓
User: /auto-plan (analyze dependencies, create sequence)
    ↓
User: /auto-evolve (generate agent-specific context)
    ↓
User: /auto-work-all
```

### Phase 2: Autonomous Loop (Command Orchestrated)

```
┌─────────────────────────────────────────────────────────────────────┐
│ /auto-work-all ORCHESTRATION LOOP                                   │
│                                                                     │
│ 1. Select next issue                                                │
│    - Check dependencies (all deps closed?)                         │
│    - Consider priority labels                                       │
│    - Check circuit breaker limits                                  │
│                                                                     │
│ 2. Setup orchestration folder                                       │
│    - Create orchestration/issues/{issue-num}-{slug}/               │
│    - All agent briefings and reports stored here                   │
│                                                                     │
│ 3. Spawn agents with briefings                                      │
│    └→ Designer: Add specs if UI work needed                        │
│       (reads BRIEFING-design-specs.md, writes REPORT)              │
│                                                                     │
│ 4. Developer: Implement                                             │
│    - Reads BRIEFING-implement.md (includes prior agent activity)   │
│    - Create branch: {issue-num}-{slug}                             │
│    - If stuck (5 attempts) → Escalate to Architect                 │
│    - Open PR with "Closes #X"                                      │
│    - Writes REPORT-implement.md                                    │
│                                                                     │
│ 5. Review Cycle (parallel)                                          │
│    ├→ Architect: REQUIRED review (reads/writes briefing/report)    │
│    ├→ Designer: Review if UI-relevant                              │
│    └→ Developer: Address feedback, push fixes                      │
│                                                                     │
│ 6. Tester: Verification                                             │
│    - Reads BRIEFING-test.md (includes all prior reports)           │
│    - Run automated tests                                            │
│    - Writes REPORT-test.md                                         │
│                                                                     │
│ 7. Merge and continue                                               │
│    - Product Owner merges PR                                       │
│    - Loop until complete or limits reached                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Agents

| Agent | Model | Role | Responsibilities |
|-------|-------|------|------------------|
| **Architect** | Opus | Design | System design, ADRs, required PR reviews, stuck-issue analysis |
| **Evolver** | Sonnet | Preparation | Synthesizes discovery/planning into agent-specific PROJECT.md files |
| **Developer** | Sonnet | Implementation | Feature development, bug fixes, PRs, addresses feedback |
| **Designer** | Sonnet | Experience | UI/UX specs, accessibility, design reviews (if UI changes) |
| **Tester** | Sonnet | Quality | Test execution, Playwright verification, required PR reviews |

**Note:** Commands (`/auto-discovery`, `/auto-work-issue`, `/auto-work-all`) handle orchestration. There is no separate PM agent.

## Agent Comment Format

All agents prefix their comments with their identity:

```markdown
**[Product Owner]** Starting work on issue #5. Routing to Developer.
**[Evolver]** Project context generated for all agents.
**[Developer]** Fixed in commit abc1234. Ready for re-review.
**[Architect]** ✅ APPROVED - Architect. Clean separation of concerns.
**[Designer]** N/A - No UI changes in this PR.
**[Tester]** ✅ APPROVED - Tester. All tests passing.
```

## Features

- **Bidirectional Context Flow**: Agents communicate through briefings and reports, creating an audit trail
- **Stop Hooks**: Intelligent evaluation ensures tasks are complete before stopping
- **Subagent Coordination**: Specialized agents with role-specific completion criteria
- **GitHub Integration**: All work coordinated through issues, PRs, and labels
- **Playwright MCP**: Browser automation for E2E testing and visual verification
- **Notifications**: Desktop alerts when agents need attention or finish work
- **Escalation Flow**: Developer → Architect → Human (when stuck)
- **Language Skills**: On-demand coding standards for Python, JavaScript, CSS
- **Project Commands**: Configurable commands for any project stack
- **Extended Sessions**: Designed for autonomous work over extended periods

## Agent Context Flow

Sub-agents start with fresh context (no conversation history). The orchestration layer uses **briefings** and **reports** to communicate context and capture results.

### How It Works

1. **Parent creates briefing** with task context, constraints, and prior agent activity
2. **Sub-agent reads briefing** as its first action
3. **Sub-agent does work** following the briefing instructions
4. **Sub-agent writes report** before completing (what was done, decisions made, issues encountered)
5. **Parent reads report** and includes summary in next agent's briefing

This creates a **context chain** where each agent knows what previous agents did.

### Orchestration Folder Structure

All briefings and reports are stored per-issue:

```
orchestration/
└── issues/
    └── 42-user-authentication/
        ├── BRIEFING-design-specs.md      # Context for Designer
        ├── REPORT-design-specs.md        # Designer's output
        ├── BRIEFING-implement.md         # Context for Developer
        ├── REPORT-implement.md           # Developer's output
        ├── BRIEFING-architect-review.md  # Context for Architect
        ├── REPORT-architect-review.md    # Architect's findings
        ├── BRIEFING-test.md              # Context for Tester
        └── REPORT-test.md                # Tester's results
```

### Benefits

- **Audit trail**: Full history of agent communication per issue
- **Debugging**: Can review what context each agent received
- **No collisions**: Each agent spawn gets unique files
- **Informed decisions**: Reviewers see what Developer did, Tester sees all prior activity

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

After running `npx automatasaurus init`, your project will have:

```
your-project/
├── CLAUDE.md                    # Project context (automatasaurus block merged in)
├── orchestration/               # Agent communication (created during /work)
│   └── issues/                  # Per-issue briefings and reports
│       └── 42-user-auth/
│           ├── BRIEFING-*.md    # Context files for each agent
│           └── REPORT-*.md      # Output files from each agent
├── .automatasaurus/             # Framework files (managed by installer)
│   ├── README.md                # Framework documentation
│   ├── agents/                  # AI agents
│   │   ├── architect/           # Design & required PR reviews
│   │   ├── evolver/             # Agent context generation
│   │   ├── developer/           # Implementation & PRs
│   │   ├── designer/            # UI/UX design specs
│   │   └── tester/              # QA, Playwright, merge authority
│   ├── skills/                  # Knowledge modules
│   │   ├── workflow-orchestration/
│   │   ├── agent-coordination/
│   │   ├── work-issue/
│   │   ├── github-workflow/
│   │   ├── python-standards/
│   │   ⋮                        # (additional skills)
│   ├── hooks/                   # Shell scripts for notifications
│   │   ├── notify.sh
│   │   ├── on-stop.sh
│   │   └── request-attention.sh
│   └── commands/                # Slash command definitions
│       ├── auto-discovery.md
│       ├── auto-evolve.md
│       ├── auto-plan.md
│       ├── auto-work-all.md
│       ├── auto-work-issue.md
│       └── auto-work-milestone.md
└── .claude/
    ├── settings.json            # Claude Code settings (automatasaurus hooks merged in)
    ├── commands.md              # Project-specific commands (you edit this)
    ├── agents/ → .automatasaurus/agents/     # Symlinks
    ├── skills/ → .automatasaurus/skills/
    ├── hooks/ → .automatasaurus/hooks/
    └── commands/ → .automatasaurus/commands/
```

**Note:** Files in `.automatasaurus/` are managed by the installer and updated via `npx automatasaurus update`. Add your own custom agents/skills directly to `.claude/` (not as symlinks). The `orchestration/` folder is created during `/work` commands and can optionally be added to `.gitignore`.

## Installation

### From npm (recommended)

```bash
# Initialize automatasaurus in your project
cd your-project
npx automatasaurus init
```

### From local build

To install from a local checkout (useful for testing changes before publishing):

```bash
# 1. In the automatasaurus repo, create the package tarball
cd ~/src/automatasaurus
npm pack
# Creates automatasaurus-0.1.0.tgz (version number from package.json)

# 2. In your target project, install the tarball
cd ~/src/your-project
npm install ~/src/automatasaurus/automatasaurus-0.1.0.tgz

# 3. Run the init command
npx automatasaurus init
```

**Note:** Use `npm install` (not `npx install`) to add the package, then `npx automatasaurus` to run the CLI.

This approach tests exactly what would be published to npm, catching any packaging issues like missing files.

### Updating from local build

When testing changes to automatasaurus, you need to reinstall the tarball before running update:

```bash
# 1. In the automatasaurus repo, create a new tarball
cd ~/src/automatasaurus
npm pack

# 2. In your target project, reinstall and update
cd ~/src/your-project
npm install ~/src/automatasaurus/automatasaurus-0.1.0.tgz
npx automatasaurus update --force
```

The `--force` flag is needed because the version number may not have changed. Without it, update will say "Already at latest version."

**Alternative:** Run directly from source without packing:
```bash
npx ~/src/automatasaurus update --force
```

### What init does

This will:
1. Copy framework files to `.automatasaurus/` directory
2. Create symlinks in `.claude/` pointing to framework files
3. Merge automatasaurus config into `CLAUDE.md` and `.claude/settings.json`
4. Set up slash commands, agents, skills, and hooks

After initialization:
1. Customize `.claude/commands.md` with your project's build/test commands
2. Ensure GitHub CLI is authenticated: `gh auth status`
3. Start Claude Code: `claude`

### CLI Commands

```bash
npx automatasaurus init      # Install into current project
npx automatasaurus update    # Update framework files to latest
npx automatasaurus status    # Show installation info
```

## Usage

### Slash Commands

The primary way to invoke workflows:

| Command | Description |
|---------|-------------|
| `/auto-discovery [feature]` | Start discovery to understand requirements and create plan |
| `/auto-plan` | Analyze open issues, create sequenced implementation plan |
| `/auto-evolve` | Generate agent-specific PROJECT.md context files |
| `/auto-work-all` | Work through all open issues autonomously |
| `/auto-work-milestone [milestone#]` | Work through all issues in a specific milestone |
| `/auto-work-issue [issue#]` | Work on a specific issue |

### `/auto-discovery` - Discovery Mode

```
/auto-discovery user authentication system
```

The discovery command will:
- Lead a conversation about goals, constraints, and requirements
- Bring in specialists (Architect, Designer) for review
- Create well-formed GitHub issues with acceptance criteria
- Organize issues into milestones
- Get your approval before any implementation

### `/auto-plan` - Implementation Planning

```
/auto-plan
```

Before starting autonomous work, run this command to:
- Analyze all open issues and their dependencies
- Create a sequenced implementation plan
- Generate `implementation-plan.md` with work order and rationale
- Identify blockers and risks

This step helps you review and approve the execution order before `/auto-work-all` begins.

### `/auto-evolve` - Agent Context Generation

```
/auto-evolve
```

After planning, run this command to prepare each agent with project-specific guidance:
- Reads `discovery.md` and `implementation-plan.md`
- Generates tailored `PROJECT.md` files for each agent folder
- Developer gets implementation guidance, architecture patterns, tech decisions
- Architect gets review context, NFRs, integration dependencies
- Designer gets user personas, flows, accessibility requirements
- Tester gets acceptance criteria, edge cases, test coverage needs

The generated context helps agents make better decisions aligned with your project.

### `/auto-work-all` - Autonomous Loop

```
/auto-work-all
```

The orchestrator (aka Product Owner) will:
- List all remaining issues
- Select next issue based on dependencies and priority
- Spawn `/auto-work-issue {n}` as a subagent for context isolation
- Merge successful PRs
- Continue until all issues complete or circuit breaker limits reached

**Circuit Breaker Limits** (configurable in `.claude/settings.json`):
- `maxIssuesPerRun`: 20 - Stop after this many issues
- `maxEscalationsBeforeStop`: 3 - Stop if stuck too many times
- `maxConsecutiveFailures`: 3 - Stop if failing repeatedly

### `/auto-work-milestone` - Milestone-Scoped Work

```
/auto-work-milestone 3
```

Work through all open issues in a specific GitHub milestone:
- Validates the milestone exists and reports its title/open issue count
- Lists only issues assigned to that milestone
- Follows `implementation-plan.md` if it exists (filtered to milestone issues)
- Otherwise uses dependency/priority ordering within the milestone
- Same circuit breaker limits as `/auto-work-all`
- Auto-merges successful PRs
- Reports milestone-specific progress
- Stops when all issues in the milestone are complete (or limits reached)

Useful when you want to focus on completing a specific release or feature set rather than all open issues.

### `/auto-work-issue` - Single Issue

```
/auto-work-issue 42
```

Work on a specific issue - useful for one-off tickets or addressing a particular issue outside the full autonomous loop:
- Checks dependencies are satisfied
- Gets design specs if UI work is involved
- Developer implements and opens PR
- Coordinates reviews (Architect required, Designer if UI)
- Tester verifies
- Stops after that issue is complete (does not auto-merge)

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

### Circuit Breaker Limits

Customize limits in `.claude/settings.local.json` (your overrides, never touched by updates):

```json
{
  "automatasaurus": {
    "limits": {
      "maxIssuesPerRun": 50
    }
  }
}
```

Default values in `.claude/settings.json`:
- `maxIssuesPerRun`: 20
- `maxEscalationsBeforeStop`: 3
- `maxRetriesPerIssue`: 5
- `maxConsecutiveFailures`: 3

**Note:** Don't edit `settings.json` directly—your changes will be overwritten on update. Use `settings.local.json` for all customizations.

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

### Adding a New Agent

1. Create `.claude/agents/<agent-name>/AGENT.md`
2. Define the frontmatter:
   ```yaml
   ---
   name: agent-name
   description: When to use this agent
   tools: Read, Edit, Write, Bash, Grep, Glob
   model: sonnet
   ---
   ```
3. Write a detailed system prompt including:
   - Responsibilities
   - When to use this agent
   - Comment format: `**[Agent Name]** comment text`
4. Update `CLAUDE.md` with the new agent

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

- [x] CLI tool for easy installation (`automatasaurus init`)
- [ ] Project detection and automatic command configuration
- [ ] Additional MCP integrations (database, API testing)
- [ ] Custom agent templates
- [ ] Workflow visualization
- [ ] Integration with CI/CD

## Contributing

Contributions welcome:
- New agent definitions
- Improved stop hook prompts
- Additional skills and language standards
- Workflow patterns
- CLI tool development

## Publishing to npm

```bash
npm publish --auth-type=web
```

This opens a browser for authentication (works with passkeys/security keys).

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
