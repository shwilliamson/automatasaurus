import { mkdir, cp, readFile, rm, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { mergeLayeredSettings, createLocalSettingsTemplate } from '../lib/json-merge.js';
import { readManifest, writeManifest, updateManifest } from '../lib/manifest.js';
import { getDeprecatedPaths } from '../lib/migrations.js';

export async function update({ force = false } = {}) {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const templateDir = getTemplateDir();
  const version = await getVersion();

  // Check if initialized
  const manifest = await readManifest(projectRoot);
  if (!manifest) {
    console.log('Automatasaurus is not initialized in this project.');
    console.log('Run "npx automatasaurus init" first.');
    return;
  }

  console.log(`\nUpdating automatasaurus from v${manifest.version} to v${version}...\n`);

  if (manifest.version === version && !force) {
    console.log('Already at latest version. Use --force to reinstall.');
    return;
  }

  // 1. Run migrations - remove deprecated files
  console.log('Running migrations...');
  const deprecatedPaths = getDeprecatedPaths();
  let migrationsRun = 0;

  for (const relativePath of deprecatedPaths) {
    // Remove from .automatasaurus/
    const automatasaurusPath = join(paths.automatasaurus, relativePath);
    try {
      const stat = await lstat(automatasaurusPath);
      await rm(automatasaurusPath, { recursive: stat.isDirectory(), force: true });
      migrationsRun++;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Remove from .claude/ (only if it's a symlink or doesn't exist - don't remove user files)
    const claudePath = join(paths.claude, relativePath);
    try {
      const stat = await lstat(claudePath);
      if (stat.isSymbolicLink()) {
        await rm(claudePath, { force: true });
      }
      // If it's not a symlink, it's a user file - leave it alone
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  if (migrationsRun > 0) {
    console.log(`  Removed ${migrationsRun} deprecated file(s)`);
  } else {
    console.log('  No migrations needed');
  }

  // 2. Update .automatasaurus directory
  console.log('\nUpdating framework files in .automatasaurus/...');

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

  // 3. Recreate symlinks (in case new items were added)
  console.log('\nUpdating symlinks in .claude/...');
  const allSymlinks = [];

  // Subdirectory-level symlinks (agents, skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.claude, dir);
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
    const targetDir = join(paths.claude, dir);
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

  // 4. Update block-merged files
  console.log('\nUpdating merged files...');

  // CLAUDE.md
  const claudeMdTemplate = join(templateDir, 'CLAUDE.block.md');
  try {
    const blockContent = await readFile(claudeMdTemplate, 'utf-8');
    await mergeBlockIntoFile(paths.claudeMd, 'CORE', blockContent);
    console.log('  Updated CLAUDE.md');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // settings.json with layered config support
  const settingsTemplate = join(templateDir, 'settings.json');
  try {
    const settingsContent = await readFile(settingsTemplate, 'utf-8');
    const frameworkSettings = JSON.parse(settingsContent);

    // Ensure settings.local.json exists (for users upgrading from older versions)
    const localCreated = await createLocalSettingsTemplate(paths.settingsLocal);
    if (localCreated) {
      console.log('  Created settings.local.json (for your customizations)');
    }

    // Merge: framework defaults + user overrides -> settings.json
    const result = await mergeLayeredSettings(paths.settings, paths.settingsLocal, frameworkSettings);
    console.log('  Updated settings.json');
    if (result.hasLocalOverrides) {
      console.log('  Preserved overrides from settings.local.json');
    }
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

  // 5. Update manifest
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
