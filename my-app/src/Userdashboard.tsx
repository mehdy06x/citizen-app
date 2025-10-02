
import './App.css'
import Footer from "./footer";
import Header from "./header";
import AligningButtons from "./aligningbuttons";
import Reports from './Reports';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState<string | null>(localStorage.getItem('user_email'));

  useEffect(() => {
    // prevent unauthenticated users from seeing /secondpage
    const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!access) {
      navigate('/connect');
      return;
    }
    setVerifying(false);

    function onAuthChanged() {
      const a = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      if (!a) {
        navigate('/connect');
        return;
      }
      setEmail(localStorage.getItem('user_email'));
    }
    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, [navigate]);

  if (verifying) return null;

  return (
    <div>
      <Header/>
      <div className="user-email-wrapper">
        <div className="user-email-cadre">
          {email ? <span>Connecté en tant que: <strong>{email}</strong></span> : null}
        </div>
      </div>
      <AligningButtons/>
      <Reports/>
      <Footer/>
    </div>
  )
}
