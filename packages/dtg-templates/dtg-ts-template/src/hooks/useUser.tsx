import {useAuth, useGraphNodesByProp} from "@end-game/react-graph";
import {User} from "../types/User.js";

export const useUser = () => {
    const auth = useAuth();
    const nodes = useGraphNodesByProp<User>('user', 'ownerId', auth.nodeId);
    return nodes?.[0] ? {...nodes[0].props, nodeId: nodes[0].nodeId} : undefined
}