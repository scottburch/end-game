import React, {useEffect} from 'react'
import {bufferCount, concatMap, delay, first, race, repeat, switchMap} from "rxjs";
import {svg} from "./introSvg.js";

import {svgJS} from "./introJS.js";
import {playSvg} from "../play.js";
import {speak} from "../speak.js";

export const IntroVideo: React.FC = () => {

    useEffect(svgJS, []);


    const serverToServerPart = () => race(
        speak(text.in_the_beginning),
        playSvg('serverToServerStart', 'serverToServerData').pipe(
            concatMap(() => playSvg('serverToServerData', 'serverToComputerStart').pipe(
                repeat()
            )),
            bufferCount(1000)
        )
    ).pipe(
        first()
    );

    const serverToPersonPart = () => race(
        speak(text.computerToPerson),
        playSvg('serverToComputerStart', 'serverToComputerData').pipe(
            concatMap(() => playSvg('serverToComputerData', 'serverToComputerDataEnd').pipe(
                repeat()
            )),
            bufferCount(1000)
        )
    )

    return (
        <>
            <div style={{height: 300, width: '100%', textAlign: 'center'}} dangerouslySetInnerHTML={{__html: svg()}}/>
            <button onClick={() => {
                serverToServerPart().pipe(
                    delay(500),
                    switchMap(() => serverToPersonPart()),
                    delay(500),



                ).subscribe();
            }}>Play</button>
        </>

    );
}

const text = {
    in_the_beginning: 'A brief history of the internet.  In the beginning, the internet was used for computer to computer communication',
    computerToPerson: 'Then came the Web with computer to person communication. For this model to continue, the owner of the content provider must continually create new content to be consumed.'

};



