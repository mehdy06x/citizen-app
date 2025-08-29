import Button from "./Button";
import { Link } from 'react-router-dom'

export default function Accueil() {
  
    return (
        <>
            <section className="sectionacceuil">
                <div className="alignbtns">
                    <div className="Acceuilbtn"><Link to='/'><Button name="Accueil" /></Link></div>
                    <div className="Reclamerbtn">
                        <Link to="/register">
                        <Button name="Reclamer" />
                        </Link>
                        
                    </div>
                </div>
                <div className="Connectbtn">
                    <Link to="/connect"><Button name="Connecter" /></Link>
                </div>
            </section>
        </>
    );
  }
