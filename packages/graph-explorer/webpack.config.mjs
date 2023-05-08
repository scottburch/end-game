import {absPath} from "@end-game/utils/absPath";

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
        'index': './src/index.tsx'
    },
    output: {
        path: absPath(import.meta.url,'lib'),
        filename: '[name].jsx',
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
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        extensionAlias: {
            '.jsx': ['.tsx', '.jsx'],
            '.js': ['.ts', '.js']
        },
    },
};