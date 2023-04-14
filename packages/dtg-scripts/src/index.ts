#!/usr/bin/env node
import {Command} from 'commander';
import {devCmd} from "./dev.js";
import {buildCmd} from "./build.js";
import {serveCmd} from "./serve.js";
const program = new Command();

program
    .command('dev')
    .option('-h --headless', 'do not open a browser after build')
    .option('-p --port <port>', 'port to listen on')
    .action((opts) => devCmd(opts));

program
    .command('build')
    .action(() => buildCmd());

program
    .command('serve')
    .option('-p --port <port>', 'port to listen on')
    .action((opts) => serveCmd(opts));

program.parse();