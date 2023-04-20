import {GraphStore} from "../graph/graph.js";
import {MemoryLevel} from "memory-level";


export const newMemoryStore = (): GraphStore => ({
    db: new MemoryLevel<string, any>({valueEncoding: 'json'})
});



