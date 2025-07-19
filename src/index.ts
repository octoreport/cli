#!/usr/bin/env node
import { registerAllCommand } from './commands';
import { createCommander } from './setup';

const program = createCommander();

registerAllCommand(program);

program.parseAsync();
