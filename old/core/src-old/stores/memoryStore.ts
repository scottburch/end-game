import {GraphStore} from "../graph/graph";
import {MemoryLevel} from "memory-level";


export const newMemoryStore = (): GraphStore => ({
    db: new MemoryLevel<string, any>({valueEncoding: 'json'})
});



