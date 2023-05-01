
import {resolve} from 'node:path'
import {map, of, switchMap} from "rxjs";
import WebpackDevServer from 'webpack-dev-server'
import Webpack from 'webpack'

export const devCmd = (opts: {headless: boolean}) => {
    console.log('*****', opts);
    of({}).pipe(
        map(() => new WebpackDevServer({
            static: {
                directory: resolve('./public'),
            },
            port: 1234,
            open: true,
            headers: {
                'Cache-Control': 'no-store',
            },
        }, Webpack({
            target: 'web',
            mode: 'development',
            entry: {
                'index': resolve('./src/index.tsx')
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                                configFile: resolve('./tsconfig.json')
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
    ).subscribe();
}
