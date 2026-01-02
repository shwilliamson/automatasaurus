# Automatasaurus - Claude Code Automation Framework

This project is an automated software development workflow powered by Claude Code. It uses specialized subagents, stop hooks, and skills to coordinate work across multiple personas.

## Project Overview

Automatasaurus enables extended, autonomous software development sessions by coordinating multiple specialized agents that work together through GitHub issues and PRs.

## Personas/Agents

The following agents are available in `.claude/agents/`:

| Agent | Role | Model |
|-------|------|-------|
| `product-owner` | Requirements, user stories, acceptance criteria | Opus |
| `product-manager` | Roadmap, milestones, release coordination | Sonnet |
| `architect` | System design, ADRs, technical decisions | Opus |
| `developer` | Feature implementation, bug fixes, PRs | Sonnet |
| `tester` | Test planning, automated tests, QA | Sonnet |
| `secops` | Security reviews, vulnerability assessment | Opus |
| `ui-ux` | User experience, accessibility, design specs | Sonnet |

## Workflow Coordination

Work is coordinated through GitHub:
- **Issues**: Track features, bugs, and tasks
- **Pull Requests**: Code changes with reviews
- **Milestones**: Group related work for releases
- **Labels**: Categorize and prioritize work

## Stop Hook Behavior

The system uses intelligent stop hooks to ensure:
1. Tasks are fully completed before stopping
2. All relevant personas have been consulted
3. Work is properly documented in GitHub
4. No errors or failing tests remain

## Common Commands

```bash
# Create a feature issue
gh issue create --title "Feature: ..." --body "..." --label "feature"

# Create a PR
gh pr create --title "..." --body "..."

# Check issue status
gh issue list

# Run tests
npm test
```

## Development Conventions

### Git Workflow
- Branch naming: `feature/issue-123-description`, `fix/issue-456-bug-name`
- Commit messages: `feat: description (#123)`, `fix: description (#456)`
- PRs require review and passing tests before merge

### Code Style
- Follow existing patterns in the codebase
- Keep functions small and focused
- Write tests for new functionality
- Handle errors appropriately

### Documentation
- Update README for user-facing changes
- Create ADRs for significant architectural decisions
- Document APIs and complex logic

## Agent Invocation

Agents can be invoked explicitly:
```
Use the architect agent to design the authentication system
Use the secops agent to review this PR for security issues
Use the tester agent to create a test plan for this feature
```

Or they are automatically selected based on task context.

## GitHub Integration

This project uses the `gh` CLI for GitHub operations. Ensure you are authenticated:
```bash
gh auth status
```
