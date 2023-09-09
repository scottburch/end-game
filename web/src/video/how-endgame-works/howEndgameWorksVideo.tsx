import React from 'react'
import {delay, last, map, of, repeat, switchMap, timer} from "rxjs";
import {svg} from "./howEndgameWorksSvg.js";
import {playFile, playSvg} from "../player/play.js";
import {videoPart, SvgVideoPlayer} from "../player/SvgVideoPlayer.jsx";
import {svgJS} from './howEndgameWorksJS.js'
import {getSpeaker, speakerLoad, speakerPlay} from "../player/speak.js";

export const HowEndgameWorksVideo: React.FC = () => (
    <SvgVideoPlayer
        sections={[
            {label: 'how data is retrieved', part: howDataIsRetrievedPart},
            // {label: 'social', part: socialNetworkPart},
            // {label: 'endgame', part: endgamePart}
        ]}
        svg={svg()}
        svgJS={svgJS}
    />
);

/*
    Endgame is a peer-to-peer network for data sharing.  When a node requires some piece of data, it will ask
    the network for other nodes that have the data.
 */


const howDataIsRetrievedPart = () => of(undefined).pipe(
    // Endgame is a peer-to-peer network for data sharing.
    switchMap(videoPart('audio/how-endgame-works/intro.mp3', timer(5000))),
    // When a node requires some piece of data, it will ask the network for other nodes that have the data.
    switchMap(videoPart('audio/how-endgame-works/who-has-alice.mp3', playSvg('start', 'whoHasAlice').pipe(delay(5000)))),
    // Nodes that have the data will respond
    switchMap(videoPart('audio/how-endgame-works/i-do1.mp3', playSvg('', 'iDo1').pipe(delay(5000)))),
    // The requesting node will then choose a source node and request the data be sent, this eliminates duplicate data on the network
    switchMap(videoPart('audio/how-endgame-works/send-alice1.mp3', playSvg('', 'sendAlice').pipe(
        delay(1000),
        switchMap(() => playSvg('', 'sendAliceEnd')),
        delay(5000)
    ))),
    // As more data is requested, more nodes have the data providing reliability.
    switchMap(videoPart('audio/how-endgame-works/who-has-alice-2.mp3', playSvg('', 'whoHasAlice2').pipe(
        delay(1000),
        switchMap(() => playSvg('', 'iDo2')),
        delay(5000)
    ))),
    // When a node is not directly connected to the node with the data, intermediate nodes will act as relays
    // to deliver the requests to other nodes connected to the network.
    switchMap(videoPart('audio/how-endgame-works/get-bob.mp3', playSvg('', 'whoHasBob').pipe(
        delay(1000),
        switchMap(() => playSvg('', 'whoHasBob2')),
        delay(1000),
        switchMap(() => playSvg('', 'iDo3')),
        delay(1000),
        switchMap(() => playSvg('', 'sendBob')),
        delay(1000),
        switchMap(() => playSvg('', 'sendBob2')),
        delay(1000),
        switchMap(() => playSvg('', 'doSendBob')),
        delay(1000),
        switchMap(() => playSvg('', 'end')),
        delay(10000)
    ))),



);

const serverToServerPart = videoPart('/audio/endgame-intro/in_the_beginning.mp3',
    playSvg('serverToServerStart', 'serverToServerData').pipe(
        switchMap(() => playSvg('serverToServerData', 'serverToServerDataEnd')),
        delay(1000),
        switchMap(() => playSvg('', 'iDo1')),
        delay(1000),
        last()
    )
);

const serverToPersonPart = videoPart('/audio/endgame-intro/web.mp3',
    playSvg('serverToComputerStart', 'serverToComputerData').pipe(
        switchMap(() => playSvg('serverToComputerData', 'serverToComputerDataEnd').pipe(
            repeat()
        )),
        last()
    )
);

const socialNetworkPart = videoPart('/audio/endgame-intro/social-media.mp3',
    playSvg('socialNetworkStart', 'socialNetworkDataStart').pipe(
        switchMap(() => playSvg('socialNetworkDataStart', 'socialNetworkDataEnd').pipe(
            repeat()
        )),
        last()
    )
);

const endgamePart = videoPart('/audio/endgame-intro/endgame.mp3',
    playSvg('endgame', 'endgameEnd').pipe(
        repeat(),
        last()
    ));




