import * as url from "url";

const absPath = (filename = '.') => url.fileURLToPath(new URL(filename, import.meta.url));

export default {
    experiments: {
        outputModule: true
    },
    target: 'es2020',
    mode: 'production',
    externals: [
        ({context, request, dependencyType, contextInfo}, cb) =>
            request.startsWith('.') ? cb() : cb(null, `module ${request}`)
    ],
    entry: {
        'index': './src/index.ts',
        'index-browser': './src/index-browser.ts'
    },
    output: {
        path: absPath('lib'),
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
};