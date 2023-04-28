import {$, cd, fs} from 'zx'
import {firstValueFrom, of, switchMap, tap} from "rxjs";


export const createAppCmd = (dest: string) => {
    console.log('create app', dest);
}


function doIt(dest: string) {
    return firstValueFrom(of(dest).pipe(
        switchMap(dest => $`git clone https://github.com/scottburch/dds-typescript-template.git ${dest}`),
        tap(() => cd(dest)),
        switchMap(() => fs.rm('.git', {force: true, recursive: true})),
        switchMap(() => $`yarn`),
        tap(() => console.log('\n\n')),
        tap(() => console.log(`You have successfully created a template for ${dest}`)),
        tap(() => console.log('Next steps\n----------')),
        tap(() => console.log(`type "cd ${dest}"`)),
        tap(() => console.log(`type "yarn start" to start the development environment`)),
        tap(() => console.log('[optional] type "yarn testnet" to start a two node testnet to use for development')),
    ))
}
