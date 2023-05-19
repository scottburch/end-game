import type {Graph, GraphHandler} from "@end-game/graph";
import {LogLevel} from "@end-game/graph";
import {of, tap} from "rxjs";
import {appendHandler} from "@end-game/rxjs-chain";

export const consoleLoggerHandlers = (graph: Graph, level: LogLevel = LogLevel.INFO) => of(graph).pipe(
    tap(graph => appendHandler(graph.chains.log,  'console-log', logHandler(level)))
);


const logHandler = (level: LogLevel): GraphHandler<'log'> => ({graph, item}) =>
    of({graph, item}).pipe(
        tap(({item}) => item.level <= level && console.log(item))
    )

