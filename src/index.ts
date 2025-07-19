#!/usr/bin/env node
import { createTableCommand, createTotalCommand } from './commands';
import { createCommander } from './setup';

const program = createCommander();

createTotalCommand(program);
createTableCommand(program);

program.parse();
