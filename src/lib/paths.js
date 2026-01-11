import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get the package root directory (where package.json is)
 */
export function getPackageRoot() {
  return join(__dirname, '..', '..');
}

/**
 * Get the template directory
 */
export function getTemplateDir() {
  return join(getPackageRoot(), 'template');
}

/**
 * Get the version from package.json
 */
export async function getVersion() {
  const { readFile } = await import('node:fs/promises');
  const pkgPath = join(getPackageRoot(), 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
  return pkg.version;
}

/**
 * Standard paths for installation
 */
export function getProjectPaths(projectRoot) {
  return {
    automatasaurus: join(projectRoot, '.automatasaurus'),
    codex: join(projectRoot, '.codex'),
    agentsMd: join(projectRoot, 'AGENTS.md'),
    manifest: join(projectRoot, '.codex', '.automatasaurus.manifest.json'),
    settings: join(projectRoot, '.codex', 'settings.json'),
    settingsLocal: join(projectRoot, '.codex', 'settings.local.json'),
    commands: join(projectRoot, '.codex', 'commands.md'),
  };
}

/**
 * Directories that get symlinked at subdirectory level (each subdir is a symlink)
 * Use for directories containing multiple independent modules (agents, skills)
 */
export const SUBDIR_SYMLINK_DIRS = ['agents', 'skills'];

/**
 * Directories that get symlinked at file level (each file is a symlink)
 * Use for directories containing flat files (hooks, commands)
 */
export const FILE_SYMLINK_DIRS = ['hooks', 'commands'];
