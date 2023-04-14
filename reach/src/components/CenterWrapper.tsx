import {PropsWithChildren} from "react";

export const CenterWrapper: React.FC<PropsWithChildren> = ({children}) => (
    <div style={{display: 'flex', paddingTop: 20}}>
        <div style={{flex: 1}}/>
        <div style={{minWidth: 400, width: '50%'}}>{children}</div>
        <div style={{flex: 1}}/>
    </div>
)