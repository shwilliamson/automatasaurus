import { join } from 'node:path';
import { getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS } from '../lib/paths.js';
import { readManifest } from '../lib/manifest.js';
import { isSymlink } from '../lib/symlinks.js';

export async function status() {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const currentVersion = await getVersion();

  const manifest = await readManifest(projectRoot);

  if (!manifest) {
    console.log('\nAutomatasaurus is not installed in this project.');
    console.log(`\nRun "npx automatasaurus init" to install v${currentVersion}`);
    return;
  }

  console.log(`
Automatasaurus Status
=====================

Installed version: ${manifest.version}
Latest version:    ${currentVersion}
Installed at:      ${manifest.installed_at}
Last updated:      ${manifest.updated_at}

Symlinked files: ${manifest.symlinks.length}
Merged blocks:   ${manifest.merged_blocks.length}
`);

  // Check for version mismatch
  if (manifest.version !== currentVersion) {
    console.log(`Update available! Run "npx automatasaurus update" to upgrade.\n`);
  }

  // Check symlink health
  console.log('Symlink Status:');
  let brokenCount = 0;

  for (const symlinkPath of manifest.symlinks.slice(0, 10)) {
    const fullPath = join(paths.claude, symlinkPath);
    const linked = await isSymlink(fullPath);
    const status = linked ? 'OK' : 'BROKEN';
    if (!linked) brokenCount++;
    // Add trailing slash for directory symlinks (agents, skills)
    const isDir = SUBDIR_SYMLINK_DIRS.some(dir => symlinkPath.startsWith(`${dir}/`));
    const displayPath = isDir ? `${symlinkPath}/` : symlinkPath;
    console.log(`  ${status.padEnd(6)} ${displayPath}`);
  }

  if (manifest.symlinks.length > 10) {
    console.log(`  ... and ${manifest.symlinks.length - 10} more`);
  }

  if (brokenCount > 0) {
    console.log(`\nWarning: ${brokenCount} broken symlinks detected.`);
    console.log('Run "npx automatasaurus update --force" to repair.\n');
  }

  // Show merged blocks
  console.log('\nMerged Blocks:');
  for (const block of manifest.merged_blocks) {
    console.log(`  ${block.file} [${block.block}]`);
  }

  console.log('');
}
