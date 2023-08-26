import React from 'react'
import {last, repeat, switchMap} from "rxjs";
import {svg} from "./howEndgameWorksSvg.js";
import {playSvg} from "../player/play.js";
import {videoPart, SvgVideoPlayer} from "../player/SvgVideoPlayer.jsx";
import {svgJS} from './howEndgameWorksJS.js'

export const HowEndgameWorksVideo: React.FC = () => (
    <SvgVideoPlayer
        sections={[
            {label: 'how data is retrieved', part: howDataIsRetrievedPart},
            // {label: 'web', part: serverToPersonPart},
            // {label: 'social', part: socialNetworkPart},
            // {label: 'endgame', part: endgamePart}
        ]}
        svg={svg()}
        svgJS={svgJS}
    />
);

const howDataIsRetrievedPart = videoPart('', playSvg('start', 'whoHasAlice'))

const serverToServerPart = videoPart('/audio/endgame-intro/in_the_beginning.mp3',
    playSvg('serverToServerStart', 'serverToServerData').pipe(
        switchMap(() => playSvg('serverToServerData', 'serverToServerDataEnd').pipe(
            repeat()
        )),
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
    ))

function text() {
    return {
        in_the_beginning: 'A brief history of the internet.  In the beginning, the internet was used for computer to ' +
            'computer communication',
        computerToPerson: 'Then came the Web, with computer-to-person communication. For this model to continue, the owner ' +
            'of the content provider must continually create new content to be consumed.  This is a very expensive and ' +
            'time-consuming prospect',
        serviceToPerson: 'To solve this problem, social networking was created.  This allowed providers to offload the ' +
            'creation of content to their users, guaranteeing a large amount of content, without the need to create it. ' +
            'This also allows a small group of people to decide what, and with whom, your content can be shared. ' +
            'This means that Social networking companies own and control your data, you, do not! ',
        endgame: '<speak>\n' +
            '<emphasis level="strong"><prosody pitch="+5%">now</prosody></emphasis>, you can!  Endgame is the first full-stack development platform to allow anyone to quickly \n' +
            '            and easily write applications with distributed data. \n' +
            '            data is shared and stored across the network by peers to\n' +
            '            ensure that it is available to everyone on the network.  Using encryption, data is also secure. \n' +
            '          <prosody pitch="+5%">only<prosody rate="130%"><prosody pitch="+10%"> you</prosody></prosody></prosody>, control who can see your data! \n' +
            ' </speak>'
    } as const;
}


