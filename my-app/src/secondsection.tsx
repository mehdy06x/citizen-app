import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import Demand from "./demande";
import './secondsection.css'
export default function SecondSection(){
    const navigate = useNavigate();
    function handleConnect(){
        const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
        if (!token) { navigate('/connect'); return; }
        const isAdmin = localStorage.getItem('is_admin') === '1';
        if (isAdmin) navigate('/admin'); else navigate('/secondpage');
    }
    return(
        <>
        <div className="sdsection"><Demand/></div>

        <div className="mrg">
            <h5><span className="how">Prêt(e) à Soumettre Votre Demande ?</span></h5>

        <div className="pr">
        <p>Rejoignez des milliers de citoyens qui font confiance à notre plateforme
        pour les services municipaux. Votre demande compte pour nous.</p>
        </div>

        </div>
        <div className='spcbtns'>
        <div className='cn'><Button name="Connecter" onClick={handleConnect} /></div>
    <div className='re'><Link to="/register"><Button name="Reclamer"/></Link></div>
        </div>
        </>
    )
}