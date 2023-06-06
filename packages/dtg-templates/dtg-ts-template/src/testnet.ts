import {tap} from "rxjs";
import {startTestNet} from "@end-game/test-utils";


setTimeout(() =>
    startTestNet([[1], []]).pipe(
        tap(() => console.log('** TESTNET STARTED!!!'))
    ).subscribe()
);





