import {resolve} from 'node:path'
import mime, {contentType} from 'mime-types'
import http from 'node:http'
import {map, of, switchMap, tap} from "rxjs";
import {readFile} from 'fs/promises'

export const serveCmd = ({port}: {port?: number} = {}) => {
    const server = http.createServer((request, response) => {
        of(request.url).pipe(
            map(url => url || ''),
            map(url => url.replace(/\?.*/, '')),
            map(url => url.replace(/#.*/, '')),
            map(url => /\./.test(url) ? url : '/index.html'),
            tap(url => response.writeHead(200, { "Content-Type": contentType(mime.lookup(url) || 'text/plain') || 'text/plain'})),
            switchMap(url => readFile(resolve('dist') + url)),
            tap(content => response.write(content)),
            tap(() => response.end())
        ).subscribe()
    });

    server.listen(port || 1234, () => {
        console.log(`Running at http://localhost:${port || 1234}`);
    });
};