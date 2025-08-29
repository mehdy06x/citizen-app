import Accueil from "./acceuil";
import Button from "./Button";
import './secondpage.css';

export default function AligningButtons() {
  return (
    <div className="aligning-buttons">

      <div className="recbtn">
        <Button name="Mes Reclamations"/>
        </div>
      <Accueil/>
    </div>
    
  );
}
