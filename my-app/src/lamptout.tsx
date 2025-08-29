import Button from './Button';
import './secondpage.css';
export default function Lamptout() {
  return (
    <div className='bgcolor'>

       <div className="lamptout">
      <div className='lampbutton'>
        <h4>Lampadaire</h4>
       <Button name="Resolue"/>
      </div>  
      <p>
        Avenue Oak, Près du Parc
        <br/> Lampadaire cassé sur l’Avenue Oak
      </p>
      <p>
        <span className='bold'>Dernière Mise à Jour</span> : Lampadaire réparé et testé avec succès

      </p>


    </div>
    </div>
   
  );
}
