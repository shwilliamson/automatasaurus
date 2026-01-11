import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { readManifest, writeManifest, createManifest } from '../lib/manifest.js';

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

  const allDirs = [...SUBDIR_SYMLINK_DIRS, ...FILE_SYMLINK_DIRS];
  for (const dir of allDirs) {
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

  // 2. Create .codex directory
  await mkdir(paths.codex, { recursive: true });

  // 3. Create symlinks from .codex to .automatasaurus
  console.log('\nCreating symlinks in .codex/...');
  const allSymlinks = [];

  // Subdirectory-level symlinks (agents, skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.codex, dir);
    try {
      const created = await symlinkSubdirectories(sourceDir, targetDir);
      for (const subdir of created) {
        const symlinkPath = `${dir}/${subdir}`;
        allSymlinks.push(symlinkPath);
        console.log(`  Linked ${symlinkPath}/`);
      }
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
        const symlinkPath = `${dir}/${file}`;
        allSymlinks.push(symlinkPath);
        console.log(`  Linked ${symlinkPath}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  // 4. Block-merge AGENTS.md
  console.log('\nMerging AGENTS.md...');
  const agentsTemplate = join(templateDir, 'AGENTS.block.md');
  try {
    const blockContent = await readFile(agentsTemplate, 'utf-8');
    const result = await mergeBlockIntoFile(paths.agentsMd, 'CORE', blockContent);
    console.log(`  ${result.created ? 'Created' : 'Updated'} AGENTS.md`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No AGENTS.md template found, skipping');
  }

  // 5. Block-merge commands.md
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

  // 6. Write manifest
  const manifest = createManifest(version);
  manifest.symlinks = allSymlinks;
  manifest.merged_blocks = [
    { file: 'AGENTS.md', block: 'CORE' },
    { file: '.codex/commands.md', block: 'COMMANDS' },
  ];
  await writeManifest(projectRoot, manifest);
  console.log('\nWrote manifest file.');

  console.log(`
Automatasaurus initialized successfully!

Next steps:
  1. Review AGENTS.md for framework documentation
  2. Update .codex/commands.md with your project-specific commands
  3. Run playbooks (discovery, work, work-all) from Codex using the provided prompts

Run "automatasaurus status" to see installation details.
`);
}
