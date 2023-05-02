import React, {CSSProperties} from 'react';
import {Header} from "./components/header/Header.jsx";


export const Main: React.FC = () => {
    return (
        <div style={styles.main}>
            <Header/>
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
        padding: 30,
    }
}


