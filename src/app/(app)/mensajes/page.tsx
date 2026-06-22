'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconMessage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconFlame = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

interface Conversacion {
  matchId: string
  usuarioId: string
  alias: string
  ciudad: string
  foto_principal?: string
  foto_url?: string
  ultimoMensaje?: string
  timestamp?: string
}

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

export default function MensajesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [userId, setUserId] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    await cargarConversaciones(user.id)
    setCargando(false)
  }

  const cargarConversaciones = async (uid: string) => {
    // Obtener matches del usuario
    const { data: matches } = await supabase.from('matches').select('*')
      .or(`usuario1.eq.${uid},usuario2.eq.${uid}`)

    if (!matches || matches.length === 0) {
      setConversaciones([])
      return
    }

    const convos: Conversacion[] = []

    for (const match of matches) {
      const otroId = match.usuario1 === uid ? match.usuario2 : match.usuario1
      const { data: usuario } = await supabase.from('usuarios')
        .select('id,alias,ciudad,foto_principal')
        .eq('id', otroId)
        .single()

      if (usuario) {
        const foto_url = usuario.foto_principal
          ? supabase.storage.from('fotos').getPublicUrl(usuario.foto_principal).data.publicUrl
          : undefined

        convos.push({
          matchId: match.id,
          usuarioId: usuario.id,
          alias: usuario.alias,
          ciudad: usuario.ciudad,
          foto_principal: usuario.foto_principal,
          foto_url,
        })
      }
    }

    setConversaciones(convos)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:130, height:'auto' }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const conversacionesFiltradas = conversaciones.filter(c =>
    c.alias.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
        <img src={LOGO} alt="LUAPP" style={{ height:34, width:'auto', objectFit:'contain' }} />
        <h1 style={{ fontSize:18, fontWeight:600, color:'#1f2937', margin:0 }}>Mensajes</h1>
        <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
          🚪
        </button>
      </div>

      {/* Buscador */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'12px 16px' }}>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', display:'flex' }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width:'100%', padding:'10px 12px 10px 40px', borderRadius:20, border:'0.5px solid #e0bec1', background:'#f9f5f0', fontSize:14, outline:'none' }}
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
        {conversacionesFiltradas.length === 0 ? (
          <div style={{ padding:'40px 20px', textAlign:'center', color:'#9ca3af' }}>
            <div style={{ fontSize:60, marginBottom:16 }}>💬</div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Sin conversaciones</div>
            <div style={{ fontSize:12 }}>Haz un match para empezar a chatear</div>
            <button onClick={() => router.push('/explorar')}
              style={{ marginTop:16, padding:'10px 20px', borderRadius:20, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              Ir a explorar
            </button>
          </div>
        ) : (
          conversacionesFiltradas.map(convo => (
            <button key={convo.usuarioId} onClick={() => router.push(`/mensajes/${convo.usuarioId}`)}
              style={{ width:'100%', padding:'12px 16px', background:'none', border:'none', borderBottom:'0.5px solid #f0d4d8', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left', transition:'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              
              <div style={{ position:'relative', width:50, height:50, flexShrink:0 }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {convo.foto_url
                    ? <img src={convo.foto_url} alt={convo.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ color:'white', display:'flex' }}><IconUser /></span>
                  }
                </div>
                <span style={{ position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid white' }} />
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#1f2937', marginBottom:2 }}>{convo.alias}</div>
                <div style={{ fontSize:12, color:'#9ca3af' }}>{convo.ciudad}</div>
              </div>

              <div style={{ fontSize:11, color:'#af2245', fontWeight:600 }}>→</div>
            </button>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background:'white', borderTop:'0.5px solid #f0d4d8', display:'flex', justifyContent:'space-around', padding:'8px 0', position:'sticky', bottom:0 }}>
        {[
          { icon:<IconSearch />, path:'/explorar', lbl:'Explorar' },
          { icon:<IconMessage />, path:'/mensajes', lbl:'Mensajes', active:true },
          { icon:<IconFlame />, path:'/creditos', lbl:'Créditos' },
          { icon:<IconUser />, path:'/perfil', lbl:'Perfil' },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: item.active ? '#af2245' : '#9ca3af', fontSize:10 }}>
            {item.icon}
            <span>{item.lbl}</span>
            {item.active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#af2245' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
