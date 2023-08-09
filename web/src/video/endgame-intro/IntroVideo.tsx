import React from 'react'
import {last, repeat, switchMap} from "rxjs";
import {svg} from "./introSvg.js";
import {playSvg} from "../play.js";
import {videoPart, VideoPlayer} from "../VideoPlayer.jsx";


export const IntroVideo: React.FC = () => (
    <VideoPlayer
        sections={[
            {label: 'in the beginning', part: serverToServerPart},
            {label: 'web', part: serverToPersonPart},
            {label: 'social', part: socialNetworkPart},
            {label: 'endgame', part: endgamePart}
        ]}
        svg={svg()}
    />
);


const serverToServerPart = videoPart(text().in_the_beginning,
    playSvg('serverToServerStart', 'serverToServerData').pipe(
        switchMap(() => playSvg('serverToServerData', 'serverToServerDataEnd').pipe(
            repeat()
        )),
        last()
    )
);

const serverToPersonPart = videoPart(text().computerToPerson,
    playSvg('serverToComputerStart', 'serverToComputerData').pipe(
        switchMap(() => playSvg('serverToComputerData', 'serverToComputerDataEnd').pipe(
            repeat()
        )),
        last()
    )
);

const socialNetworkPart = videoPart(text().serviceToPerson,
    playSvg('socialNetworkStart', 'socialNetworkDataStart').pipe(
        switchMap(() => playSvg('socialNetworkDataStart', 'socialNetworkDataEnd').pipe(
            repeat()
        )),
        last()
    )
);

const endgamePart = videoPart(text().endgame,
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
        endgame: 'Now, you can!  Endgame is the first full-stack development platform to allow anyone to quickly ' +
            'and easily write applications with distributed data. ' +
            'data is shared and stored across the network by peers to ' +
            'ensure that data is available to peers on the network.  Using encryption, data is also secure. ' +
            'You, control who can see your data! '
    } as const;
}


