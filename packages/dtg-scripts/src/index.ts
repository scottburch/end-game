#!/usr/bin/env node
import {Command} from 'commander';
import {devCmd} from "./dev.js";
import {buildCmd} from "./build.js";
const program = new Command();

program
    .command('dev')
    .option('-h --headless', 'do not open a browser after build')
    .action((opts) => devCmd(opts));

program
    .command('build')
    .action(() => buildCmd());

program.parse();