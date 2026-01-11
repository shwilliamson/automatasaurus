# Automatasaurus (Codex edition)

<img src="logo.jpeg" alt="Automatasaurus Logo" width="200">

Automatasaurus is a Codex-first, multi-agent workflow for shipping software via GitHub issues and PRs. It installs playbooks, agents, and skills into your project so you can run discovery, planning, and implementation loops without a Claude/Anthropic subscription.

## Quick Start

```bash
# Prerequisites: Node 18+, GitHub CLI (`gh`) authenticated, Codex CLI

# Initialize in your project
cd your-project
npx automatasaurus init

# Customize project commands
cat .codex/commands.md   # fill in install/test/dev commands

# Run playbooks from Codex
#   Discovery:      open .codex/commands/discovery.md
#   Work plan:      open .codex/commands/work-plan.md
#   Single issue:   open .codex/commands/work.md (set ISSUE_NUMBER)
#   All issues:     open .codex/commands/work-all.md
```

## Workflow Overview

**Phase 1: Discovery (interactive)**
- Use the discovery playbook to gather requirements and write `discovery.md`.
- Route to Architect/Designer personas for reviews.
- Create milestones and issues after you approve.

**Phase 2: Implementation (loop)**
- Optionally run the work-plan playbook to build `implementation-plan.md`.
- Use the work playbook for a single issue (no auto-merge).
- Use the work-all playbook to iterate issues, coordinate reviews, and merge when ready.

## Agents

| Agent | Role | Review required? |
|-------|------|------------------|
| Architect | System design, ADRs, stuck-issue analysis, PR review | Yes |
| Designer | UI/UX specs, accessibility, design review | If UI changes |
| Developer | Implementation, PRs, addressing feedback | N/A |
| Tester | QA, Playwright/E2E, verification | Yes |

**Comment format** (shared GitHub identity):
```
**[Product Owner]** Starting work on issue #5. Routing to Developer.
**[Developer]** Fixed in commit abc1234. Ready for re-review.
**[Architect]** ? APPROVED - Architect
**[Designer]** N/A - No UI changes in this PR.
**[Tester]** ? APPROVED - Tester
```

## Features

- **Playbooks** for discovery, work-plan, work, and work-all (no Claude slash commands required).
- **Coordinated personas** (Architect/Designer/Developer/Tester) with documented responsibilities.
- **GitHub-native** workflow: issues, PRs, labels, dependency parsing.
- **Skills system** for language and workflow guidance.
- **Optional notifications/hooks**: shell scripts in `.codex/hooks/` you can call from your own tooling.
- **Playwright MCP** wired via `.mcp.json` for browser/E2E automation.

## Project Structure (after `npx automatasaurus init`)

```
your-project/
├── AGENTS.md                 # Framework docs (block-merged)
├── .automatasaurus/          # Framework files (managed)
│   ├── agents/               # Persona definitions
│   ├── skills/               # Knowledge modules
│   ├── commands/             # Playbooks
│   └── hooks/                # Optional notification scripts
└── .codex/                   # Symlinks to .automatasaurus (you edit here)
    ├── commands.md           # Your project commands (outside managed block)
    ├── agents/ -> .automatasaurus/agents/
    ├── skills/ -> .automatasaurus/skills/
    ├── hooks/ -> .automatasaurus/hooks/
    └── commands/ -> .automatasaurus/commands/
```

**Note:** `.automatasaurus/` is managed by the installer. Add custom agents/skills directly under `.codex/` (not as symlinks).

## Using the Playbooks

- **Discovery:** Open `.codex/commands/discovery.md` in Codex. Follow the Q&A flow, draft `discovery.md`, and request Architect/Designer reviews.
- **Work plan:** Open `.codex/commands/work-plan.md`. Build `implementation-plan.md` from existing issues/dependencies.
- **Work (single issue):** Open `.codex/commands/work.md` with `ISSUE_NUMBER` set. Do not auto-merge; stop when PR is approved.
- **Work all:** Open `.codex/commands/work-all.md`. Iterate open issues in dependency/priority order, run isolated work sessions per issue, and merge when approvals are present.

## Project Commands

Edit `.codex/commands.md` to record your install/test/build/dev commands (outside the managed block). Agents and playbooks refer to this file before running tooling.

## MCP

`.mcp.json` includes Playwright MCP:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "description": "Browser automation for E2E testing and visual verification"
    }
  }
}
```

## Customization

- **Add agents:** Create `.codex/agents/<name>/AGENT.md` and reference it in `template/AGENTS.block.md` before publishing an update.
- **Add skills:** Create `.codex/skills/<name>/SKILL.md` with a focused scope.
- **Extend playbooks:** Add new files under `template/commands/` and include them in `commands.block.md`.

## Testing

Run the Node native test runner:
```bash
npm test
```

## Roadmap

- [ ] Auto-detect project commands during init
- [ ] Additional MCP integrations (database/API testing)
- [ ] Configurable merge policy for work-all
