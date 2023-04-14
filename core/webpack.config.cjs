const path = require('path');

module.exports = {
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
        'index': './lib/index.js',
        'index-browser': './lib/index-browser.js',
        'test/e2e/browser/browser-functions': './lib/test/e2e/browser/browser-functions.js'
    },
    output: {
        path: path.resolve(__dirname, 'bundle/lib'),
        filename: '[name].js',
      libraryTarget: 'module',
    },
    resolve: {
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
            zlib: false
        }
    },
};