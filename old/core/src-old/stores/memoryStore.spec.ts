import {runStoreTests} from "./storeTests";
import {newMemoryStore} from "./memoryStore";
import {of} from "rxjs";

describe('memory store', () => {
    runStoreTests(() => of(newMemoryStore()))
});