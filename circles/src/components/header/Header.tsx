import React, {CSSProperties} from "react";

import {HeaderMenu} from "./HeaderMenu";
import {Col, Row} from "antd";
import {Logo} from "./Logo";
import {Welcome} from "./Welcome";

export const headerBgColor = '#eaeaea'

export const Header: React.FC = () => {
    return (
            <Row style={{flex: 1, padding: '5px 10px 5px 10px', lineHeight: '1.1em', background: headerBgColor}}>
                <Col>
                    <Logo/>
                </Col>
                <Col flex="auto" style={{display: 'flex', flexDirection: 'column'}}>
                    <Row style={{flex: 1}}></Row>
                    <Row><Col span={24}><div style={{paddingLeft: 50}}><HeaderMenu/></div></Col></Row>
                </Col>
                <Col>{/*<Welcome/>*/}</Col>
            </Row>
    )
};

const styles: Record<string, CSSProperties> = {
    middle: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    header: {
        backgroundColor: '#f0f0f0',
        display: "flex",
        paddingLeft: 10,
        paddingRight: 10
    },
    logoWrapper: {
        position: 'relative',
        height: '100%'
    },
    logo: {
    },
    logoText: {
        position: 'absolute',
        top: 59,
        left: 106,
        color: '#946a71',
        fontSize: 17
    }
}


// return <div style={styles.header}>
//     <div style={styles.logoWrapper}>
//         <img style={styles.logo} src={logo}/>
//         <div style={styles.logoText}>Powered by DDS Technology</div>
//     </div>
//     <div style={styles.middle}>
//         <div style={{flex: 1}}/>
//         <div style={{display: 'flex', justifyContent: 'right'}}>
//             <HeaderMenu/>
//         </div>
//     </div>
// </div>
