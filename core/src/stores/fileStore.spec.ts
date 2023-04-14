import {runStoreTests} from "./storeTests.js";
import {newFileStore} from "./fileStore.js";
import {rm} from 'fs/promises'
import {map, of, switchMap} from "rxjs";

describe('file store', () => {
    runStoreTests(() =>
        of(`${process.cwd()}/pistol-db`).pipe(
            switchMap(path => rm(path, {recursive: true, force: true})),
            map(() =>  newFileStore('pistol-db'))
        )
    );
});