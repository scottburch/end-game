import React, {CSSProperties} from 'react';

export const EndgamePyramid: React.FC = () => (
    <div style={{...styles.pyramid, width: 300}}>
        <div style={styles.section}>Endgame Pay</div>
        <div style={{...styles.section, backgroundColor: 'blue', display: 'flex', flexDirection: 'column'}}>
            <div>DTG</div>
            <span style={{fontSize: 12}}>(Distributed Trustless Graph)</span>
        </div>
        <div style={{...styles.section, backgroundColor: 'red'}}>Authentication</div>
        <div style={{...styles.section, backgroundColor: 'purple'}}>Reactive UI</div>
        <div style={styles.section}>Reactive Graph</div>
    </div>


)

const styles: Record<string, CSSProperties> = {
    pyramid: {
        display: 'flex',
        flexDirection: 'column',
        clipPath: 'polygon(80% 0px, 100% 100%, 0px 100%, 20% 0)'

    },
    section: {
        flex: 1,
        backgroundColor: 'green',
        marginBottom: 2,
        color: "white",
        textAlign: 'center',
        fontSize: '26px',
        padding: 5
    }
}




