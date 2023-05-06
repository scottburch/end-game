import * as React from 'react'
import {useNavigate} from "react-router";
import {useState} from "react";

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');


    return (
        <div>
            <span>Search Nodes:</span>
            <input onBlur={ev => setQuery(ev.target.value)}/>
            <button onClick={() => navigate(`/by-node-label/${query}`)}>By Node Label</button>
            <button onClick={() => navigate(`/by-node-prop/${query}`)}>By Node Prop</button>
        </div>
    )
}