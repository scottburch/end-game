import * as React from "react";
import {Header} from "./components/Header.jsx";
import {HashRouter, Routes, Route} from "react-router-dom";
import {ByNodeLabel} from "./ByNodeLabel.jsx";
import {ByNodeProp} from "./ByNodeProp.jsx";
import {ByNodeId} from "./ByNodeId.jsx";

export const Main: React.FC = () => {
    return (
        <HashRouter>
            <Header/>
            <Routes>
                <Route path="/by-node-label/:label" element={<ByNodeLabel/>}/>
                <Route path="/by-node-prop/:prop" element={<ByNodeProp/>}/>
                <Route path="/by-node-id/:nodeId" element={<ByNodeId/>}/>
            </Routes>
        </HashRouter>
    )
};