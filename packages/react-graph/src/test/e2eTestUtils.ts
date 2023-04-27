import type {Page} from 'playwright'
import playwright from "playwright";
import {first, map, Observable, of, switchMap, tap} from "rxjs";

import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import * as url from "url";


const absPath = (filename: string = '.') => url.fileURLToPath(new URL(filename, import.meta.url))



export const newBrowser = () => new Observable<Page>(observer => {
    let openPage: Page;
    const sub = of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: !!process.env.CI, devtools: true})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        switchMap(page => page.goto('http://localhost:1234').then(() => page)),
        tap(page => openPage = page),
        tap(page => observer.next(page))
    ).subscribe()

    return () => {
        sub.unsubscribe();
        openPage.context().browser()?.close();
    }
})

export const compileBrowserTestCode = (src: string) => new Observable(subscriber => {
    let server: WebpackDevServer;
    of({}).pipe(
        map(() => new WebpackDevServer({
            static: {
                directory: absPath(),
            },
            port: 1234,
        }, Webpack({
            target: 'web',
            mode: 'development',
            entry: {
                'index': absPath(`../${src}`)
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                                configFile: absPath('tsconfig.e2e.json')
                            }
                        },
                        exclude: /node_modules/,
                    }
                ],

            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.jsx'],
                extensionAlias: {
                    '.jsx': ['.tsx', '.jsx'],
                    '.js': ['.ts', '.js']
                },
            }

        }))),
        tap(s => server = s),
        switchMap(server => server.start()),
        tap(() => subscriber.next(undefined)),
        first()
    ).subscribe();

    return () => {
        return server.stop()
    }
});



