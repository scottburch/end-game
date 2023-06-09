
import {resolve} from 'node:path'
import {map, of, switchMap} from "rxjs";
import WebpackDevServer from 'webpack-dev-server'
import Webpack from 'webpack'

export const devCmd = (opts: {headless: boolean, port: number}) => {
    of({}).pipe(
        map(() => new WebpackDevServer({
            static: {
                directory: resolve('./public')
            },
            historyApiFallback: {index: 'index.html'},   // Here to make it a single-page-app
            port: opts.port || 1234,
            open: !opts.headless,
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
                    },
                    {
                        test: /\.css$/i,
                        use: ['style-loader', 'css-loader'],
                    },
                    {
                        test: /\.(png|svg|jpg|jpeg|gif)$/i,
                        type: 'asset/resource',
                    },
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
