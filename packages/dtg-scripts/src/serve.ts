import {resolve} from 'node:path'
import handler from 'serve-handler'
import http from 'node:http'

export const serveCmd = ({port}: {port?: number} = {}) => {
    const server = http.createServer((request, response) => {
        return handler(request, response, {
            public: resolve('dist')
        });
    });

    server.listen(port || 1234, () => {
        console.log(`Running at http://localhost:${port || 1234}`);
    });
};