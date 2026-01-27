/**
 * Migrations configuration for Automatasaurus updates.
 *
 * When files are renamed or removed in the framework, add them here so that
 * `npx automatasaurus update` can clean up deprecated files from existing projects.
 */

/**
 * Files to remove during update.
 * These are relative paths from .automatasaurus/ and .claude/ directories.
 */
export const deprecatedFiles = {
  // Command files renamed to auto-* prefix (v0.2.0)
  commands: [
    'discovery.md',      // → auto-discovery.md
    'work.md',           // → auto-work-issue.md
    'work-all.md',       // → auto-work-all.md
    'work-plan.md',      // → auto-plan.md
    'work-milestone.md', // → auto-work-milestone.md
    'contextualize.md',  // → auto-evolve.md
  ],
  // Agent folders renamed (v0.2.0)
  agents: [
    'contextualizer',    // → evolver
  ],
};

/**
 * Get all deprecated paths that should be removed during update.
 * Returns paths relative to .automatasaurus/ or .claude/ directories.
 */
export function getDeprecatedPaths() {
  const paths = [];

  for (const file of deprecatedFiles.commands) {
    paths.push(`commands/${file}`);
  }

  for (const folder of deprecatedFiles.agents) {
    paths.push(`agents/${folder}`);
  }

  return paths;
}
