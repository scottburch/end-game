#!/usr/bin/env node
import { Command } from 'commander';
import { devCmd } from "./dev.js";
import { buildCmd } from "./build.js";
const program = new Command();
program
    .command('dev')
    .action(() => devCmd());
program
    .command('build')
    .action(() => buildCmd());
program.parse();
//# sourceMappingURL=index.js.map