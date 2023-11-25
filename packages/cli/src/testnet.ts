import {startTestNet} from "@end-game/test-utils";
import {catchError, delay, filter, map, merge, of, switchMap, tap} from "rxjs";
import {LogLevel} from "@end-game/graph";
import {Host} from "@end-game/p2p";

type TestnetOpts = {
    log: string
    graphs: string,
    dir: string
}

const logLevels = Object.values(LogLevel);

export const testnet = ({log, graphs}: TestnetOpts) =>
    startTestNet([[1], []], {graphId: graphs.split(',')[0]}).pipe(
        tap(() => console.log('testnet started...', `[graphs: ${graphs}]`)),
        switchMap(hosts => !!log ? logger(log, Object.values(hosts)) : of(undefined)),
        map(() => {}),
        delay(Math.pow(2, 24)),
                   catchError(err => !!log ? logger(log, err.code) : of(undefined))
    );

        const logger = (level: string, hosts: Host[]) =>
        merge(
            hosts[0].graphs[0].chains.log,
            hosts[1].graphs[0].chains.log
        ).pipe(
            filter(({item}) => item.level <= logLevels.indexOf(level.toUpperCase())),
            tap(({item}) => console.log(logLevels[item.level], item.code, item.text)),
        )
