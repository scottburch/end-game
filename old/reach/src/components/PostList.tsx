import {getPistol, pistolKeys} from "@scottburch/pistol";
import {List} from "antd";
import {Post} from "./Post.js";
import {useEffect, useRef, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {from, Subscription, tap} from "rxjs";

export const PostList: React.FC<{ base: string }> = ({base}) => {
    const [keys, setKeys] = useState<string[]>([])
    const hasMore = useRef(true)
    const sub = useRef<Subscription | null>(null)

    const loadNext = (keys: string[]) => {
        sub.current?.unsubscribe();
        sub.current = from(pistolKeys(getPistol(), base, {
            reverse: true,
            lt: keys.length ? keys[keys.length - 1] : 'z',
            limit: 10
        })).pipe(
            tap(({keys}) => keys.length === 10 ? hasMore.current = true : hasMore.current = false),
            tap(({keys: newKeys}) => setKeys([...keys, ...newKeys]))
        ).subscribe()
    };

    useEffect(() => sub.current?.unsubscribe(), []);
    useEffect(() => loadNext([]), []);

    return (
        <InfiniteScroll
            next={() => loadNext(keys)}
            hasMore={hasMore.current}
            loader={'Loading...'}
            dataLength={keys.length}
        >
            <List bordered={true}>
                {keys.map(timestamp =>
                    <List.Item key={timestamp}>
                        <Post timestamp={timestamp}/>
                    </List.Item>
                )}
            </List>
        </InfiniteScroll>
    )
};