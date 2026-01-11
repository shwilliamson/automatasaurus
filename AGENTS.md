# Automatasaurus Development Guide

Automatasaurus is a workflow orchestration framework for Claude Code that enables multi-agent autonomous development through GitHub issues and PRs.

## Project Structure

```
automatasaurus/
├── bin/cli.js              # CLI entry point (init, update, status)
├── src/
│   ├── commands/           # CLI command implementations
│   │   ├── init.js         # Initialize framework in target project
│   │   ├── update.js       # Update framework to latest version
│   │   └── status.js       # Show installation status
│   └── lib/                # Shared utilities
│       ├── paths.js        # Path utilities (template dir, project dir)
│       ├── manifest.js     # Track installation state (.automatasaurus/.manifest.json)
│       ├── symlinks.js     # Create .claude -> .automatasaurus symlinks
│       ├── block-merge.js  # Merge content into marked blocks in files
│       └── json-merge.js   # Deep merge JSON settings
├── template/               # Files installed into target projects
│   ├── CLAUDE.block.md     # Core framework docs (block-merged)
│   ├── commands.block.md   # Framework commands (block-merged)
│   ├── settings.json       # Claude Code settings with hooks
│   ├── commands/           # Slash command definitions
│   ├── agents/             # Specialized personas (PM, Developer, Architect, etc.)
│   ├── skills/             # Reusable knowledge modules
│   └── hooks/              # Shell scripts (notify, on-stop, request-attention)
└── .claude/                # Symlinked to template/ for dogfooding
```

## Commands

```bash
npm test                    # Run tests (node --test src/**/*.test.js)
npx automatasaurus init     # Test installer on a project
npx automatasaurus update   # Test update mechanism
npx automatasaurus status   # Test status display
```

## Key Concepts

### Block Merging
Files with `.block.md` extension use marked blocks that get merged into target files:
```markdown
<!-- AUTOMATASAURUS:START -->
Framework content here (replaced on update)
<!-- AUTOMATASAURUS:END -->
```
Content outside blocks is preserved during updates.

### Symlink Architecture
The installer creates `.automatasaurus/` with copied files, then symlinks `.claude/` subdirectories to it. This allows:
- Framework updates without losing project customizations
- Dogfooding (this repo's `.claude/` symlinks to `template/`)

### Manifest Tracking
`.automatasaurus/.manifest.json` tracks:
- Installation version
- Installed files and their hashes
- Symlink mappings

### Layered Settings Configuration
Settings use a layered approach to preserve user customizations across updates:

```
.claude/
├── settings.json        # Final merged output (Claude Code reads this)
└── settings.local.json  # User overrides (never touched by framework)
```

**Merge flow:**
1. Framework writes defaults to `settings.json`
2. User overrides from `settings.local.json` are merged on top
3. User values take precedence over framework defaults

**Implementation:** `src/lib/json-merge.js` exports:
- `mergeLayeredSettings(settingsPath, localPath, frameworkSettings)` - Main merge function
- `createLocalSettingsTemplate(localPath)` - Creates empty local file if missing

### Agent System
Each agent in `template/agents/` has:
- `AGENT.md` - Role definition, responsibilities, workflows
- Agents share GitHub identity, use headers like `**[Developer]**` to identify themselves

### Skills System
Skills in `template/skills/` are on-demand knowledge modules:
- Language-specific: python-standards, javascript-standards, css-standards
- Workflow-specific: github-workflow, code-review, pr-writing
- Loaded contextually when relevant to tasks

## Development Workflow

### Adding a New Agent
1. Create `template/agents/{agent-name}/AGENT.md`
2. Define role, responsibilities, preferred model
3. Add workflow patterns and handoff protocols
4. Update `template/CLAUDE.block.md` if needed

### Adding a New Skill
1. Create `template/skills/{skill-name}/SKILL.md`
2. Document when the skill should be loaded
3. Keep focused on single concern

### Modifying CLI Commands
1. Edit relevant file in `src/commands/`
2. Add tests in `src/**/*.test.js`
3. Run `npm test` to verify

### Testing Installer
```bash
# Create test directory
mkdir /tmp/test-project && cd /tmp/test-project
git init

# Run installer from this repo
npx /path/to/automatasaurus init

# Verify installation
ls -la .automatasaurus/
ls -la .claude/
cat CLAUDE.md
```

## Architecture Decisions

- **ESM only** - Uses ES modules throughout
- **No build step** - Source runs directly
- **Minimal dependencies** - Only Node.js built-ins
- **Node 18+** - Uses native test runner, fs/promises

## Template Files

| File | Merge Strategy |
|------|----------------|
| `CLAUDE.block.md` | Block-merge into CLAUDE.md |
| `commands.block.md` | Block-merge into commands.md |
| `settings.json` | Layered merge (framework defaults + user's `settings.local.json`) |
| `commands/*.md` | Direct copy |
| `agents/*/AGENT.md` | Direct copy |
| `skills/*/SKILL.md` | Direct copy |
| `hooks/*.sh` | Direct copy |

## Testing

Tests use Node.js native test runner:
```bash
npm test                    # All tests
node --test src/lib/*.test.js  # Specific directory
```

## Hooks System

Hooks in `template/hooks/` execute on Claude Code events:
- `on-stop.sh` - Runs when Claude stops, triggers notification
- `notify.sh` - Desktop notification system
- `request-attention.sh` - Explicit attention requests

Hook configuration in `template/settings.json` defines triggers.
