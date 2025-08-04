#!/usr/bin/env node
import { registerAllCommand } from './commands/all';
import { registerLogoutCommand } from './commands/logout';
import { createCommander } from './config';

const program = createCommander();

registerAllCommand(program);
registerLogoutCommand(program);

program.parseAsync();
