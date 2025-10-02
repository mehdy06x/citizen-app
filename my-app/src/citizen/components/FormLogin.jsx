import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import '../styles/formRegister.css';

function FormLogin({route, method}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e && e.preventDefault();

        try {
            // First try using username field (some backends expect email instead)
            let res;
            try {
                // Try username first
                res = await api.post(route, { username, password });
            } catch (err) {
                const status = err && err.response && err.response.status;
                // If backend returned 400 or 401, retry with email key (common when user typed email)
                if (status === 400 || status === 401) {
                    try {
                        console.debug('token endpoint returned', status, '; retrying with email field');
                        res = await api.post(route, { email: username, password });
                    } catch (err2) {
                        // If retry failed, rethrow original for outer catch to handle and show message
                        throw err2 || err;
                    }
                } else throw err;
            }

            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                // keep the username/email for UI display
                try { localStorage.setItem('user_email', username); } catch (e) { }
                // notify other components in the same window that auth changed
                try { window.dispatchEvent(new Event('auth-changed')); } catch (e) { }

                // 1) If login response contains role info, use it
                const loginData = res.data || {};
                const loginIsAdmin = loginData.is_staff || loginData.is_superuser || loginData.is_admin || loginData.role === 'admin' || (loginData.user && (loginData.user.is_staff || loginData.user.is_admin));

                // helper: decode JWT payload (browser-safe)
                function tryDecodeJwt(token) {
                    try {
                        const payload = token.split('.')[1];
                        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                        return JSON.parse(decodeURIComponent(escape(json)));
                    } catch (e) { return null; }
                }

                if (loginIsAdmin) {
                    navigate('/admin');
                    return;
                }

                // 1b) If not explicit, try to decode the JWT payload to inspect common admin claims
                const access = res.data && res.data.access;
                if (access) {
                    const jwtPayload = tryDecodeJwt(access);
                    if (jwtPayload) {
                        const jwtAdmin = jwtPayload.is_staff || jwtPayload.is_superuser || jwtPayload.is_admin || jwtPayload.role === 'admin' || (jwtPayload.user && (jwtPayload.user.is_staff || jwtPayload.user.is_admin));
                        if (jwtAdmin) {
                            navigate('/admin');
                            return;
                        }
                    }
                }

                // 2) Otherwise try the safe user-info endpoint if present using the fresh access token
                try {
                    console.debug('calling /api/users/me/ with explicit Authorization header to detect role');
                    const accessToken = res.data && res.data.access;
                    const me = await api.get('/api/users/me/', { headers: { Authorization: `Bearer ${accessToken}` } });
                    console.debug('/api/users/me/ response', me);
                    const data = me.data || {};
                    const isAdmin = data.is_staff || data.is_superuser || data.is_admin || data.role === 'admin';
                    console.debug('isAdmin?', isAdmin, 'user data', data);
                    if (isAdmin) {
                        navigate('/admin');
                        return;
                    }
                    // Agent detection
                    if (data && (data.is_agent || data.is_agent === true)) {
                        navigate('/agent/reports');
                        return;
                    }
                    // default regular user
                    navigate('/secondpage');
                } catch (error) {
                    // Show friendly server message when available
                    const serverMsg = error && error.response && error.response.data ? JSON.stringify(error.response.data) : String(error);
                    console.warn('User info fetch failed after login:', serverMsg);
                    // fallback to secondpage when user-info cannot be fetched
                    navigate('/secondpage');
                }

            } else {
                navigate('/connect');
            }

        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rmain-container">
            <div className="rform-container">
                <h1 className="rtitle">Se Connecter</h1>
                <form onSubmit={handleSubmit} >
                            <p className="rform-label"> Email (ou Nom Complet):</p>
                            <input 
                            className="rform-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="xyz@gmail.com (ou Nom Complet)"
                            />
                

                            <p className="rform-label">Password:</p>
                            <input 
                            className="rform-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="password"
                            />
                
                
                </form>
                            <div className="rbuttons">
                            <button className="rcreate-button" onClick={handleSubmit} >
                                Connecter
                            </button>
                            <button className="rhave-button" onClick={() => navigate('/register')}>
                                Creer un compte
                            </button>
                            </div>
            </div>
            <div className="rimg-container">
            <p className="rimg-text-blue">Votre Voix,</p>
            <p className="rimg-text-white"> Notre Action.</p>
        </div>
        </div>
    )
}
export default FormLogin;
