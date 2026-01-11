# Automatasaurus - Codex Automation Playbooks

This project ships Automatasaurus configured for Codex. Instead of Claude slash commands and stop hooks, you run the playbooks in `.codex/commands/` directly from Codex. The framework still gives you coordinated personas (Architect, Designer, Developer, Tester) and documented workflows for discovery and implementation.

## How to Use

1. **Open Codex in this repo.**
2. **Load a playbook** by opening the relevant file:
   - Discovery: `.codex/commands/discovery.md`
   - Work plan: `.codex/commands/work-plan.md`
   - Single issue: `.codex/commands/work.md`
   - All issues loop: `.codex/commands/work-all.md`
3. Follow the instructions in the playbook. They describe when to switch personas (Architect/Designer/Developer/Tester) and how to comment on GitHub.
4. Update `.codex/commands.md` with your project’s install/test/dev commands so the Developer/Tester steps are accurate.

## Workflow (Two Phases)

**Phase 1: Discovery (interactive)**
- Use the discovery playbook to gather requirements and produce `discovery.md`.
- Route to Architect/Designer personas for reviews inside Codex.
- Create milestones/issues after you approve.

**Phase 2: Implementation (loop)**
- `work-plan` (optional): sequence issues/dependencies into `implementation-plan.md`.
- `work` (single issue): implement and stop after PR is ready.
- `work-all` (multi-issue): iterate through issues, spawn sub-workflows, and merge when done (you can keep “auto-merge” if desired or pause for manual approval).

## Project Commands (read first)

Always check `.codex/commands.md` for the correct install/test/dev commands before running anything. Edit that file (outside the managed block) to match your stack.

Common categories:
- install / dev / test / test:e2e / build / lint

## Agents

| Agent | Role | Suggested model | Review required? |
|-------|------|-----------------|------------------|
| Architect | System design, ADRs, stuck-issue analysis, PR review | codex (general) | Yes |
| Designer | UI/UX specs, accessibility, design review | codex (general) | If UI changes |
| Developer | Implementation, PRs, addressing feedback | codex (general) | N/A |
| Tester | QA, Playwright/E2E, verification | codex (general) | Yes |

**Identification is mandatory** because personas share the same GitHub user. Prefix every issue/PR comment with the agent header:

```
**[Agent Name]** message
```

Examples:
- `**[Product Owner]** Starting work on issue #5. Routing to Developer.`
- `**[Developer]** Fixed in commit abc1234. Ready for re-review.`
- `**[Architect]** ? APPROVED - Architect`
- `**[Designer]** N/A - No UI changes in this PR.`
- `**[Tester]** ? APPROVED - Tester`

## Skills

Skills live in `.codex/skills/` and can be loaded when relevant:
- Language standards: `javascript-standards`, `python-standards`, `css-standards`
- Workflow: `workflow-orchestration`, `work-issue`, `project-commands`
- GitHub: `github-workflow`, `github-issues`, `pr-writing`, `code-review`
- Discovery: `requirements-gathering`, `user-stories`

## Notifications (optional)

Shell helpers live in `.codex/hooks/` (notify, on-stop, request-attention). They are not auto-triggered in Codex; call them from your own scripts/CI if you want desktop or log notifications.
