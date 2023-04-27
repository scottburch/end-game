const path = require('path');

module.exports = {
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
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
      libraryTarget: 'module',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
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
        fallback: {
            dgram: false,
            os: false,
            url: false,
            stream: false,
            crypto: false,
            tls: false,
            net: false,
            http: false,
            https: false,
            util: false,
            bufferutil: false,
            'utf-8-validate': false,
            zlib: false,
            'worker_threads': false,
            path: false,
            fs: false,

        }
    },
};