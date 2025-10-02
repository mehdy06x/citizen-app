import Button from "./Button";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export default function Accueil() {
    const navigate = useNavigate();
    const [logged, setLogged] = useState(Boolean(localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken')));

    useEffect(() => {
        function update() {
            setLogged(Boolean(localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken')));
        }
        window.addEventListener('storage', update);
        window.addEventListener('auth-changed', update);
        return () => {
            window.removeEventListener('storage', update);
            window.removeEventListener('auth-changed', update);
        }
    }, []);

    function handleClick() {
        if (!logged) {
            navigate('/connect');
            return;
        }
        // logged in -> handle logout. If user is on /secondpage, navigate immediately
        const path = window.location.pathname || '';
        if (path.startsWith('/secondpage')) {
            // navigate first to avoid visible button label flip on the current page
            try { navigate('/connect'); } catch (e) { /* ignore */ }
            // clear storage and notify after a short delay so the new page renders with no flash
                setTimeout(() => {
                ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
                localStorage.removeItem('user_email');
                localStorage.removeItem('username');
                localStorage.removeItem('email');
                try { localStorage.removeItem('is_admin'); } catch (e) {}
                try { localStorage.removeItem('auth_checked'); } catch (e) {}
                try { window.dispatchEvent(new Event('auth-changed')); } catch (e) { }
            }, 100);
            return;
        }

        // For other pages, clear tokens and notify immediately (UI will update in-place)
    ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('user_email');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    try { localStorage.removeItem('is_admin'); } catch (e) {}
    try { localStorage.removeItem('auth_checked'); } catch (e) {}
    try { window.dispatchEvent(new Event('auth-changed')); } catch (e) { }
        // if on admin routes, redirect to login for safety
        try {
            if (path.startsWith('/admin')) navigate('/connect');
        } catch (e) { }
    }

    return (
        <>
            <section className="sectionacceuil">
                <div className="alignbtns">
                    <div className="Acceuilbtn"><Button name="Accueil" onClick={() => navigate('/')} /></div>
                    <div className="Reclamerbtn">
                        <Button name="Reclamer" onClick={() => navigate('/register')} />
                    </div>
                </div>
                <div className="Connectbtn">
                    <Button name={logged ? 'D\u00e9connecter' : 'Connecter'} onClick={handleClick} />
                </div>
            </section>
        </>
    );
}
