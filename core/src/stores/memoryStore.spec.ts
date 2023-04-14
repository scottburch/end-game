import {runStoreTests} from "./storeTests.js";
import {newMemoryStore} from "./memoryStore.js";
import {of} from "rxjs";

describe('memory store', () => {
    runStoreTests(() => of(newMemoryStore()))
});