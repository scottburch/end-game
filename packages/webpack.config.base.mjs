import {absPath} from "@end-game/utils/absPath";

export const webpackBase = (importUrl, config = {}) => ({
    experiments: {
        outputModule: true
    },
    target: 'es2020',
    mode: 'development',
    devtool: 'source-map',
    externals: [
        // Don't include externally loaded modules in output bundle
        ({context, request, dependencyType, contextInfo}, cb) =>
            request.startsWith('.') ? cb() : cb(null, `module ${request}`)
    ],
    entry: {
        'index': './src/index.ts'
    },
    output: {
        path: absPath(importUrl, 'lib'),
        filename: '[name].js',
        libraryTarget: 'module',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true,
                    }
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
            '.mjs': ['.mts', '.mjs'],
        }
    },
    ...config
});