import {first, map, Observable, of, switchMap, tap} from "rxjs";

export const speak = (text: string) => of(text).pipe(
    map(text => new SpeechSynthesisUtterance(text)),
    tap(uterance => window.speechSynthesis.speak(uterance)),
    switchMap(uterance => new Observable(sub=>
        uterance.onend = () => sub.next()
    )),
    first()
)