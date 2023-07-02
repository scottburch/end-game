import React from 'react'
import {Link} from "react-router-dom";
import {Outlet} from "react-router";

export const DocsLayout:React.FC = () => {
    return (
        <div style={{display: 'flex'}}>
            <div style={{backgroundColor: 'black', color: 'white', padding: 5}}>
                <Link  style={{color: 'white', textDecoration: 'none'}} to="/docs/intro">Introduction</Link>
            </div>
            <div style={{flex: 1, padding: 5}}>
                <Outlet/>
            </div>
        </div>
    )
}