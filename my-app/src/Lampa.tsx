import Button from "./Button";
import './secondsection.css';
export default function Lampa(props:{text:string}){
    return(
        <>
        <div className="lamp">
        <div className="sublamp">
        <h4>Lampadaire</h4>
        <div className="tbtn">
        <Button name="Terminée"/>
        </div>
        
        </div>
        <div className="text">{props.text}</div>
        <></>
        <div className="dbtn">
        <Button name="Details"/>
        </div>

        </div>
        </>

    )
}