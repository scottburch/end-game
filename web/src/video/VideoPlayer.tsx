import React, {useEffect, useRef, useState} from "react";
import {svgJS} from "./endgame-intro/introJS.js";
import {concatMap, delay, from, last, Observable, race, switchMap, tap} from "rxjs";
import {Button, Segmented} from "antd";
import {CaretRightOutlined, PauseOutlined} from "@ant-design/icons";
// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'
import {getVoice, speak} from "./speak.js";


export type VideoSection = {
    label: string
    part: () => Observable<unknown>
};

export const videoPart = (audio: string, videoCmds: Observable<unknown>) => () => race(
    getVoice(audio).pipe(switchMap(speak)),
    videoCmds
);



export const VideoPlayer: React.FC<{ svg: string, sections: Array<VideoSection>}> = ({svg, sections}) => {
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
                from(sections).pipe(
                    concatMap(section => section.part().pipe(delay(1000))),
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
                        options={sections.map(section => section.label)}
                    />
                </div>
            </div>
        </div>

    );
}
