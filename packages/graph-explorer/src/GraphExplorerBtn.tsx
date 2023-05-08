import * as React from 'react'
import * as ReactDom from "react-dom";
import type {PropsWithChildren} from "react";
import {useEffect, useState} from "react";
import {Main} from "./Main.jsx";
import {createPortal} from "react-dom";
import type {Graph} from "@end-game/graph";

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