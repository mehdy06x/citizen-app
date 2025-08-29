import { Link } from "react-router-dom";
import Button from "./Button";
import Demand from "./demande";
import './secondsection.css'
export default function SecondSection(){
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
        <div className='cn'><Link to="/connect"><Button name="Connecter"/></Link></div>
        <div className='re'><Link to="/register"><Button name="Reclamer"/></Link></div>
        </div>
        </>
    )
}