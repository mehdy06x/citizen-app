import { useEffect, useState } from 'react';

type Toast = { id: number; type?: 'info' | 'success' | 'error'; message: string; duration?: number };

export function showToast(opts: { type?: 'info' | 'success' | 'error'; message: string; duration?: number }){
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { ...opts } }));
}

export default function ToastContainer(){
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(()=>{
    function onToast(e: any){
      const d = e.detail || {};
      const id = Date.now() + Math.floor(Math.random()*1000);
      const t: Toast = { id, type: d.type || 'info', message: d.message || '', duration: d.duration || 3000 };
      setToasts(prev => [...prev, t]);
      if (t.duration! > 0) {
        setTimeout(()=> setToasts(prev => prev.filter(x=>x.id !== id)), t.duration);
      }
    }
    window.addEventListener('app-toast', onToast as EventListener);
    return () => window.removeEventListener('app-toast', onToast as EventListener);
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', right: 18, top: 18, zIndex: 12000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ minWidth: 260, maxWidth: 420, padding: '10px 14px', background: t.type === 'error' ? '#fdecea' : t.type === 'success' ? '#ecfdf0' : '#eef2ff', color: t.type === 'error' ? '#b91c1c' : t.type === 'success' ? '#166534' : '#3730a3', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{t.type === 'error' ? 'Erreur' : t.type === 'success' ? 'Succès' : 'Info'}</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
