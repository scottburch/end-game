import {IntroVideo} from "../video/endgame-intro/IntroVideo.jsx";
import React, {useState} from 'react'
import {Menu, MenuProps} from "antd";
import {EmbeddedVideoPlayer} from "../video/player/EmbeddedVideoPlayer.jsx";

export const Videos: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState('intro');

    const selectVideo: MenuProps['onSelect'] = (v) => setSelectedVideo(v.key);

    const videos: Record<string, JSX.Element> = {
        'intro': <IntroVideo/>,
        'getting-started': <EmbeddedVideoPlayer id={'v2qd6d0'}/>
    }

    return (
        <div style={{display: 'flex', width: 700}}>
            <Menu items={getVideoItems()} onSelect={selectVideo} selectedKeys={[selectedVideo]}/>
            {videos[selectedVideo]}
        </div>
    )
};

export const getVideoItems = (): MenuProps['items'] => [
    {
        key: 'intro',
        label: 'Endgame DTG Introduction',
    },
    {
        key: 'getting-started',
        label: 'Getting started'
    }
]