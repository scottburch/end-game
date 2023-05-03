import React from "react";

export const Svg: React.FC<{src: string}> = ({src}) => (
<svg width="100%">
    <image xlinkHref={src} height={'100%'} width={'100%'}/>
</svg>
);