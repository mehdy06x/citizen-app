export default function Header(){

    return (
        <>
        <div className="headerbar">
        <header>
                        <div className='headerstart'>
                            <p>Urgence : +216 999-0000</p>
                            <p><a href="mailto:support@cityservices.gov">support@cityservices.gov</a></p>
                            <p>Lundi - Vendredi : 8h00 - 18h00</p>
                        </div>
                        <div className='headerend'>
                            {/* Admin link removed to prevent it showing on every page */}
                        </div>
        </header>
        </div>
        </>
    ) 
}