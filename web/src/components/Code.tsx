import React from 'react'
import {PropsWithChildren} from "react";

export const Code: React.FC<PropsWithChildren> = ({children}) => (
    <span style={{backgroundColor: '#eee', fontFamily: 'monospace'}}>
        {children}
    </span>
)