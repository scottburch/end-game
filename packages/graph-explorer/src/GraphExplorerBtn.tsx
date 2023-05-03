import type {PropsWithChildren} from "react";
import * as React from 'react'
import {useState} from 'react'
import {createPortal} from "react-dom";
import {Main} from "./Main.jsx";
import {filter, fromEvent, map, of, switchMap, tap} from "rxjs";

export const GraphExplorerBtn: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Graph Explorer</button>
            {open ? (
                <NewWindow onWinClose={() => setOpen(false)}>
                    <Main/>
                </NewWindow>
            ) : null}
        </>
    )
}

let win: Window

const NewWindow: React.FC<PropsWithChildren & { onWinClose: () => void }> = ({children, onWinClose}) => {
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

    return createPortal(children, win.document.body as Element);
};