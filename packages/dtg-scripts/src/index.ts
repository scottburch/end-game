#!/usr/bin/env node
import {Command} from 'commander';
import {devCmd} from "./dev.js";
const program = new Command();

program
    .command('dev')
    .action(() => devCmd())

program.parse()