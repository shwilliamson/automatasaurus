# Automatasaurus (Codex profile)

Automatasaurus is a workflow orchestration framework for Codex. It installs project-local playbooks, agents, and skills so you can run multi-agent work loops (discovery, planning, implementation) without a Claude/Anthropic subscription.

## Project Structure

```
automatasaurus/
├── bin/cli.js              # CLI entry point (init, update, status)
├── src/                    # CLI + installer implementation
│   ├── commands/           # init/update/status commands
│   └── lib/                # utilities (paths, manifest, symlinks, block merge)
├── template/               # Files copied/symlinked into target projects
│   ├── AGENTS.block.md     # Core docs merged into AGENTS.md
│   ├── commands.block.md   # Playbook list merged into commands.md
│   ├── commands/           # Playbooks for discovery/work/work-all
│   ├── agents/             # Persona definitions
│   ├── skills/             # Reusable knowledge modules
│   └── hooks/              # Optional notification scripts
└── .codex/                 # Symlinked to template/ when dogfooding
```

## Key Concepts (Codex-specific)

- **Block merging:** `.block.md` files merge into project files, preserving user content outside the marked block.
- **Symlink architecture:** `.automatasaurus/` holds the framework; `.codex/` symlinks to it so updates do not clobber custom additions.
- **Playbooks instead of slash commands:** `template/commands/*.md` are prompts you run from Codex (e.g., “Run the discovery playbook”). There is no Claude Code slash-command runtime.
- **No Claude hooks/settings:** The Claude-specific `settings.json` and stop hooks are removed. Use the optional shell scripts in `template/hooks/` from your own tooling if you want notifications.

## Getting Started

```bash
npm install
npx automatasaurus init
# Inspect generated files
cat AGENTS.md
cat .codex/commands.md
```

Then, in Codex, load the playbook you need (discovery, work, work-all) by pasting or referencing the corresponding `.codex/commands/*.md` content. Update `.codex/commands.md` with your project’s build/test commands so the agents know what to run.

## Template Files

| File/Folder          | Merge/Copy Strategy        |
|----------------------|----------------------------|
| `AGENTS.block.md`    | Block-merged into `AGENTS.md` |
| `commands.block.md`  | Block-merged into `.codex/commands.md` |
| `commands/*.md`      | Copied into `.codex/commands/` |
| `agents/*/AGENT.md`  | Copied into `.codex/agents/` |
| `skills/*/SKILL.md`  | Copied into `.codex/skills/` |
| `hooks/*.sh`         | Copied into `.codex/hooks/` (manual/optional) |

## Customization

- **Agents:** Add new personas under `template/agents/<name>/AGENT.md`, then refresh `AGENTS.block.md` to reference them.
- **Skills:** Add focused knowledge modules under `template/skills/<name>/SKILL.md`.
- **Commands/Playbooks:** Edit `.codex/commands.md` (outside the managed block) with your project’s commands and any additional playbooks.

## Testing

Run the Node native test runner:

```bash
npm test
```
