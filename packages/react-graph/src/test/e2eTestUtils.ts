import type {Page} from 'playwright'
import playwright from "playwright";
import {map, Observable, of, switchMap, tap} from "rxjs";
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


export const compileBrowserTestCode = (src: string) =>
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
        switchMap(server => server.start()),
        tap(x => x)
    );



// export const compileBrowserTestCode = (src: string) =>
//     of(`<div id="app"></div><script src="../${src}" type="module"></script>`).pipe(
//         switchMap(html => writeFile('src/test/test.html', html)),
//         map(() => ({
//             mode: 'development',
//             entries: 'src/test/test.html',
//             defaultConfig: '@parcel/config-default',
//             shouldDisableCache: true,
//             shouldAutoInstall: true,
//             serveOptions: {
//                 port: 1234
//             },
//         } satisfies InitialParcelOptions)),
//         map(config => new Parcel(config)),
//         switchMap(bundler => new Observable(sub => {
//             let bundlerSub: { unsubscribe: () => Promise<any> };
//             bundler.watch((err, result) => {
//                 if (err) {
//                     throw err
//                 }
//                 if (result?.type === 'buildSuccess') {
//                     sub.next(result)
//                 } else {
//                     console.error('BUILD_FAILURE', result?.diagnostics)
//                     throw result
//                 }
//             })
//                 .then(bs => bundlerSub = bs)
//             return () =>
//                 of(bundlerSub).pipe(
//                     switchMap(bundlerSub => bundlerSub.unsubscribe()),
//                 ).subscribe();
//         })));
//
//
