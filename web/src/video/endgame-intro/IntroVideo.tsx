import React, {useEffect} from 'react'
import {bufferCount, concatMap, first, race, repeat} from "rxjs";
import {svg} from "./introSvg.js";

import {svgJS} from "./introJS.js";
import {playSvg} from "../play.js";
import {speak} from "../speak.js";

export const IntroVideo: React.FC = () => {

    useEffect(svgJS, []);


    const serverToServerPart = () => race(
        speak(text1),
        playSvg('serverToServerStart', 'serverToServerData').pipe(
            concatMap(() => playSvg('serverToServerData', 'serverToComputerStart').pipe(
                repeat()
            )),
            bufferCount(1000)
        )
    ).pipe(
        first()
    );

    return (
        <>
            <div style={{height: 300, width: '100%', textAlign: 'center'}} dangerouslySetInnerHTML={{__html: svg()}}/>
            <button onClick={() => {
                serverToServerPart().pipe(

                ).subscribe();
            }}>Play</button>
        </>

    );
}

const text1 = 'A brief history of the internet.  In the beginning, the internet was used for server-to-server communication'



