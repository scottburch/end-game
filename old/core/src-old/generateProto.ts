import {$} from 'zx'
import * as url from 'url';



export const generateProto = (filename: string) => {
    const tsProtoFile = url.fileURLToPath(new URL('.', import.meta.url)) + '/../node_modules/.bin/protoc-gen-ts_proto';
    const filepath = process.cwd();

    console.log('***** Generating proto');
    console.log('ts proto file', tsProtoFile);
    console.log('filepath', filepath);
    console.log('proto out', getProtoPath(filepath, filename));

    return $`yarn protoc --plugin=${tsProtoFile} --ts_proto_out=${getProtoPath(filepath, filename)} --ts_proto_opt=esModuleInterop=true ${filepath}/${filename} ${getOptions(filepath, filename)}`
}


const getOptions = (path: string, filename: string) => [
    `--proto_path`, getProtoPath(path, filename)
]

const getProtoPath = (path: string, filename: string) =>
    `${path}/${filename}`.replace(/(.*)\/.*/, '$1');

generateProto('src/message/p2pMessage.proto')