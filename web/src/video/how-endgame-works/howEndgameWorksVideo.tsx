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
    switchMap(videoPart('', playSvg('', 'iDo1'))),
    switchMap(videoPart('', playSvg('', 'sendAlice'))),
    switchMap(videoPart('', playSvg('', 'sendAliceEnd'))),
    switchMap(videoPart('', playSvg('', 'whoHasAlice2'))),
    switchMap(videoPart('', playSvg('', 'iDo2'))),
    switchMap(videoPart('', playSvg('', 'whoHasBob'))),
    switchMap(videoPart('', playSvg('', 'whoHasBob2'))),
    switchMap(videoPart('', playSvg('', 'iDo3'))),
    switchMap(videoPart('', playSvg('', 'sendBob'))),
    switchMap(videoPart('', playSvg('', 'sendBob2'))),
    switchMap(videoPart('', playSvg('', 'doSendBob'))),
    switchMap(videoPart('', playSvg('', 'end')))



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




