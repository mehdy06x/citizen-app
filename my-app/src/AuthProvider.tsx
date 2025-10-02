import React, { useEffect } from 'react';
// We'll call the user-info endpoint using fetch to avoid importing the JS api module here.

type Props = { children: React.ReactNode };

export default function AuthProvider({ children }: Props) {
  useEffect(() => {
    async function check() {
      const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      if (!token) return;

      // If we already stored role info, no need to call backend every time
      if (localStorage.getItem('auth_checked') === '1') return;

      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
        const resp = await fetch(new URL('/api/users/me/', base).toString(), { headers: { Authorization: `Bearer ${access}` } });
        if (!resp.ok) throw new Error('not ok');
        const data = await resp.json();
        const isAdmin = Boolean(data.is_staff || data.is_superuser || data.is_admin || data.role === 'admin');
        try { localStorage.setItem('is_admin', isAdmin ? '1' : '0'); } catch (e) { }
        try { localStorage.setItem('user_email', data.email || localStorage.getItem('user_email') || ''); } catch (e) { }
      } catch (e) {
        // token might be invalid; remove stored tokens
        ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
        try { localStorage.removeItem('is_admin'); } catch (ee) { }
      } finally {
        try { localStorage.setItem('auth_checked', '1'); } catch (e) { }
        try { window.dispatchEvent(new Event('auth-changed')); } catch (e) { }
      }
    }
    check();
  }, []);

  return <>{children}</>;
}
