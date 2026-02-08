import { symlink, unlink, readlink, mkdir, readdir, stat, access } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';

/**
 * Create a symlink, creating parent directories if needed
 */
export async function createSymlink(source, target) {
  // Ensure target directory exists
  await mkdir(dirname(target), { recursive: true });

  // Calculate relative path from target to source
  const relativePath = relative(dirname(target), source);

  // Remove existing symlink if present
  try {
    await unlink(target);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await symlink(relativePath, target);
}

/**
 * Check if a path is a symlink
 */
export async function isSymlink(path) {
  try {
    const stats = await stat(path, { throwIfNoEntry: false });
    if (!stats) return false;

    const lstats = await import('node:fs').then(fs =>
      fs.promises.lstat(path)
    );
    return lstats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Get all files in a directory recursively
 */
export async function getFilesRecursive(dir, baseDir = dir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        const subFiles = await getFilesRecursive(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return files;
}

/**
 * Create symlinks for all files from source directory to target directory
 */
export async function symlinkDirectory(sourceDir, targetDir, exclude = []) {
  const files = await getFilesRecursive(sourceDir);
  const created = [];

  for (const file of files) {
    if (exclude.some(pattern => file.includes(pattern))) {
      continue;
    }

    const source = join(sourceDir, file);
    const target = join(targetDir, file);

    await createSymlink(source, target);
    created.push(file);
  }

  return created;
}

/**
 * Create symlinks for each subdirectory in source to target.
 * For example, if sourceDir has subdirs 'foo' and 'bar', creates:
 *   targetDir/foo -> sourceDir/foo
 *   targetDir/bar -> sourceDir/bar
 *
 * Returns array of subdirectory names that were symlinked.
 */
export async function symlinkSubdirectories(sourceDir, targetDir) {
  // Ensure target directory exists
  await mkdir(targetDir, { recursive: true });

  const created = [];

  try {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const source = join(sourceDir, entry.name);
      const target = join(targetDir, entry.name);

      await createSymlink(source, target);
      created.push(entry.name);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return created;
}

/**
 * Create flat file symlinks for agent AGENT.md files.
 * For each agent subdirectory containing AGENT.md, creates:
 *   targetDir/{name}.md -> sourceDir/{name}/AGENT.md
 *
 * This enables Claude Code's flat-file agent discovery while
 * preserving subdirectory symlinks for PROJECT.md support.
 */
export async function symlinkAgentFiles(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });

  const created = [];

  try {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const agentMdPath = join(sourceDir, entry.name, 'AGENT.md');

      try {
        await access(agentMdPath);
      } catch {
        continue; // No AGENT.md in this subdirectory
      }

      const target = join(targetDir, `${entry.name}.md`);
      await createSymlink(agentMdPath, target);
      created.push(`${entry.name}.md`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return created;
}
