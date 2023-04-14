import {Row, Col, Typography} from 'antd'
import {Link, Routes} from "react-router-dom";
import {Route} from "react-router";
import {ApiBaseDocs} from "./documentation/ApiBaseDocs";
import {ApiReactDocs} from "./documentation/ApiReactDocs";
import {CSSProperties} from "react";
import {DocumentationLanding} from "./documentation/DocumentationLanding";
import {CliDocs} from "./documentation/CliDocs";

export const DocumentationPage: React.FC = () => (
        <Row style={{flexWrap: 'nowrap'}}>
            <Col style={{paddingRight: 50, borderRight: '1px solid #bbb'}}>
                <Typography.Title level={4} style={{whiteSpace: 'nowrap'}}>API</Typography.Title>
                <Typography.Text style={styles.item}><Link to='/documentation/api/base'>Base</Link></Typography.Text>
                <Typography.Text style={styles.item}><Link to='/documentation/api/react'>React</Link></Typography.Text>
                <Typography.Title level={4} style={{whiteSpace: 'nowrap'}}>Others</Typography.Title>
                <Typography.Text style={styles.item}><Link to='/documentation/cli'>CLI</Link></Typography.Text>
            </Col>
            <Col flex={1} style={{padding: 10}}>
                <Routes>
                    <Route path="api/base" element={<ApiBaseDocs/>}/>
                    <Route path="api/react" element={<ApiReactDocs/>}/>
                    <Route path="cli" element={<CliDocs/>}/>
                    <Route path="/" element={<DocumentationLanding/>}/>
                </Routes>
            </Col>
        </Row>
    );


const styles: Record<string, CSSProperties> = {
    item: {
        fontWeight: 'bold',
        display: 'block',
        paddingLeft: 20,
        paddingBottom: 10,
        whiteSpace: 'nowrap'
    }
}