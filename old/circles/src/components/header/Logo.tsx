import logo from './logo.png'
import {useNavigate} from "react-router-dom";

export const Logo: React.FC = () => {
    const navigate = useNavigate();

    return (
    <div style={{position: 'relative', cursor: 'pointer'}} onClick={() => navigate('/')}>
        <img alt="circles" src={logo}/>
        <div style={{position: 'absolute', top: 58, left: 105, color: '#946a71'}}>Powered by Pistol DDS Technology</div>
    </div>
)}