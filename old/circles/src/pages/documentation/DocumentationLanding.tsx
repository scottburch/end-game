import {useNavigate} from "react-router-dom";
import {useEffect} from "react";



export const DocumentationLanding: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => navigate('/documentation/api/base'));

    return null
};