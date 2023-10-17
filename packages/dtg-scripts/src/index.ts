#!/usr/bin/env node
import {Command} from 'commander';
import {buildCmd} from "./build.js";
import {serveCmd} from "./serve.js";
import {firstValueFrom, from, map, Observable, of, switchMap} from "rxjs";
import Webpack from "webpack";
import * as process from "process";
import {devCmd} from "./dev.js";
const program = new Command();

export type WebpackMixinFn = (config: Webpack.Configuration) => Webpack.Configuration;

const getWebpackConfigMixin = (filename: string): Observable<WebpackMixinFn> =>
    from(import(`${process.cwd()}/${filename}`)).pipe(
        map(x => x.default)
    );


program
    .command('dev')
    .option('-h --headless', 'do not open a browser after build')
    .option('-p --port <port>', 'port to listen on')
    .option('-m --mixin <jsFile>', 'webpack config mixin function')
    .action(opts =>
        firstValueFrom(of(opts).pipe(
            switchMap(opts => opts.mixin ? getWebpackConfigMixin(opts.mixin).pipe(
                map(mixin => ({...opts, mixin}))
            ) : of(opts)),
            switchMap(opts => devCmd(opts))
        ))
    );

program
    .command('build')
    .option('-m --mixin <tsFile>', 'webpack config mixin function')
    .action(opts => firstValueFrom(of(opts).pipe(
        switchMap(opts => opts.mixin ? getWebpackConfigMixin(opts.mixin).pipe(
            map(mixin => ({...opts, mixin}))
        ) : of(opts)),
        switchMap(opts => buildCmd(opts))
    )));


program
    .command('serve')
    .option('-p --port <port>', 'port to listen on')
    .action((opts) => serveCmd(opts));

program.parse();