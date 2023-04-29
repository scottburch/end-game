import { $, cd, fs } from 'zx';
import { from, map, switchMap, tap } from "rxjs";
import { mkdir } from "fs/promises";
import * as tar from "tar";
import { absPath } from "@end-game/utils";
export const createAppCmd = (dest) => {
    untarTemplate(dest).pipe(tap(() => cd(dest)), switchMap(() => $ `yarn`), tap(() => console.log('\n\n')), tap(() => console.log(`You have successfully created a template for ${dest}`)), tap(() => console.log('Next steps\n----------')), tap(() => console.log(`type "cd ${dest}"`)), tap(() => console.log(`type "yarn dev" to start the development environment`))).subscribe();
};
const untarTemplate = (dest) => from(mkdir(dest)).pipe(map(() => ({
    opts: {
        cwd: dest
    },
})), tap(({ opts }) => {
    fs.createReadStream(absPath(import.meta.url, '../templates/dtg-ts-template.tgz')).pipe(tar.x(opts));
}));
