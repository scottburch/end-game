
import {resolve} from 'node:path'
import {map, Observable, of, switchMap, tap} from "rxjs";

import {webpack, Configuration} from 'webpack'

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
        map(config => webpack(config)),
        switchMap(compiler => new Observable(subscriber =>
            compiler.compile(x => subscriber.next(x))
        )),
        tap(x => console.log(x))

    )
}
