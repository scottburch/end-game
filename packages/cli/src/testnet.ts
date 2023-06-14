import {startTestNet} from "@end-game/test-utils";
import {delay, filter, map, merge, of, switchMap, tap} from "rxjs";
import {Graph, LogLevel} from "@end-game/graph";

type TestnetOpts = {
    log: string
}

const logLevels = Object.values(LogLevel);

export const testnet = ({log}: TestnetOpts) =>
    startTestNet([[1], []]).pipe(
        tap(() => console.log('testnet started...')),
        switchMap(peers => !!log ? logger(log, Object.values(peers)) : of(undefined)),
        map(() => {}),
        delay(Math.pow(2, 24))
    );

        const logger = (level: string, peers: Graph[]) =>
        merge(
            peers[0].chains.log,
            peers[1].chains.log
        ).pipe(
            filter(({item}) => item.level <= logLevels.indexOf(level.toUpperCase())),
            tap(({item}) => console.log(logLevels[item.level], item.code, item.text)),
        )
