#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/commands/init.js';
import { update } from '../src/commands/update.js';
import { status } from '../src/commands/status.js';

const helpText = `
automatasaurus - Codex automation framework

Usage:
  automatasaurus <command> [options]

Commands:
  init      Install automatasaurus into current project
  update    Update framework files to latest version
  status    Show installation status and version info

Options:
  --help    Show this help message
  --force   Force overwrite of modified files (update only)

Examples:
  npx automatasaurus init
  npx automatasaurus update
  npx automatasaurus update --force
  npx automatasaurus status
`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: 'boolean', short: 'h' },
    force: { type: 'boolean', short: 'f' },
  },
});

const command = positionals[0];

if (values.help || !command) {
  console.log(helpText);
  process.exit(0);
}

const commands = {
  init,
  update,
  status,
};

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.log(helpText);
  process.exit(1);
}

try {
  await commands[command]({ force: values.force });
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
