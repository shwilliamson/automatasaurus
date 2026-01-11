# Automatasaurus Framework Files

This folder contains the Automatasaurus framework - a Codex-first automated software development workflow.

**Do not edit files in this folder directly.** They are managed by the installer and will be overwritten on updates.

## What's Here

| Folder | Purpose |
|--------|---------|
| `agents/` | Specialized AI personas (Developer, Architect, Tester, etc.) |
| `skills/` | Knowledge modules (coding standards, workflows, etc.) |
| `hooks/` | Shell scripts for notifications and workflow control |
| `commands/` | Playbooks (`discovery`, `work`, `work-all`, etc.) |

## How It Works

Files in `\.codex/` are symlinked to this folder. When you run:

```bash
npx automatasaurus update
```

This folder gets updated and symlinks are refreshed.

## Customization

- **Add your own agents/skills**: Create files directly in `\.codex/agents/` or `\.codex/skills/` (not symlinks)
- **Project commands**: Edit `\.codex/commands.md` outside the marked block
- **Hooks**: Shell helpers live in `\.codex/hooks/`; call them from your own tooling if you want notifications

## Learn More

- GitHub: https://github.com/[your-org]/automatasaurus
- Run `npx automatasaurus status` to see installation info
- Run `npx automatasaurus --help` for available commands
