import {GraphStore} from "../graph/graph";
import {Level} from "level";

export const newFileStore = (name: string): GraphStore => ({
    db: new Level<string, any>(name, { valueEncoding: 'json' }),
});
