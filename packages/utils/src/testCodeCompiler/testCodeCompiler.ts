import {first, map, Observable, of, switchMap, tap} from "rxjs";

import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import {absPath} from "../absPath.js";


export const compileBrowserTestCode = (src: string) => new Observable(subscriber => {
    let server: WebpackDevServer;
    of({}).pipe(
        map(() => new WebpackDevServer({
            static: {
                directory: absPath(import.meta.url, '.'),
            },
            port: 1234,
        }, Webpack({
            target: 'web',
            mode: 'development',
            entry: {
                'index': src
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                                configFile: absPath(import.meta.url, 'tsconfig.e2e.json')
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



