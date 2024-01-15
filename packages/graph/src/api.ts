import {
    getNodeInternal,
    type Graph,
    type GraphHandlerProps,
    type GraphHandlerPropsWithNodeType,
    type NodeId,
    type Props
} from "./graph.js";
import {first, interval, Observable, switchMap, tap} from "rxjs";

export const getNode = <T extends Props>(graph: Graph, nodeId: NodeId, opts: GraphHandlerProps<'getNode'>['opts']) =>
    new Observable<GraphHandlerPropsWithNodeType<'getNode', T>>(subscriber => {

    const getSub =  getNodeInternal<T>(graph, nodeId, opts).pipe(
        tap(response => subscriber.next(response))
    ).subscribe();


    const intervalSub = interval(Math.ceil(graph.settings.subscriptionTimeout * .8) * 1000).pipe(
        switchMap(() => getNodeInternal<T>(graph, nodeId, opts)),
        first()
    ).subscribe()

    return () => {
        intervalSub.unsubscribe();
        getSub.unsubscribe();
        subscriber.complete();
    }
});
