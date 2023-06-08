import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import React from 'react'

export const DateFromNow: React.FC<{date: Date}> = ({date}) => {
    return (
        <>
            {formatDistanceToNow(date, {addSuffix: true})}
        </>
    )
}