import React, {useState} from 'react'
import {Menu, MenuProps} from "antd";
import {EmbeddedVideoPlayer} from "../video/player/EmbeddedVideoPlayer.jsx";

export const Videos: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState('teaser');

    const selectVideo: MenuProps['onSelect'] = (v) => setSelectedVideo(v.key);

    const videos: Record<string, JSX.Element> = {
        'teaser': <EmbeddedVideoPlayer id={'v3gji4e'}/>,
        'intro': <EmbeddedVideoPlayer id={'v3idbrk'}/>,
        'starterKitInstall': <EmbeddedVideoPlayer id="v3ikvob"/>
    }

    return (
        <div style={{display: 'flex', width: 700, height: 337}}>
            <Menu items={getVideoItems()} onSelect={selectVideo} selectedKeys={[selectedVideo]}/>
            {videos[selectedVideo]}
        </div>
    )
};

export const getVideoItems = (): MenuProps['items'] => [{
        key: 'teaser',
        label: 'Endgame Teaser',
    },{
        key: 'intro',
        label: 'Endgame Introduction'
    }, {
        key: 'starterKitInstall',
        label: 'Starter Kit Install'
    }];