import React from 'react'

export const EmbeddedVideoPlayer: React.FC<{id: string}> = ({id}) => {
    return (
        <iframe src={`https://rumble.com/embed/${id}/?pub=tundn`} style={{width: '100%', height: '100%'}}/>
    )
}