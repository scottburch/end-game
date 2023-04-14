import formatDistanceToNow from 'date-fns/formatDistanceToNow'

export const DateFromNow: React.FC<{date: Date}> = ({date}) => {
    return (
        <>
            {formatDistanceToNow(date, {addSuffix: true})}
        </>
    )
}