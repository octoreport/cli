#!/usr/bin/env node
import { registerAllCommand } from './commands/all';
import { registerLoginCommand, registerLogoutCommand } from './commands/auth';
import { createCommander } from './config';

const program = createCommander();

registerAllCommand(program);
registerLogoutCommand(program);
registerLoginCommand(program);

program.parseAsync();
