import {
    graphOpen
} from './graph/graph.ts'
import {newUid} from "./utils/uid.ts";

graphOpen({graphId: newUid()}).subscribe(console.log);
