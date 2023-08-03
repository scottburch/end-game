import {first, map, Observable, of, switchMap, tap} from "rxjs";

export const speak = (utterance: SpeechSynthesisUtterance) => of(utterance).pipe(
    tap(uterance => window.speechSynthesis.speak(uterance)),
    switchMap(uterance => new Observable(sub=>
        uterance.onend = () => sub.next()
    )),
    first()
);

export const getVoice = (text: string) => of(new SpeechSynthesisUtterance(text))
