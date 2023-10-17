import {resolve} from 'node:path'
import {map, Observable, of, switchMap, throwError} from "rxjs";
import type {Configuration} from 'webpack'
import Webpack from 'webpack'
import {fs} from 'zx'
import {WebpackMixinFn} from "./index.js";

export const buildCmd = (opts: {mixin?: WebpackMixinFn}) =>
    of({
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
                    test: /\.(png|svg|jpg|jpeg|gif|mp3|mp4)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(html|txt)$/i,
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
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
            })
        ],
    } satisfies Configuration).pipe(
        map(config => opts.mixin?.(config) || config),
        switchMap(config => new Observable(subscriber => {
            Webpack.webpack(config, err => err ? throwError(() => err) : subscriber.next())
        })),
        switchMap(() => fs.copy(resolve('public'), resolve('dist'), {}))
    );

