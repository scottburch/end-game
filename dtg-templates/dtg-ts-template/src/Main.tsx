import * as React from 'react'
import {CSSProperties} from 'react';
import {AddPostPanel} from "./components/AddPostPanel.jsx";
import {PostList} from "./components/PostList.jsx";
import {useAuth} from "@end-game/react-graph";
import {LoginPanel} from "./components/LoginPanel.jsx";
import {Header} from "./components/Header.jsx";

export const Main: React.FC = () => {
    const auth = useAuth();
    return (
        <div style={styles.main}>
            <Header/>
            <div style={{padding: 30, textAlign: 'center'}}>
            {auth.username ? <AddPostPanel/> : <LoginPanel/>}
            <PostList/>
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


