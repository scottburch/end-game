import {resolve} from 'node:path'
import {Observable, of, switchMap, throwError} from "rxjs";
import type {Configuration} from 'webpack'
import Webpack from 'webpack'

export const buildCmd = () => {
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

    } satisfies Configuration).pipe(
        switchMap(config => new Observable(subscriber => {
            Webpack.webpack(config, err => err ? throwError(() => err) : subscriber.next())
        }))
    ).subscribe()
}
