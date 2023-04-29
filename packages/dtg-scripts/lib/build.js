import { resolve } from 'node:path';
import { map, Observable, of, switchMap, tap } from "rxjs";
import Webpack from 'webpack';
import { absPath } from "@end-game/utils";
export const buildCmd = () => {
    of({
        target: 'web',
        mode: 'production',
        entry: {
            'index.tsx': resolve('./src/index.tsx')
        },
        output: {
            path: absPath(import.meta.url, 'lib'),
            filename: '[name]',
            libraryTarget: 'umd'
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
    }).pipe(map(config => Webpack.webpack(config)), switchMap(compiler => new Observable(subscriber => compiler.compile(x => subscriber.next(x)))), tap(x => console.log(x))).subscribe();
};
//# sourceMappingURL=build.js.map