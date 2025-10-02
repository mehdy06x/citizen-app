import Button from "./Button";
import './secondsection.css';
export default function Lampa(props:{title:string,text:string}){
    return(
        <>
        <div className="lamp">
        <div className="sublamp">
        <h4>{props.title}</h4>
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