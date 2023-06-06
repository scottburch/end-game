import React from "react";

export const InputField: React.FC<{value?: string, name: string, placeholder: string, type?: string, onChange: (v: string) => void}> = ({value, name, onChange, type, placeholder}) => (
    <div style={{paddingBottom: 5}}>
        <input type={type} value={value} style={{width: '100%'}} id={name} placeholder={placeholder} onChange={ev => onChange(ev.target.value)}/>
    </div>
)