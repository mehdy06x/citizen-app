import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import '../styles/formRegister.css'; 
function FormRegister({route, method}) {
    const [email, setemail] = useState("");
    const [password, setPassword] = useState("");
    const [Conpassword, setConPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [phoneNum, setphoneNum] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);

        e.preventDefault()

        try{
            const res = await api.post(route, {
                username: email,
                password: password,
                email: email,
                password_confirmation: Conpassword,
                first_name: firstName,
                last_name:lastName})
            navigate("/login");
            
        }catch (error) {
            alert(error)
        }finally {
            setLoading(false);
        }
    }


    
    return (
         <>
     <div className="rmain-container">
      
        <div className="rform-container">
          <h1 className="rtitle">Créer un compte</h1>
          <form  onSubmit={handleSubmit}>
                        <p className="rform-label">Prenom</p>
                        <input 
                        className="rform-input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Prenom"
                        />
                        <p className="rform-label">Nom</p>
                        <input 
                        className="rform-input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Nom"
                        />
                        <p className="rform-label">Email:</p>
                        <input 
                        className="rform-input"
                        type="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        required
                        placeholder="emailxyz@gmail.com"
                        />
                        <p className="rform-label">Numero Téléphone:</p>
                        <input 
                        className="rform-input"
                        type="tel"
                        value={phoneNum}
                        onChange={(e) => setphoneNum(e.target.value)}
                        required
                        placeholder="numero de téléphone"
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
                        <p className="rform-label">Confirm Password:</p>
                        <input 
                        className="rform-input"
                        type="password"
                        value = {Conpassword}
                        onChange={(e) => setConPassword(e.target.value)}
                        required
                        placeholder="Confirmer mot de passe"
                        />
                        

          </form>
                        <div className="rbuttons">
                    
                    
                        <button className="rcreate-button" onClick={handleSubmit}>
                            Creer mon compte
                        </button>
                        <button className="rhave-button" onClick={() => navigate("/login")} >
                            j'ai un compte
                        </button>
                        </div>
        </div>
        <div className="rimg-container">
          <p className="rimg-text-blue">Votre Voix,</p>
          <p className="rimg-text-white"> Notre Action.</p>
        </div>
     </div> 
    </>
    )
}
export default FormRegister;