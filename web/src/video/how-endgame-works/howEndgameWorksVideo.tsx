import React from 'react'
import {delay, last, repeat, switchMap} from "rxjs";
import {svg} from "./howEndgameWorksSvg.js";
import {playSvg} from "../player/play.js";
import {videoPart, SvgVideoPlayer} from "../player/SvgVideoPlayer.jsx";
import {svgJS} from './howEndgameWorksJS.js'

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

const howDataIsRetrievedPart = videoPart('',
    playSvg('start', 'whoHasAlice').pipe(
        delay(1000),
        switchMap(() => playSvg('', 'iDo1')),
        delay(1000),
        switchMap(() => playSvg('', 'sendAlice')),
        delay(1000),
        switchMap(() => playSvg('', 'sendAliceEnd')),
        delay(1000),
        switchMap(() => playSvg('', 'whoHasAlice2')),
        delay(1000),
        switchMap(() => playSvg('', 'iDo2')),
        delay(1000),
        switchMap(() => playSvg('', 'whoHasBob')),
        delay(1000),
        switchMap(() => playSvg('', 'whoHasBob2')),
        delay(1000),
        switchMap(() => playSvg('', 'iDo3'))
    )
)

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




