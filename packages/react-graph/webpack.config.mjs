import {absPath} from "@end-game/utils";

export default {
    experiments: {
        outputModule: true
    },
    target: 'es2020',
    mode: 'development',
    externals: [
        ({context, request, dependencyType, contextInfo}, cb) =>
            request.startsWith('.') ? cb() : cb(null, `module ${request}`)
    ],
    entry: {
        'index': './src/index.ts'
    },
    output: {
        path: absPath(import.meta.url, 'lib'),
        filename: '[name].js',
      libraryTarget: 'module',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true
                    }
                },
                exclude: /node_modules/,
            }
        ],

    },
    devServer: {
        static: {
            directory: './src/test',
        },
        compress: true,
        port: 1234,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        extensionAlias: {
            '.jsx': ['.tsx', '.jsx'],
            '.js': ['.ts', '.js']
        },
    },
};