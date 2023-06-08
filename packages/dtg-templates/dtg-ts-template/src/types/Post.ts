import {NodeId} from "@end-game/graph";


export type Post = {
    text: string
    timestamp: Date
    tags: string[]
    owner: NodeId
}