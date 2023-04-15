import {map, of, Subject, switchMap} from "rxjs";
import {ChainPair, ChainProps} from "../app/endgameConfig.js";
import {MemoryLevel} from "memory-level";
import {Endgame} from "../app/endgame.js";

const stores: Record<string, MemoryLevel> = {};

const getStore = (endgame: Endgame) => stores[endgame.id] = stores[endgame.id] || new MemoryLevel();

export const memoryStoreGetHandler = () => {
    const subject = new Subject<ChainProps<'get'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({endgame, path}) => of(getStore(endgame)).pipe(
            switchMap(store => store.get(path)),
            map(value => ({endgame, path, value: JSON.parse(value).d}))
        ))
    ) as unknown as ChainPair<ChainProps<'get'>>;

    observer.next = (v: ChainProps<'get'>) => subject.next(v);
    return observer
};

export const memoryStorePutHandler = () => {
    const subject = new Subject<ChainProps<'put'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({endgame, path, value, meta}) => of(getStore(endgame)).pipe(
            switchMap(store => store.put(path, JSON.stringify({d: value, m: meta}))),
            map(() => ({endgame, value, path, meta}))
        ))
    ) as unknown as ChainPair<ChainProps<'put'>>;

    observer.next = (v: ChainProps<'put'>) => subject.next(v);
    return observer
};
