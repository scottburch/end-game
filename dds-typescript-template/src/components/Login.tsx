import {useState} from "react";
import {pistolLogin} from "@scottburch/pistol";

type LoginProps = {
    username: string
    password: string
}

export const Login:React.FC = () => {
    const [form, setForm] = useState<LoginProps>({username: '', password: ''})

    const doLogin = () => pistolLogin(form.username, form.password).subscribe();

    return (
        <>
            <h4>To continue, please login with any username and password</h4>
            <div style={{marginBottom: 5}}>
                <label>Username:</label> <input id="username" onBlur={ev => setForm({...form, username:ev.target.value})}/>
            </div>
            <div style={{marginBottom: 5}}>
                <label>Password:</label> <input id="password" onBlur={ev => setForm({...form, password: ev.target.value})}/>
            </div>
            <div>
                <button onClick={doLogin}>Login</button>
            </div>
        </>
    )
}