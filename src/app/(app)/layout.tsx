'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconCompass  = ({ active }: { active?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const IconMessage  = ({ active }: { active?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconHeart    = ({ active }: { active?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#af2245' : 'none'} stroke={active ? '#af2245' : 'currentColor'} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconFlame    = ({ active }: { active?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser     = ({ active }: { active?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLogOut   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

interface NavItem {
  path: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

const NAV: NavItem[] = [
  { path: '/explorar',    label: 'Explorar',  icon: a => <IconCompass active={a} /> },
  { path: '/mensajes',    label: 'Mensajes',  icon: a => <IconMessage active={a} /> },
  { path: '/explorar',    label: 'Flechazos', icon: a => <IconHeart active={a} /> },
  { path: '/creditos',    label: 'Créditos',  icon: a => <IconFlame active={a} /> },
  { path: '/perfil',      label: 'Mi perfil', icon: a => <IconUser active={a} /> },
]

interface Perfil {
  alias: string
  foto_principal?: string
  foto_url?: string
  creditos: number
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [perfil, setPerfil]         = useState<Perfil | null>(null)
  const [mensajesNuevos, setMensajesNuevos] = useState(0)
  const [flechazosNuevos, setFlechazosNuevos] = useState(0)

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('usuarios').select('alias,foto_principal,creditos').eq('id', user.id).single()
    if (data) {
      const foto_url = data.foto_principal
        ? supabase.storage.from('fotos').getPublicUrl(data.foto_principal).data.publicUrl
        : undefined
      setPerfil({ ...data, foto_url })
    }
    // Mensajes no leídos
    const { count: msgCount } = await supabase.from('mensajes')
      .select('*', { count: 'exact', head: true })
      .eq('leido', false)
      .neq('remitente_id', user.id)
    setMensajesNuevos(msgCount || 0)

    // Flechazos recibidos
    const { count: flCount } = await supabase.from('flechazos')
      .select('*', { count: 'exact', head: true })
      .eq('a_usuario', user.id)
    setFlechazosNuevos(flCount || 0)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const isActive = (path: string) => pathname.startsWith(path)

  const Badge = ({ n }: { n: number }) => n > 0 ? (
    <span style={{ position:'absolute', top:-4, right:-4, background:'#af2245', color:'white', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>
      {n > 9 ? '9+' : n}
    </span>
  ) : null

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .app-sidebar { display: none !important; }
          .app-mobile-nav { display: flex !important; }
          .app-content { margin-left: 0 !important; padding-bottom: 70px; }
        }
        @media (min-width: 769px) {
          .app-mobile-nav { display: none !important; }
          .app-content { margin-left: 220px; }
        }
      `}</style>

      {/* ── Sidebar desktop ── */}
      <div className="app-sidebar" style={{ position:'fixed', top:0, left:0, bottom:0, width:220, background:'white', borderRight:'1px solid #f0d4d8', display:'flex', flexDirection:'column', zIndex:50, boxShadow:'1px 0 8px rgba(0,0,0,0.04)' }}>

        {/* Logo */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #f0d4d8' }}>
          <img src={LOGO} alt="LUAPP" style={{ height:32, width:'auto', objectFit:'contain' }} />
        </div>

        {/* Perfil compacto */}
        {perfil && (
          <div onClick={() => router.push('/perfil')} style={{ padding:'14px 16px', borderBottom:'1px solid #f0d4d8', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#af2245,#f07855)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:15 }}>
              {perfil.foto_url
                ? <img src={perfil.foto_url} alt={perfil.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : perfil.alias?.[0]?.toUpperCase()
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{perfil.alias}</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#22c55e', fontWeight:500 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} /> En línea
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav style={{ flex:1, padding:'8px 10px', overflowY:'auto' }}>
          {NAV.map((item, i) => {
            const active = isActive(item.path) && !(item.label === 'Flechazos')
            const badge = item.label === 'Mensajes' ? mensajesNuevos : item.label === 'Flechazos' ? flechazosNuevos : 0
            return (
              <button key={i} onClick={() => router.push(item.path)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', marginBottom:2, transition:'all 0.15s', position:'relative', textAlign:'left',
                  background: active ? 'linear-gradient(135deg,rgba(175,34,69,0.08),rgba(240,120,85,0.08))' : 'transparent',
                  color: active ? '#af2245' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = '#f9f5f0')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                <span style={{ position:'relative', display:'flex' }}>
                  {item.icon(active)}
                  <Badge n={badge} />
                </span>
                {item.label}
                {active && <span style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:2, background:'#af2245' }} />}
              </button>
            )
          })}
        </nav>

        {/* Créditos + Logout */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid #f0d4d8' }}>
          <button onClick={() => router.push('/creditos')}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'1px solid #f0d4d8', background:'#fff8f1', cursor:'pointer', marginBottom:6, fontSize:13, color:'#af2245', fontWeight:600 }}>
            <IconFlame active /> {perfil?.creditos ?? 0} créditos
          </button>
          <button onClick={logout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, border:'none', background:'none', cursor:'pointer', fontSize:13, color:'#9ca3af', fontWeight:500 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
            <IconLogOut /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Bottom nav móvil ── */}
      <div className="app-mobile-nav" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #f0d4d8', zIndex:50, padding:'6px 0', boxShadow:'0 -2px 10px rgba(0,0,0,0.06)' }}>
        {NAV.filter(n => n.label !== 'Flechazos').map((item, i) => {
          const active = isActive(item.path)
          const badge  = item.label === 'Mensajes' ? mensajesNuevos : 0
          return (
            <button key={i} onClick={() => router.push(item.path)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: active ? '#af2245' : '#9ca3af', fontSize:10, fontWeight: active ? 700 : 400, position:'relative', paddingTop:4 }}>
              <span style={{ position:'relative', display:'flex' }}>
                {item.icon(active)}
                <Badge n={badge} />
              </span>
              <span>{item.label}</span>
              {active && <span style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:3, borderRadius:2, background:'#af2245' }} />}
            </button>
          )
        })}
      </div>

      {/* ── Contenido ── */}
      <div className="app-content">
        {children}
      </div>
    </>
  )
}
