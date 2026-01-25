# Automatasaurus Framework Files

This folder contains the Automatasaurus framework - an automated software development workflow powered by Claude Code.

**Do not edit files in this folder directly.** They are managed by the installer and will be overwritten on updates.

## What's Here

| Folder | Purpose |
|--------|---------|
| `agents/` | Specialized AI personas (Developer, Architect, Tester, etc.) |
| `skills/` | Knowledge modules (coding standards, workflows, etc.) |
| `hooks/` | Shell scripts for notifications and workflow control |
| `commands/` | Slash commands (`/discovery`, `/work`, `/work-all`, `/work-milestone`) |

## How It Works

Files in `.claude/` are symlinked to this folder. When you run:

```bash
npx automatasaurus update
```

This folder gets updated and symlinks are refreshed.

## Customization

- **Add your own agents/skills**: Create files directly in `.claude/agents/` or `.claude/skills/` (not symlinks)
- **Project commands**: Edit `.claude/commands.md` outside the marked block
- **Settings**: Add to `.claude/settings.json` - your additions are preserved on update

## Learn More

- GitHub: https://github.com/[your-org]/automatasaurus
- Run `npx automatasaurus status` to see installation info
- Run `npx automatasaurus --help` for available commands
