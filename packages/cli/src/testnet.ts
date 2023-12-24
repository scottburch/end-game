import {startTestNet} from "@end-game/test-utils";
import {delay, filter, from, map, mergeMap, of, range, switchMap, tap, toArray} from "rxjs";
import {LogLevel} from "@end-game/graph";
import {Host} from "@end-game/p2p";

type TestnetOpts = {
    count: number
    log?: string
    graphs?: string,
    dir?: string
}

const logLevels = Object.values(LogLevel);

export const testnet = ({log, graphs, dir, count}: TestnetOpts) =>
    range(0, count).pipe(
        map(n => n === count - 1 ? [] : [n + 1]),
        toArray(),
        switchMap(nodesDef => startTestNet(nodesDef, {graphId: graphs?.split(',')[0], dir})),
        tap(() => console.log('testnet started...', `[graphs: ${graphs}, dir: ${dir}]`)),
        switchMap(hosts => !!log ? logger(log, Object.values(hosts)) : of(undefined)),
        map(() => {
        }),
        delay(Math.pow(2, 24))
    );

const logger = (level: string, hosts: Host[]) =>
    from(hosts).pipe(
        mergeMap(host => host.graphs[0].chains.log),
        filter(({item}) => item.level <= logLevels.indexOf(level.toUpperCase())),
        tap(({item}) => console.log(JSON.stringify(item))),
    );

