import {firstValueFrom, last, mergeMap, of, range, switchMap, tap} from "rxjs";
import {addThingNode, getAGraph} from "@end-game/test-utils";
import {nodesByLabel} from "./graph.js";

describe('paging', () => {
    it('should allow paging for nodesByLabel', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => of(graph).pipe(
                switchMap(graph => range(1,15).pipe(
                    mergeMap(n => addThingNode(graph, n)),
                    last()
                )),
                switchMap(() => nodesByLabel(graph, 'thing', {limit: 5})),
                tap(({nodes}) => nodes)
            ))
        ))
    )
});