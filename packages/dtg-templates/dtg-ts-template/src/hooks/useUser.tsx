import {useAuth, useGraphs} from "@end-game/react-graph";
import {useEffect, useState} from "react";
import {User} from "../types/User.js";
import type {NodeId} from '@end-game/graph';
import {asNodeId, nodesByProp} from "@end-game/graph";
import {filter, map, tap} from "rxjs";

export const useUser = () => {
    const auth = useAuth();
    const [user, setUser] = useState<User & {nodeId: NodeId}>({display: '', nickname: '', aboutMe: '', ownerId: asNodeId(''), nodeId: asNodeId('')});
    const graph = useGraphs();

    useEffect(() => {
        auth.nodeId && nodesByProp<User>(graph.netGraph, 'user', 'ownerId', auth.nodeId).pipe(
            map(({nodes}) => nodes[0]),
            filter(node => !!node?.props),
            tap(node => setUser({...node.props, nodeId: node.nodeId}))
        ).subscribe()
    }, [auth]);

    return user;
}