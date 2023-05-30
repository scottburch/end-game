import React, {useState} from 'react'

export const SignupPanel: React.FC = () => {
    const [values, setValues] = useState({});



    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <Input placeholder="Username" name="username" onBlur={username => setValues({...values, username})}/>
            <Input placeholder="Password" name="password" onBlur={password => setValues({...values, password})}/>
            <Input placeholder="Verify password" name="password2" onBlur={password2 => setValues({...values, password2})}/>
            <Input placeholder="Display name" name="display" onBlur={display => setValues({...values, display})}/>
            <textarea style={{width: '100%'}} placeholder="About me"/>
            <button style={{width: 'fit-content'}}>Signup</button>
        </div>
    )
}

const Input: React.FC<{name: string, placeholder: string, onBlur: (v: string) => void}> = ({name, onBlur, placeholder}) => (
    <div style={{paddingBottom: 5}}>
        <input style={{width: '100%'}} id={name} placeholder={placeholder} onBlur={ev => onBlur(ev.target.value)}/>
    </div>
)