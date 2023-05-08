import * as React from "react";
import {Header} from "./components/Header.js";
import {HashRouter, Routes, Route} from "react-router-dom";
import {ByNodeLabel} from "./ByNodeLabel.js";
import {ByNodeProp} from "./ByNodeProp.js";

export const Main: React.FC = () => {
    return (
        <HashRouter>
            <Header/>
            <Routes>
                <Route path="/by-node-label/:label" element={<ByNodeLabel/>}/>
                <Route path="/by-node-prop/:prop" element={<ByNodeProp/>}/>
            </Routes>
        </HashRouter>
    )
}