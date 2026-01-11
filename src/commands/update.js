import { cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { readManifest, writeManifest, updateManifest } from '../lib/manifest.js';

export async function update({ force = false } = {}) {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const templateDir = getTemplateDir();
  const version = await getVersion();

  // Check if initialized
  const manifest = await readManifest(projectRoot);
  if (!manifest) {
    console.log('Automatasaurus is not initialized in this project.');
    console.log('Run "automatasaurus init" first.');
    return;
  }

  console.log(`\nUpdating automatasaurus from v${manifest.version} to v${version}...\n`);

  if (manifest.version === version && !force) {
    console.log('Already at latest version. Use --force to reinstall.');
    return;
  }

  // 1. Update .automatasaurus directory
  console.log('Updating framework files in .automatasaurus/...');

  const allDirs = [...SUBDIR_SYMLINK_DIRS, ...FILE_SYMLINK_DIRS];
  for (const dir of allDirs) {
    const sourceDir = join(templateDir, dir);
    const targetDir = join(paths.automatasaurus, dir);
    try {
      await cp(sourceDir, targetDir, { recursive: true, force: true });
      console.log(`  Updated ${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 2. Recreate symlinks (in case new items were added)
  console.log('\nUpdating symlinks in .codex/...');
  const allSymlinks = [];

  // Subdirectory-level symlinks (agents, skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.codex, dir);
    try {
      const created = await symlinkSubdirectories(sourceDir, targetDir);
      for (const subdir of created) {
        allSymlinks.push(`${dir}/${subdir}`);
      }
      console.log(`  Updated ${dir}/ (${created.length} subdirs)`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // File-level symlinks (hooks, commands)
  for (const dir of FILE_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.codex, dir);
    try {
      const created = await symlinkDirectory(sourceDir, targetDir);
      for (const file of created) {
        allSymlinks.push(`${dir}/${file}`);
      }
      console.log(`  Updated ${dir}/ (${created.length} files)`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 3. Update block-merged files
  console.log('\nUpdating merged files...');

  // AGENTS.md
  const agentsTemplate = join(templateDir, 'AGENTS.block.md');
  try {
    const blockContent = await readFile(agentsTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.agentsMd, 'CORE', blockContent);
    console.log('  Updated AGENTS.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // commands.md
  const commandsTemplate = join(templateDir, 'commands.block.md');
  try {
    const blockContent = await readFile(commandsTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.commands, 'COMMANDS', blockContent);
    console.log('  Updated commands.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // 4. Update manifest
  const updatedManifest = updateManifest(manifest, {
    version,
    symlinks: allSymlinks,
  });
  await writeManifest(projectRoot, updatedManifest);

  console.log(`
Update complete! v${manifest.version} -> v${version}

Review the changes with:
  git diff

Commit when ready:
  git add -A && git commit -m "chore: update automatasaurus to v${version}"
`);
}
