# Automatasaurus

An automated software development workflow powered by Claude Code. Uses specialized subagents, stop hooks, and skills to enable extended autonomous development sessions with multiple coordinated personas.

## Overview

Automatasaurus creates a team of AI personas that work together through GitHub issues and PRs to build software. Each persona has specific expertise and responsibilities, and they coordinate their work using established software development practices.

## Personas

| Persona | Expertise | Responsibilities |
|---------|-----------|------------------|
| **Product Owner** | Requirements | User stories, acceptance criteria, backlog prioritization |
| **Product Manager** | Coordination | Roadmaps, milestones, release planning, stakeholder communication |
| **Architect** | Design | System design, ADRs, technology decisions, patterns |
| **Developer** | Implementation | Feature development, bug fixes, PRs, code quality |
| **Tester** | Quality | Test planning, automated tests, acceptance validation |
| **SecOps** | Security | Security reviews, vulnerability assessment, compliance |
| **UI/UX Designer** | Experience | User flows, component specs, accessibility |

## Features

- **Stop Hooks**: Intelligent evaluation ensures tasks are complete before stopping
- **Subagent Coordination**: Specialized agents for each role with appropriate tools and models
- **GitHub Integration**: All work coordinated through issues, PRs, and milestones
- **Skills**: Reusable workflows for common tasks
- **Extended Sessions**: Designed for autonomous work over extended periods

## Project Structure

```
automatasaurus/
├── CLAUDE.md                    # Claude Code project context
├── README.md                    # This file
└── .claude/
    ├── settings.json            # Claude Code settings with hooks
    ├── agents/                  # Persona subagents
    │   ├── product-owner/
    │   ├── product-manager/
    │   ├── architect/
    │   ├── developer/
    │   ├── tester/
    │   ├── secops/
    │   └── ui-ux/
    └── skills/                  # Reusable skills
        ├── github-workflow/
        └── agent-coordination/
```

## Getting Started

### Prerequisites

- [Claude Code CLI](https://claude.com/claude-code) installed
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- A GitHub repository to work with

### Usage

1. Clone this repository or copy the `.claude` folder to your project
2. Customize the agents for your team's needs
3. Start Claude Code in your project directory:

```bash
claude
```

4. Begin with a high-level request:

```
Create a user authentication system with login, logout, and password reset
```

The system will automatically:
- Break down requirements (Product Owner)
- Design the architecture (Architect)
- Review security implications (SecOps)
- Implement the solution (Developer)
- Write tests (Tester)
- Create GitHub issues and PRs along the way

### Invoking Specific Agents

You can invoke agents directly:

```
Use the architect agent to review the database schema
Use the secops agent to audit our dependencies
Use the tester agent to create a test plan for the API
```

## How It Works

### Stop Hooks

The system uses prompt-based stop hooks that evaluate:
- Has the task been fully completed?
- Are there errors or failing tests?
- Has work been documented in GitHub?
- Have relevant personas been consulted?

If any checks fail, Claude continues working rather than stopping prematurely.

### Subagent Stop Hooks

Each persona has their own stop evaluation to ensure they've fulfilled their role before handing off to the next persona in the workflow.

### Workflow Patterns

**New Feature:**
```
Product Owner → Architect → UI/UX → SecOps → Developer → Tester → Product Owner (accept)
```

**Bug Fix:**
```
Tester → Developer → (Architect if complex) → Tester (verify)
```

**Security Issue:**
```
SecOps → Architect → Developer → SecOps (verify)
```

## Configuration

### Settings (`settings.json`)

The settings file configures:
- **Permissions**: Allowed and denied tool patterns
- **Stop Hooks**: Prompt-based evaluation for task completion
- **SubagentStop Hooks**: Persona handoff validation
- **Session Hooks**: Initialization on session start

### Agents (`agents/<name>/AGENT.md`)

Each agent is defined with:
- **name**: Unique identifier
- **description**: When to invoke this agent
- **tools**: Available tools (Read, Edit, Bash, etc.)
- **model**: Which model to use (opus, sonnet, haiku)
- **System prompt**: Detailed instructions for the persona

### Skills (`skills/<name>/SKILL.md`)

Skills provide reusable workflows:
- **github-workflow**: Issue and PR management
- **agent-coordination**: Multi-agent orchestration patterns

## Customization

### Adding a New Persona

1. Create `.claude/agents/<persona-name>/AGENT.md`
2. Define the frontmatter (name, description, tools, model)
3. Write a detailed system prompt
4. Update `CLAUDE.md` with the new persona

### Creating Skills

1. Create `.claude/skills/<skill-name>/SKILL.md`
2. Add frontmatter with name and description
3. Document the workflow or knowledge
4. Skills are loaded on-demand when relevant

## Contributing

This is an experimental framework for autonomous software development. Contributions welcome:
- New persona definitions
- Improved stop hook prompts
- Additional skills
- Workflow patterns

## References

- [Claude Code Documentation](https://code.claude.com/docs)
- [Subagents Reference](https://code.claude.com/docs/en/sub-agents)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Skills Reference](https://code.claude.com/docs/en/skills)
- [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## License

MIT
