import {Link} from "react-router-dom";
import {CSSProperties, PropsWithChildren} from "react";

export const LinkTo: React.FC<PropsWithChildren<{to: string, style?: CSSProperties}>> = ({to, style, children, ...props}) => (
    <Link style={{color: 'inherit', ...style}} to={to} {...props}>{children}</Link>

)