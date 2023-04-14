import {dialPeer, floodRouter, newFileStore, startPistol} from "@scottburch/pistol";
import {tap, combineLatest, switchMap} from 'rxjs'



combineLatest([
    startPistol({name: 'testnet-0', port: 11110, store: newFileStore('/testnet0')}).pipe(
        switchMap(floodRouter)
    ),
    // startPistol({name: 'testnet-1', port: 11111, store: newFileStore('/testnet1')}).pipe(
    //     switchMap(floodRouter)
    // )
]).pipe(
//    switchMap(pistols => dialPeer(pistols[0], 'ws://localhost:11111')),
    tap(() => console.log('testnet running'))
).subscribe()
