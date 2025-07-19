#!/usr/bin/env node
import { registerAllCommand } from './commands';
import { createCommander } from './config';

const program = createCommander();

registerAllCommand(program);

program.parseAsync();
