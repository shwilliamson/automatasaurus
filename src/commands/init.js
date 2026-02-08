import { mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTemplateDir, getProjectPaths, getVersion, SUBDIR_SYMLINK_DIRS, FILE_SYMLINK_DIRS } from '../lib/paths.js';
import { symlinkDirectory, symlinkSubdirectories, symlinkAgentFiles } from '../lib/symlinks.js';
import { mergeBlockIntoFile } from '../lib/block-merge.js';
import { mergeLayeredSettings, createLocalSettingsTemplate, mergeJsonFile } from '../lib/json-merge.js';
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

  // 2. Create .claude directory
  await mkdir(paths.claude, { recursive: true });

  // 3. Create symlinks from .claude to .automatasaurus
  console.log('\nCreating symlinks in .claude/...');
  const allSymlinks = [];

  // Subdirectory-level symlinks (agents, skills)
  for (const dir of SUBDIR_SYMLINK_DIRS) {
    const sourceDir = join(paths.automatasaurus, dir);
    const targetDir = join(paths.claude, dir);
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

  // Flat file symlinks for agents (enables Claude Code agent discovery)
  {
    const sourceDir = join(paths.automatasaurus, 'agents');
    const targetDir = join(paths.claude, 'agents');
    try {
      const created = await symlinkAgentFiles(sourceDir, targetDir);
      for (const file of created) {
        allSymlinks.push(`agents/${file}`);
        console.log(`  Linked agents/${file}`);
      }
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
        const symlinkPath = `${dir}/${file}`;
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

  // 5. Merge settings.json with layered config support
  console.log('\nMerging settings...');
  const settingsTemplate = join(templateDir, 'settings.json');
  try {
    const settingsContent = await readFile(settingsTemplate, 'utf-8');
    const frameworkSettings = JSON.parse(settingsContent);

    // Create settings.local.json template if it doesn't exist
    const localCreated = await createLocalSettingsTemplate(paths.settingsLocal);
    if (localCreated) {
      console.log('  Created settings.local.json (for your customizations)');
    }

    // Merge: framework defaults + user overrides -> settings.json
    const result = await mergeLayeredSettings(paths.settings, paths.settingsLocal, frameworkSettings);
    console.log(`  ${result.created ? 'Created' : 'Updated'} settings.json`);
    if (result.hasLocalOverrides) {
      console.log('  Applied overrides from settings.local.json');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No settings template found, skipping');
  }

  // 6. Merge MCP config
  console.log('\nMerging MCP config...');
  const mcpTemplate = join(templateDir, 'mcp.json');
  try {
    const mcpContent = await readFile(mcpTemplate, 'utf-8');
    const frameworkMcp = JSON.parse(mcpContent);
    const result = await mergeJsonFile(paths.mcp, frameworkMcp);
    console.log(`  ${result.created ? 'Created' : 'Updated'} .mcp.json`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('  No MCP template found, skipping');
  }

  // 7. Block-merge commands.md
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

  // 8. Write manifest
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
  3. Start using /auto-discovery, /auto-work-issue, or /auto-work-all commands

Run "npx automatasaurus status" to see installation details.
`);
}
