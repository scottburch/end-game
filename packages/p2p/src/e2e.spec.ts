import {addThingNode, startTestNet} from "@end-game/test-utils";
import {delay, filter, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {nodesByLabel} from "@end-game/graph";


// TODO: this test points out that we need more edge tests when it comes to auth stuff

describe('end-to-end testing', () => {
    it('should handle basic auth and updating across peers', () =>
        firstValueFrom(startTestNet([[2],[2],[]]).pipe(
            switchMap(({node0, node1, node2}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => graphNewAuth(node1, 'todd', 'pass')),
                switchMap(() => graphAuth(node1, 'todd', 'pass')),
                switchMap(() => addThingNode(node0, 0)),
                switchMap(() => nodesByLabel(node1, 'thing')),
                map(({nodes}) => nodes),
                tap(nodes => console.log(nodes)),
                filter(nodes => !!nodes.length),
            ))
        ))
    )
});