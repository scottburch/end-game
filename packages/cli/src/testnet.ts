import {startTestNet} from "@end-game/test-utils";
import {delay, filter, map, merge, of, switchMap, tap} from "rxjs";
import {LogLevel} from "@end-game/graph";
import {Host} from "@end-game/p2p";

type TestnetOpts = {
    log?: string
    graphs?: string,
    dir?: string
}

const logLevels = Object.values(LogLevel);

export const testnet = ({log, graphs, dir}: TestnetOpts) =>
    startTestNet([[1], []], {graphId: graphs?.split(',')[0], dir}).pipe(
        tap(() => console.log('testnet started...', `[graphs: ${graphs}, dir: ${dir}]`)),
        switchMap(hosts => !!log ? logger(log, Object.values(hosts)) : of(undefined)),
        map(() => {}),
        delay(Math.pow(2, 24))
    );

        const logger = (level: string, hosts: Host[]) =>
        merge(
            hosts[0].graphs[0].chains.log,
            hosts[1].graphs[0].chains.log
        ).pipe(
            filter(({item}) => item.level <= logLevels.indexOf(level.toUpperCase())),
            tap(({item}) => console.log(JSON.stringify(item))),
        );
