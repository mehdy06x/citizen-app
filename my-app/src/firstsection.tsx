
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'

import './firstsection.css'

export default function Firstsection(){
    const navigate = useNavigate();
    function handleConnect(){
        const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
        if (!token) { navigate('/connect'); return; }
        const isAdmin = localStorage.getItem('is_admin') === '1';
        if (isAdmin) navigate('/admin'); else navigate('/secondpage');
    }
    return(

    <div className="firstsection">
       


    <h5> <div className="voice">Votre Voix </div>, Notre Action. </h5>
    <p> Soumettez vos demandes de services municipaux <br/>
    pour les réparations routières et les services quotidiens.<br/>
    Suivez l’avancement en temps réel et recevez<br/> 
    des mises à jour de nos agents dédiés.</p>
        <div className='specialbtns'>

        <div className='cnt'>
            


    <div className='cnt'><Button name="Connecter" onClick={handleConnect} /></div>


        </div>
    <div className='rec'><Link to='/register'><Button name="Reclamer"/></Link></div>
        </div>


</div>

)
}