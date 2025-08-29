


export default function Circle(props:{title:string,disc:string, icon?:string}){
    const isUrl = props.icon ? (/^https?:\/\//.test(props.icon) || props.icon.startsWith('/')) : false;
    const isWord = props.icon && !isUrl;

    return (
        <>
            <div className="secondsection">
                <div className="circle">
                    {isUrl ? (
                        <img className="circle-icon-img" src={props.icon} alt="" />
                    ) : isWord ? (
                        <span className="material-symbols-outlined" aria-hidden style={{fontSize:22}}>{props.icon}</span>
                    ) : null}
                </div>
                <h2>{props.title}</h2>
                <p>{props.disc}</p>
            </div>
        </>
    )
}