import './secondsection.css'
export default function Subsection(props:{title:string,desc:string}){
    return(
        <>
        <div className="rectangle"> 
            <h3>{props.title} 
            </h3>
            <p>{props.desc}</p>
        </div>
        </>
    )
}