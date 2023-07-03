import React, {PropsWithChildren} from "react";

export const DocsSection: React.FC<PropsWithChildren & {title: string, anchor: string}> = ({children, title, anchor}) => (
    <>
        <h3>{title.toUpperCase()}</h3>
        <a href={`#${anchor}`}/>
        {children}
    </>
    )
