
/* 
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000/api'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e:any){
    e.preventDefault()
    const res = await fetch(`${API_BASE}/user/register/`, {
      method: 'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email,password,password_confirmation:password,first_name:'',last_name:''})
    })
    if (res.ok) {
      alert('Created account, please login')
      navigate('/connect')
    } else {
      const txt = await res.text().catch(()=>'')
      alert('Register failed: '+txt)
    }
  }

  return (
    <div style={{padding:24,maxWidth:480,margin:'24px auto'}}>
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8}}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Créer</button>
          <button type="button" onClick={()=>navigate('/connect')}>Annuler</button>
        </div>
      </form>
    </div>
  )
}
*/