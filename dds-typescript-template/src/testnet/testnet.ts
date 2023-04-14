import {dialPeer, floodRouter, newMemoryStore, newPistol} from "@scottburch/pistol";
import {tap, combineLatest, switchMap} from 'rxjs'

combineLatest([
    newPistol({name: 'testnet-0', port: 11110, store: newMemoryStore()}).pipe(
        switchMap(floodRouter)
    ),
    newPistol({name: 'testnet-1', port: 11111, store: newMemoryStore()}).pipe(
        switchMap(floodRouter)
    )
]).pipe(
    switchMap(pistols => dialPeer(pistols[0], 'ws://localhost:11111')),
    tap(() => console.log('testnet running'))
).subscribe()
