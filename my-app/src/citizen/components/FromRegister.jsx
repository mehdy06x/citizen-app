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
        e.preventDefault();
        // basic client-side validation
        if (!email || !password || !Conpassword) {
            alert('Please fill all required fields');
            return;
        }
        if (password !== Conpassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try{
            const res = await api.post(route, {
                username: email,
                password: password,
                email: email,
                password_confirmation: Conpassword,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNum
            })
            // show success and navigate to login
            navigate("/connect");
        }catch (error) {
            // axios error: provide more detail to help debugging
            if (error.response) {
                // server sent a response (likely validation error)
                try {
                    const data = error.response.data;
                    alert('Register failed: ' + (typeof data === 'object' ? JSON.stringify(data) : String(data)));
                } catch (e) {
                    alert('Register failed: ' + error.response.statusText || error.message);
                }
            } else {
                // network or other error
                alert('Register error: ' + (error.message || String(error)));
            }
        }finally {
            setLoading(false);
        }
    }

    return (
         <>
     <div className="rmain-container">
      
        <div className="rform-container">
          <h1 className="rtitle">Créer un compte</h1>
          <form autoComplete="off" onSubmit={handleSubmit}>
                        <p className="rform-label">Prenom</p>
                        <input 
                        className="rform-input"
                        name="first_name"
                        autoComplete="given-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Prenom"
                        />
                        <p className="rform-label">Nom</p>
                        <input 
                        className="rform-input"
                        name="last_name"
                        autoComplete="family-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Nom"
                        />
                        <p className="rform-label">Email:</p>
                        <input 
                        className="rform-input"
                        name="email"
                        autoComplete="email"
                        type="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        required
                        placeholder="emailxyz@gmail.com"
                        />
                        <p className="rform-label">Numero Téléphone:</p>
                        <input 
                        className="rform-input"
                        name="phone_number"
                        autoComplete="tel"
                        type="tel"
                        value={phoneNum}
                        onChange={(e) => setphoneNum(e.target.value)}
                        required
                        placeholder="numero de téléphone"
                        />
                        <p className="rform-label">Password:</p>
                        <input 
                        className="rform-input"
                        name="password"
                        autoComplete="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="password"
                        />
                        <p className="rform-label">Confirm Password:</p>
                        <input 
                        className="rform-input"
                        name="password_confirmation"
                        autoComplete="new-password"
                        type="password"
                        value = {Conpassword}
                        onChange={(e) => setConPassword(e.target.value)}
                        required
                        placeholder="Confirmer mot de passe"
                        />
                        

                        <div className="rbuttons">
                        <button type="submit" className="rcreate-button" disabled={loading}>
                            {loading ? "Envoi..." : "Creer mon compte"}
                        </button>
                        <button type="button" className="rhave-button" onClick={() => navigate("/connect")} >
                            j'ai un compte
                        </button>
                        </div>
          </form>
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
