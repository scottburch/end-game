import React, {useEffect, useState} from "react";
import {delay, map, Observable, of, race, switchMap, tap} from "rxjs";
import {Button, Segmented} from "antd";
import {CaretRightOutlined, PauseOutlined} from "@ant-design/icons";
// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'
import {Speaker, speakerLoad, speakerPause, speakerPlay, speakerResume} from "./speak.js";


export type VideoSection = {
    label: string
    part: (speaker: Speaker) => Observable<unknown>
};

export const videoPart = (speaker: Speaker, file: string, videoCmds: Observable<unknown>) => () => race(
    of(speaker).pipe(
        switchMap(speaker => speakerLoad(speaker, file)),
        switchMap(speakerPlay)
    ),
    videoCmds
);


export const SvgVideoPlayer: React.FC<{speaker: Speaker, svg: string, sections: Array<VideoSection>, svgJS: () => void }> = ({speaker, svg, sections, svgJS}) => {
    const [state, setState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
    const [currentSection, setCurrentSection] = useState<VideoSection>()

    const Player = {
        play: () => {
            currentSection || setCurrentSection(findNextSection());
            of(speaker).pipe(
                switchMap(speakerResume)
            ).subscribe()
            KeyshapeJS.globalPlay();
        },
        pause: () => {
            of(speaker).pipe(
                switchMap(speakerPause)
            ).subscribe()
            KeyshapeJS.globalPause()
        },
        stop: () => {
            of(speaker).pipe(
                switchMap(speakerPause)
            ).subscribe()
            setCurrentSection(undefined);
        }
    } as const;

    const findSection = (label: string) =>
        sections.find(s => s.label === label);

    const findNextSection = () => {
        if (currentSection) {
            const idx = sections.findIndex(s => currentSection.label === s.label);
            return idx > -1 && sections[idx + 1] ? sections[idx + 1] : undefined
        } else {
            return sections[0];
        }
    }


    useEffect(() => {
        svgJS();
        return () => {
            of(speaker).pipe(
                switchMap(speakerPause)
            ).subscribe()
            KeyshapeJS.removeAll();
        };
    }, []);

    useEffect(() => {
        of(speaker).pipe(tap(speakerPause)).subscribe();
        currentSection?.part(speaker).pipe(
            delay(1000),
            map(() => findNextSection()),
            tap(nextSection => nextSection ? setCurrentSection(nextSection) : setState('stopped'))
        ).subscribe();
        state !== 'playing' && Player.pause();
    }, [currentSection])


    useEffect(() => {
        state === 'playing' && Player.play();
        state === 'paused' && Player.pause();
        state === 'stopped' && Player.stop();
    }, [state])


    const onBtnClick = () =>
        state === 'playing' ? setState('paused') : setState('playing');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            borderCollapse: 'collapse',
            width: '100%',
            height: '100%'
        }}>
            <div style={{flex: 1, textAlign: 'center', border: '1px solid black', borderCollapse: 'collapse'}}
                 dangerouslySetInnerHTML={{__html: svg}}/>
            <div style={{display: 'flex', border: '1px solid black'}}>
                <Button onClick={onBtnClick}>{state === 'playing' ? <PauseOutlined/> : <CaretRightOutlined/>}</Button>
                <div style={{flex: 1}}>
                    <Segmented
                        block
                        options={sections.map(section => section.label)}
                        value={currentSection?.label}
                        onChange={label => setCurrentSection(findSection(label as string))}
                    />
                </div>
            </div>
        </div>

    );
};


