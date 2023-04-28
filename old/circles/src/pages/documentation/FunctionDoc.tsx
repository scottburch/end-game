import {PropsWithChildren} from "react";
import {Typography} from "antd";
import {FunctionDocProps} from "./ApiReactDocs.js";

export const FunctionDoc: React.FC<PropsWithChildren<FunctionDocProps>> = (props) => {
    return (
        <div style={{borderTop: '1px solid #bbb', marginBottom: 20}}>
            <Typography.Title level={5}>
                {props.name}({props.args.join(', ')}){props.returns ? `: ${props.returns}` : null}
            </Typography.Title>
            <Typography.Paragraph style={{paddingLeft: 15, marginBottom: 10}}>{props.children}</Typography.Paragraph>
            {(props.types || []).map(Type => <Type/>)}
        </div>
    )
}