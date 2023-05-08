import type {PropsWithChildren} from "react";
import * as React from 'react'
import {useState} from 'react'
import {createPortal} from "react-dom";
import {Main} from "./Main.js";

export const GraphExplorerBtn: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
        <button onClick={() => setOpen(!open)}>Graph Explorer</button>
            {open ? (
                <NewWindow>
                    <Main/>
                </NewWindow>
            ) : null}
        </>
    )
}

const NewWindow: React.FC<PropsWithChildren> = ({children}) => {
    const newWindow =
        window.open(
            "about:blank",
            "newWin",
            `width=${window.innerWidth - 100},height=${window.innerHeight - 100},left=100,top=100`
    );
    return createPortal(children, newWindow?.document.body as Element);
};