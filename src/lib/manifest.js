import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const MANIFEST_FILE = '.automatasaurus.manifest.json';

/**
 * Get the manifest file path for a project
 */
export function getManifestPath(projectRoot) {
  return join(projectRoot, '.codex', MANIFEST_FILE);
}

/**
 * Read the manifest from a project, returns null if not found
 */
export async function readManifest(projectRoot) {
  try {
    const content = await readFile(getManifestPath(projectRoot), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write the manifest to a project
 */
export async function writeManifest(projectRoot, manifest) {
  const content = JSON.stringify(manifest, null, 2) + '\n';
  await writeFile(getManifestPath(projectRoot), content, 'utf-8');
}

/**
 * Create a new manifest
 */
export function createManifest(version) {
  return {
    version,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    symlinks: [],
    merged_blocks: [],
  };
}

/**
 * Update manifest with new symlinks and merged blocks
 */
export function updateManifest(manifest, { symlinks, mergedBlocks, version }) {
  return {
    ...manifest,
    version: version ?? manifest.version,
    updated_at: new Date().toISOString(),
    symlinks: symlinks ?? manifest.symlinks,
    merged_blocks: mergedBlocks ?? manifest.merged_blocks,
  };
}
