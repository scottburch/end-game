import {filter, map, Observable, of, switchMap, tap} from "rxjs";



export type Speaker = {
    audio?: HTMLAudioElement
};

export const getSpeaker = () => ({});

export const speakerLoad = (speaker: Speaker, file: string) => of(undefined).pipe(
    tap(() => speaker.audio?.pause()),
    tap(() => speaker.audio = new Audio(file)) ,
    map(() => speaker)
);

export const speakerResume = (speaker: Speaker) => of(speaker).pipe(
    filter(() => !!speaker.audio),
    tap(() => speaker.audio?.play())
)

export const speakerPlay = (speaker: Speaker) => of(speaker).pipe(
    filter(() => !!speaker.audio),
    switchMap(() => new Observable(sub => {
        (speaker.audio as Required<Speaker>['audio']).onended = () => {
            sub.next();
            sub.complete();
        };
        speaker.audio?.play();
    }))
)





export const speakerPause = (speaker: Speaker) => of(speaker).pipe(
    tap(speaker => speaker.audio?.pause())
);


