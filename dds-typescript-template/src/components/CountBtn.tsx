import {putPistolValue, usePistolValue} from "@scottburch/pistol";
import {firstValueFrom} from "rxjs";

export const CountBtn: React.FC = () => {
    const count = usePistolValue<number>('demo-app.counter');

    const doCount = () => firstValueFrom(putPistolValue('demo-app.counter', (count || 0) + 1));

    return (
        <button onClick={doCount}>Press me</button>
    )

}