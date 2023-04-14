import {filter, interval, map, Observable, of, Subscription, tap} from "rxjs";
import dgram from "dgram";
import ip from 'ip'
import {dialPeer} from "./networkClient.js";
import {Pistol} from "../app/pistol.js";


type MulticastPeerDiscoveryOpts = {
    redialInterval?: number
}

export const multicastPeerDiscovery = <P extends Pistol>(pistol: P, port: number, opts: MulticastPeerDiscoveryOpts = {}) => new Observable<P>(sub => {
    opts.redialInterval = opts.redialInterval || 30;

    const seenPeers = new Set<string>();

    sub.next(pistol);
    const socket = getSocket()

    socket.bind(port);

    let peerSub: Subscription;

    socket.on('message', buf => of(buf).pipe(
        map(buf => new TextDecoder().decode(buf)),
        map(json => JSON.parse(json)),


        // check to see if broadcast is mine
        filter(peerInfo =>
            peerInfo.nodeId !== pistol.id ||
            ip.address('public') !== peerInfo.ip ||
            pistol.config.port !== peerInfo.port
        ),

        // TODO: This should probably be smarter, just add to a list for now to check
        filter(({ip, port}) => !seenPeers.has(ip + port)),
        tap(({ip, port}) => seenPeers.add(ip + port)),

        tap(({ip, port}) => peerSub = dialPeer(pistol, `ws://${ip}:${port}`, {redialInterval: opts.redialInterval}).subscribe()),
    ).subscribe());


    const timerSub = interval(5000).pipe(
        tap(() => {
            socket.send(JSON.stringify({
                nodeId: pistol.id,
                ip: ip.address('public', ),
                port: pistol.config.port
            }), port,  '224.0.0.1')
        })
    ).subscribe()


    return () => {
        socket.close()
        timerSub.unsubscribe();
        peerSub && peerSub.unsubscribe();
    }
});


const getSocket = () =>
    dgram.createSocket({
        type: 'udp4',
        reuseAddr: true
    });

