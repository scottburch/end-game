import React, {useEffect} from 'react'
import {useState} from 'react'
import type {ReactNode} from 'react'
import {createPortal} from "react-dom";
import {Main} from "./Main.jsx";
import {filter, fromEvent, map, of, switchMap, tap} from "rxjs";

export const GraphExplorer: React.FC = () => {
    const [open, setOpen] = useState(false);

    const checkKeyPress = (ev: KeyboardEvent) => {
        console.log(ev)
        ev.key === 'G' && ev.ctrlKey && setOpen(!open);
    }

    useEffect(() => {
        document.addEventListener('keypress', checkKeyPress);
        return () => document.removeEventListener('keypress', checkKeyPress);
    })

    return open ? (
        <NewWindow onWinClose={() => setOpen(false)}>
            <Main/>
        </NewWindow>
    ) : null;
}

let win: Window

const NewWindow: React.FC<{ onWinClose: () => void, children: ReactNode }> = ({children, onWinClose}) => {
    of(true).pipe(
        filter(() => !win || (win as any).openTime + 1000 < Date.now()),
        map(() =>
            window.open(
                "about:blank",
                "newWin",
                `width=${window.innerWidth - 100},height=${window.innerHeight - 100},left=100,top=100`
            ) as Window
        ),
        tap(window => win = window),
        tap(() => (win as any).openTime = Date.now()),
        switchMap(() => fromEvent(win, 'unload')),
        tap(onWinClose)
    ).subscribe()
    // TODO: the 'as any' and 'as ReactNode' are here because of a type problem in react - try to remove every once in a while
    return createPortal(children as any, win.document.body as Element) as unknown as ReactNode;
};