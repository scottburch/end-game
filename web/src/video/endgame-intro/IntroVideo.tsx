import React, {useEffect, useRef, useState} from 'react'
import {bufferCount, concatMap, delay, last, Observable, of, race, range, repeat, switchMap, tap} from "rxjs";
import {svg} from "./introSvg.js";

import {svgJS} from "./introJS.js";
import {playSvg} from "../play.js";
import {getVoice, speak} from "../speak.js";
import {Button, Segmented} from "antd";
import {CaretRightOutlined, PauseOutlined} from '@ant-design/icons'
// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'


export const IntroVideo: React.FC = () => {

    return <VideoPlayer
        sections={[
            serverToServerPart,
            serverToPersonPart,
            socialNetworkPart,
            endgamePart
        ]}
        svg={svg()}
    />
}

export const VideoPlayer: React.FC<{ svg: string, sections: Array<() => Observable<unknown>> }> = ({svg, sections}) => {
    const [playing, setPlaying] = useState(false);
    const started = useRef(false);

    useEffect(svgJS, []);

    const onBtnClick = () => {
        playing ? pause() : play();

        function pause() {
            setPlaying(false);
            window.speechSynthesis.pause();
            KeyshapeJS.globalPause();
        }

        function play() {
            setPlaying(true);
            if (started.current) {
                window.speechSynthesis.resume();
                KeyshapeJS.globalPlay();
            } else {
                started.current = true;
                range(0, sections.length).pipe(
                    concatMap(n => sections[n]().pipe(delay(1000))),
                    last(),
                    tap(() => started.current = false),
                    tap(() => setPlaying(false))
                ).subscribe()
            }
        }
    }

    return (
        <div style={{border: '1px solid black', borderCollapse: 'collapse'}}>
            <div style={{position: 'relative'}}>
                <div style={{
                    textAlign: 'center',
                    position: 'absolute',
                    display: !playing && !started.current ? 'block' : 'none',
                    height: '100%',
                    width: '100%',
                    border: '1px solid red'
                }}>
                    <div style={{paddingTop: 100}}>
                        <Button onClick={onBtnClick}>Play video</Button>
                    </div>
                </div>
                <div style={{height: 300, width: 'fit-content', textAlign: 'center', border: '1px solid black'}}
                     dangerouslySetInnerHTML={{__html: svg}}/>
            </div>
            <div style={{display: 'flex'}}>
                <Button onClick={onBtnClick}>{playing ? <PauseOutlined/> : <CaretRightOutlined/>}</Button>
                <div style={{flex: 1}}>
                    <Segmented
                        block
                        options={[
                            'Daily',
                            {label: 'Weekly', value: 'Weekly', disabled: true},
                            'Monthly',
                            {label: 'Quarterly', value: 'Quarterly', disabled: true},
                            'Yearly',
                        ]}
                    />
                </div>
            </div>
        </div>

    );
}


const serverToServerPart = () => race(
    getVoice(text.in_the_beginning).pipe(switchMap(speak)),
    playSvg('serverToServerStart', 'serverToServerData').pipe(
        concatMap(() => playSvg('serverToServerData', 'serverToServerDataEnd').pipe(
            repeat()
        )),
        bufferCount(1000)
    )
);

const serverToPersonPart = () => race(
    getVoice(text.computerToPerson).pipe(switchMap(speak)),
    playSvg('serverToComputerStart', 'serverToComputerData').pipe(
        concatMap(() => playSvg('serverToComputerData', 'serverToComputerDataEnd').pipe(
            repeat()
        )),
        bufferCount(1000)
    )
);

const socialNetworkPart = () => race(
    getVoice(text.serviceToPerson).pipe(switchMap(speak)),
    playSvg('socialNetworkStart', 'socialNetworkDataStart').pipe(
        concatMap(() => playSvg('socialNetworkDataStart', 'socialNetworkDataEnd').pipe(
            repeat()
        )),
        bufferCount(1000)
    )
);

const endgamePart = () => race(
    getVoice(text.endgame).pipe(switchMap(speak)),
    playSvg('endgame', 'endgameEnd').pipe(
        repeat(),
        bufferCount(1000)
    ))


const text = {
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
};


