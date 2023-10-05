import React, {useState} from 'react'
import {Menu, MenuProps} from "antd";
import {EmbeddedVideoPlayer} from "../video/player/EmbeddedVideoPlayer.jsx";

export const Videos: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState('teaser');

    const selectVideo: MenuProps['onSelect'] = (v) => setSelectedVideo(v.key);


    return (
        <div style={{display: 'flex', width: 700, height: 337}}>
            <Menu items={Object.values(getVideoItems())} onSelect={selectVideo} selectedKeys={[selectedVideo]}/>
            {<EmbeddedVideoPlayer id={getRumbleId(selectedVideo)}/>}
        </div>
    )
};


export const getRumbleId = (k: string) => getVideoItems().find(({key}) => k === key)?.rumbleId || '';

export const getVideoItems = (): ((MenuProps['items'] extends (infer U)[] | undefined ? U : never) & {
    rumbleId: string
})[] => [{
    key: 'teaser',
    label: 'Endgame Teaser',
    rumbleId: 'v3gji4e',
}, {
    key: 'intro',
    label: 'Endgame Introduction',
    rumbleId: 'v3idbrk'
}, {
    key: 'starterKitInstall',
    label: 'Starter Kit Install',
    rumbleId: 'v3ikvob'
}, {
    key: 'demoBasic',
    label: 'Demo App - Basic Features',
    rumbleId: "v3iwjzi"
}, {
    key: 'demoNetwork',
    label: 'Demo App - Network Features',
    rumbleId: "v3j45fq"
}, {
    key: 'security',
    label: 'Endgame Security',
    rumbleId: "v3jykp5"
}, {
    key: 'architecture1',
    label: 'Endgame Architecture 1',
    rumbleId: 'v3kkgif'
}];