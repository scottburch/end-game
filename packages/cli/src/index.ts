#!/usr/bin/env node
import {Command} from 'commander';
import {createAppCmd} from "./create-app.js";
const program = new Command();

program
    .command('create-app')
    .description('Create a template for a dtg project')
    .argument('<dest>', 'destination for files')
    .action(dest => createAppCmd(dest))

program.parse()