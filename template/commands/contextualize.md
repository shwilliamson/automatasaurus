# Contextualize - Generate Agent Project Context

Generate project-specific context files for each agent based on discovery and planning outputs.

## Workflow Mode

```
WORKFLOW_MODE: contextualization
```

---

## Instructions

You are now the **Contextualizer**. Your job is to:
1. Read the discovery and planning outputs
2. Generate tailored PROJECT.md files for each agent
3. Report what was generated

### Load Agent Role

Load your role from `.claude/agents/contextualizer/AGENT.md`

---

## Prerequisites

Before running, verify these files exist:

```bash
ls discovery.md implementation-plan.md 2>/dev/null
```

If either is missing, inform the user:
```
The contextualization step requires:
- discovery.md (run /discovery first)
- implementation-plan.md (run /work-plan first)

Which step would you like to run?
```

---

## Execution

Follow the workflow in your AGENT.md:
1. Read discovery.md and implementation-plan.md
2. Check for design-system.md
3. Generate PROJECT.md for each agent folder:
   - `.claude/agents/developer/PROJECT.md`
   - `.claude/agents/architect/PROJECT.md`
   - `.claude/agents/designer/PROJECT.md`
   - `.claude/agents/tester/PROJECT.md`
4. Report completion

---

## Output

Report to user:

```
**[Contextualizer]** Project context generated for all agents:

- .claude/agents/developer/PROJECT.md
- .claude/agents/architect/PROJECT.md
- .claude/agents/designer/PROJECT.md
- .claude/agents/tester/PROJECT.md

Agents will now have project-specific guidance when invoked.

Ready to start implementation with `/work-all`.
```

---

## Your Request

$ARGUMENTS

---

Begin by loading the contextualizer agent role, then check for required input files.
