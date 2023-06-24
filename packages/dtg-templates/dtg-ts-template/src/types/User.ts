import {NodeId} from "@end-game/graph";

export type User = {
    display: string
    nickname: string
    aboutMe: string
    ownerId: NodeId
};