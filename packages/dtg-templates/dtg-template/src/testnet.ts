import {startTestNet} from "@end-game/test-utils";
import {tap} from "rxjs";

startTestNet([[1], []]).pipe(
    tap(() => console.log('TESTNET STARTED!!!'))
).subscribe()