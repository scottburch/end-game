import React from 'react'
import logo from './logo-white.png'

export const Logo:React.FC = () => (
    <div style={{display: 'flex'}}>
        <img src={logo} style={{height: 100}}/>
        <div style={{display: 'flex', flexDirection: 'column', paddingTop: 20, paddingLeft: 5}}>
            <div style={{fontSize: 40, fontFamily: 'sans-serif', letterSpacing: 5}}>endgame</div>
            <div>Welcome to the new internet</div>
        </div>
    </div>
)