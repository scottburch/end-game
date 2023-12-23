import {resolve} from 'node:path'
import {map, of, switchMap} from "rxjs";
import WebpackDevServer from 'webpack-dev-server'
import Webpack from 'webpack'
import {WebpackMixinFn} from "./index.js";

export const devCmd = (opts: {headless: boolean, port: number, mixin: WebpackMixinFn}) =>
    of({
        target: 'web',
        mode: 'development',
        devtool: 'eval-cheap-source-map',
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
                    test: /\.(png|svg|jpg|jpeg|gif|mp3|mp4)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(html|txt|json)$/i,
                    type: 'asset/source'
                }
            ],

        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx'],
            extensionAlias: {
                '.jsx': ['.tsx', '.jsx'],
                '.js': ['.ts', '.js']
            },
        },
        plugins: [
            new Webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development'),
                'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
            })
        ],
    } satisfies Webpack.Configuration).pipe(
        map(config => opts.mixin?.(config) || config),
        map(config => new WebpackDevServer({
            static: {
                directory: resolve('./public')
            },
            historyApiFallback: {index: 'index.html'},   // Here to make it a single-page-app
            port: opts.port || 1234,
            open: !opts.headless,
            headers: {
                'Cache-Control': 'no-store',
            },
        }, Webpack(config))),
        switchMap(server => server.start()),
    );

