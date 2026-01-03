import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { mergeJsonFile } from '../lib/json-merge.js';
import { readManifest, writeManifest, createManifest, updateManifest } from '../lib/manifest.js';

export async function init({ force = false } = {}) {
  const projectRoot = process.cwd();
  const paths = getProjectPaths(projectRoot);
  const templateDir = getTemplateDir();
  const version = await getVersion();

  console.log(`\nInitializing automatasaurus v${version}...\n`);

  // Check if already initialized
  const existingManifest = await readManifest(projectRoot);
  if (existingManifest && !force) {
    console.log(`Already initialized (v${existingManifest.version}).`);
    console.log('Run with --force to reinitialize, or use "update" to update.');
    return;
  }

  // 1. Create .automatasaurus directory and copy template files
  console.log('Copying framework files to .automatasaurus/...');
  await mkdir(paths.automatasaurus, { recursive: true });

  for (const dir of SYMLINK_DIRS) {
    const sourceDir = join(templateDir, dir);
    const targetDir = join(paths.automatasaurus, dir);
    try {
      await cp(sourceDir, targetDir, { recursive: true, force: true });
      console.log(`  Copied ${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Directory doesn't exist in template, skip
    }
  }

  // 2. Create .claude directory
  await mkdir(paths.claude, { recursive: true });

  // 3. Create symlinks from .claude to .automatasaurus
  console.log('\nCreating symlinks in .claude/...');
  const allSymlinks = [];

  for (const dir of SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.claude, dir);
    try {
      const created = await symlinkDirectory(sourceDir, targetDir);
      for (const file of created) {
        const symlinkPath = join(dir, file);
        allSymlinks.push(symlinkPath);
        console.log(`  Linked ${symlinkPath}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 4. Block-merge CLAUDE.md
  console.log('\nMerging CLAUDE.md...');
  const claudeMdTemplate = join(templateDir, 'CLAUDE.block.md');
  try {
    const blockContent = await readFile(claudeMdTemplate, 'utf-8');
    const result = await mergeBlockIntoFile(paths.claudeMd, 'CORE', blockContent);
    console.log(`  ${result.created ? 'Created' : 'Updated'} CLAUDE.md`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No CLAUDE.md template found, skipping');
  }

  // 5. Merge settings.json
  console.log('\nMerging settings.json...');
  const settingsTemplate = join(templateDir, 'settings.json');
  try {
    const settingsContent = await readFile(settingsTemplate, 'utf-8');
    const frameworkSettings = JSON.parse(settingsContent);
    const result = await mergeJsonFile(paths.settings, frameworkSettings);
    console.log(`  ${result.created ? 'Created' : 'Updated'} settings.json`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No settings template found, skipping');
  }

  // 6. Block-merge commands.md
  console.log('\nMerging commands.md...');
  const commandsTemplate = join(templateDir, 'commands.block.md');
  try {
    const blockContent = await readFile(commandsTemplate, 'utf-8');
    const result = await mergeBlockIntoFile(paths.commands, 'COMMANDS', blockContent);
    console.log(`  ${result.created ? 'Created' : 'Updated'} commands.md`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No commands.md template found, skipping');
  }

  // 7. Write manifest
  const manifest = createManifest(version);
  manifest.symlinks = allSymlinks;
  manifest.merged_blocks = [
    { file: 'CLAUDE.md', block: 'CORE' },
    { file: '.claude/commands.md', block: 'COMMANDS' },
  ];
  await writeManifest(projectRoot, manifest);
  console.log('\nWrote manifest file.');

  console.log(`
Automatasaurus initialized successfully!

Next steps:
  1. Review CLAUDE.md for framework documentation
  2. Update .claude/commands.md with your project-specific commands
  3. Start using /discovery, /work, or /work-all commands

Run "automatasaurus status" to see installation details.
`);
}
