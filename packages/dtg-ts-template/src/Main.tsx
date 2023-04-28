import React, {CSSProperties} from 'react';


export const Main: React.FC = () => {
    return (
        <div style={styles.main}>
            APP HERE
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
        padding: 30,
        textAlign: 'center'
    },
    header: {
        color: '#100e54'
    }
}


