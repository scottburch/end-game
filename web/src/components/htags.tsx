import React, {HTMLProps, PropsWithChildren} from 'react';



export const H1:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h1 {...props}>{children}</h1>

export const H2:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h2 {...props}>{children}</h2>

export const H3:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h3 {...props}>{children}</h3>

export const H4:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h4 {...props}>{children}</h4>

export const H5:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h5 {...props}>{children}</h5>

export const H6:React.FC<PropsWithChildren & HTMLProps<HTMLHeadingElement>> = ({children, ...props}) =>
    <h6 {...props}>{children}</h6>


