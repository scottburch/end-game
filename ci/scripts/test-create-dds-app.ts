import {$, cd} from 'zx'
import {delay, from, map, merge, of, tap} from "rxjs";

of($`yarn create dds-app mine`).pipe(
    map(p => p.then(() => cd('mine'))),
    tap(p => p.then(() => $`yarn start`)),
    delay(3000),
    map(p => p.then(() => $`yarn test`)),
    tap(p => p.then(() => process.exit()))
).subscribe()

