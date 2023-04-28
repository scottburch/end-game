import {runStoreTests} from "./storeTests";
import {newFileStore} from "./fileStore";
import {rm} from 'fs/promises'
import {map, of, switchMap} from "rxjs";

describe('file store', () => {
    runStoreTests(() =>
        of(`${process.cwd()}/endgame-db`).pipe(
            switchMap(path => rm(path, {recursive: true, force: true})),
            map(() =>  newFileStore('endgame-db'))
        )
    );
});