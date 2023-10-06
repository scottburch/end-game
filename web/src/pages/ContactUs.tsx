import React, {useState} from 'react'
import {Button} from "antd";


export const ContactUs: React.FC = () => {
    const em = ['support', 'endgame-dtg', 'com'];
    const [show, setShow] = useState(false);


    return (
        <div style={{padding: 20}}>
            <h3>Contact Us</h3>
            <p>We are excited to hear from you.  Please write us with any issues, questions or suggestions.</p>
            <div style={{padding: 20}}>
                <Button type="primary" onClick={() => setShow(true)} style={{marginBottom: 20}}>Show Contact</Button>
                {show ? <div>{em[0] + '@' + em[1] + '.' + em[2]}</div> : null}
            </div>
        </div>
    )
}

