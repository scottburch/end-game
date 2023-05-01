import url from "node:url";

export const absPath = (filename = '.') => url.fileURLToPath(new URL(filename, import.meta.url));

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
        path: absPath('lib'),
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
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        extensionAlias: {
            '.jsx': ['.tsx', '.jsx'],
            '.js': ['.ts', '.js']
        },
    },
};