import React from "react";
import {Introduction} from "./sections/Introduction.jsx";
import {ApiDocs} from "./ApiDocs.jsx";

export const DocsPage: React.FC = () => {
    return (
        <>
            <Introduction/>
            <ApiDocs/>
        </>
    )
}

