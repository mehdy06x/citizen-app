import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import '../styles/formRegister.css'; // Assuming you have a CSS file for styling

function FormLogin({route, method}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);

        e.preventDefault()

        try{
            const res = await api.post(route, {username, password})
            if (method === "login"){
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            }else {
                navigate("/login");
            }
        }catch (error) {
            alert(error)
        }finally {
            setLoading(false);
        }
    }


    
    return (
        <div className="rmain-container">
            <div className="rform-container">
                <h1 className="rtitle">Se Connecter</h1>
                <form onSubmit={handleSubmit} >
                            <p className="rform-label">Nom Complet:</p>
                            <input 
                            className="rform-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Nom"
                            />
                

                            <p className="rform-label">Password:</p>
                            <input 
                            className="rform-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="password"
                            />
                
                
                </form>
                            <div className="rbuttons">
                            <button className="rcreate-button" onClick={handleSubmit} >
                                Connecter
                            </button>
                            <button className="rhave-button" >
                                Creer un compte
                            </button>
                            </div>
            </div>
            <div className="rimg-container">
            <p className="rimg-text-blue">Votre Voix,</p>
            <p className="rimg-text-white"> Notre Action.</p>
        </div>
        </div>
    )
}
export default FormLogin;