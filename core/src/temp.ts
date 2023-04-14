import inspector from "node:inspector";
import {startTestNetwork} from "./test/testUtils.js";
import {interval, switchMap, tap} from "rxjs";
import {pistolPut} from "./graph/pistolGraph.js";
import {graphPut} from "./graph/graph.js";


inspector.open();

startTestNetwork([[]]).pipe(
    switchMap(pistols => interval(20).pipe(
        switchMap(n => graphPut(pistols[0].store, 'my-key', n, {}))
//        switchMap(n => pistolPut(pistols[0], 'my-key', n)),
    ))
).subscribe();
