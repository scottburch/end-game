import * as React from 'react'
import {CSSProperties, useState} from 'react';
import {AddPostPanel} from "./components/AddPostPanel.jsx";
import {PostList} from "./components/PostList.jsx";
import {useAuth} from "@end-game/react-graph";
import {Header} from "./components/Header.jsx";
import {LoginOrSignupPanel} from "./components/LoginOrSignupPanel.jsx";

import {RightSide} from "./components/RightSide.jsx";

export const Main: React.FC = () => {
    const auth = useAuth();
    return (
        <div style={styles.main}>
            <Header/>
            <div style={{display: 'flex'}}>
            <div style={{padding: 30, textAlign: 'center', flex: 1}}>
                {auth.username ? <AddPostPanel/> : <LoginOrSignupPanel/>}
                <PostList />
            </div>
                <div style={{padding: 30, borderLeft: '1px solid #aaa'}}>
                    <RightSide/>
                </div>
            </div>
        </div>

    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
    }
}


