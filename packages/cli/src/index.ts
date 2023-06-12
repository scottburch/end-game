#!/usr/bin/env node
import {Command} from 'commander';
import {createAppCmd} from "./create-app.js";
import {testnet} from "./testnet.js";
import {firstValueFrom} from "rxjs";
const program = new Command();

program
    .command('create-app')
    .description('Create a template for a dtg project')
    .argument('<dest>', 'destination for files')
    .action(createAppCmd)

program
    .command('testnet')
    .description('Start a 2 node testnet')
    .option('-l, --log <level>', 'log level (info, warning, error, debug)')
    .action(opts => firstValueFrom(testnet(opts)))

program.parse()