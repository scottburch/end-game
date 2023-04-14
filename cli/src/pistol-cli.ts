#!/usr/bin/env node
import {Command} from 'commander'
import {dialPeer, newPistol, pistolTrafficLogger, pistolRead, Pistol, floodRouter} from 'projects/pistol/core/src/index-browser.js'
import {switchMap, tap, map, from, mergeMap, of} from 'rxjs'
import * as inspector from "inspector";


const base = new Command();

base
    .name(process.argv[1].replace(/.*\//, ''))
    .option('--inspect', 'turn on NodeJS inspector')
    .description('CLI for Pistol DDS')

base
    .command('read')
    .description('read a value in pistol')
    .argument('<path>', 'path to listen to values')
    .option('--peer <peer>', 'peer to dial')
    .option('--port <port>', 'port for node to listen on')
    .option('--forward', 'forward data using a flood router')
    .option('--trusted', 'if this node is trusted')
    .action((path, opts) => {
        console.log(opts);
        newPistol({port: opts.port || 11110, isTrusted: opts.trusted}).pipe(
            switchMap(pistol => opts.forward ? floodRouter(pistol) : of(pistol)),
            tap(() => console.log('Dialing peer...', opts.peer)),
            switchMap(pistol => dialPeers(pistol, [opts.peer])),
            tap(() => console.log('Peer dialed!')),
            switchMap(pistol => pistolRead(pistol, path)),
            tap(({value}) => console.log(value))
        ).subscribe()
    })

base
    .command('listen')
    .description('Listen for network traffic')
    .argument('<peer>', 'peer to dial')
    .action((peer) => {
        newPistol().pipe(
            tap(() => console.log('Dialing peer...', peer)),
            switchMap(pistol => dialPeers(pistol, [peer])),
            tap(() => console.log('Peer dialed!')),
            switchMap(pistol => pistolTrafficLogger(pistol))
        ).subscribe()
    })

base
    .command('start')
    .description('start a node')
    .option('--port <port>', 'port to listen on for peers (default 11110)')
    .option('--peers <peers>', 'A comma separated list of peers')
    .option('--forward', 'forward data using a flood router')
    .option('--trusted', 'is this a trusted node')
    .action((opts) => {
        console.log(opts)
        base.optsWithGlobals().inspect && inspector.open();
        newPistol({isTrusted: opts.trusted, port: opts.port || 11110}).pipe(
            switchMap(pistol => opts.forward ? floodRouter(pistol) : of(pistol)),
            tap(pistol => console.log(`Pistol running... (port:${pistol.port})`)),
            map(pistol => ({pistol})),
            map(ctx => ({...ctx, peers: getPeers()})),
            switchMap(({pistol, peers}) => dialPeers(pistol, peers))
        ).subscribe()

        function getPeers() {
            return (opts.peers ? opts.peers.split(',') : []) as string[];
        }
    })

const dialPeers = (pistol: Pistol, peers: string[]) =>
    from(peers).pipe(
        tap(peer => console.log('Dialing peer: ', peer)),
        mergeMap(peer => dialPeer(pistol, peer).pipe(map(() => peer))),
        tap(peer => console.log('Peer dialed: ', peer)),
        map(() => pistol)
    )


base.parse(process.argv);


