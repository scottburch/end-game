import React from 'react'

export const EmbeddedVideoPlayer: React.FC<{id: string}> = ({id}) => (
    <iframe src={`https://rumble.com/embed/${id}/?rel=tundn&autoplay=1`} style={{width: '100%', height: '100%'}}/>
);