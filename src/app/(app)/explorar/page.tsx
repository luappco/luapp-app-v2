'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart = ({ filled }: { filled?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconFlame = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconMessage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconCrown = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f07855" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>
const IconUsers = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#af2245" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconChevronDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

const CIUDADES: Record<string, string[]> = {
  '🇨🇴 Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  '🇲🇽 México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  '🇨🇦 Centroamérica': ['Ciudad de Guatemala','San José (CR)','Panamá','Santo Domingo'],
  '🇦🇷 Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata'],
  '🇨🇱 Chile': ['Santiago','Valparaíso','Concepción'],
  '🇵🇪 Perú': ['Lima','Arequipa','Cusco'],
  '🇧🇷 Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  '🇪🇸 España': ['Madrid','Barcelona','Valencia','Sevilla','Bilbao'],
  '🇵🇹 Portugal': ['Lisboa','Oporto'],
  '🇫🇷 Francia': ['París','Lyon','Marsella'],
}

interface Usuario { id:string; alias:string; edad:number; ciudad:string; busca:string; foto_principal?:string; online?:boolean; foto_url?:string | null }
interface MiPerfil { alias:string; ciudad:string; creditos:number }

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [miembrosDelDia, setMiembrosDelDia] = useState<Usuario[]>([])
  const [nuevos, setNuevos] = useState<Usuario[]>([])
  const [conectados, setConectados] = useState<Usuario[]>([])
  const [visitantes, setVisitantes] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [edadMax, setEdadMax] = useState(60)
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [ciudadOpen, setCiudadOpen] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    const { data: p } = await supabase.from('usuarios').select('alias,ciudad,creditos').eq('id', user.id).single()
    if (p) setMiPerfil({ alias: p.alias, ciudad: p.ciudad, creditos: p.creditos || 0 })
    await cargarPerfiles(user.id)
    setCargando(false)
  }

  const cargarPerfiles = async (uid: string) => {
    const { data } = await supabase.from('usuarios').select('id,alias,edad,ciudad,busca,foto_principal').neq('id', uid).limit(20)
    if (!data) return
    const mapped = data.map(u => ({
      ...u,
      online: Math.random() > 0.5,
      foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
    }))
    setMiembrosDelDia(mapped.slice(0, 5))
    setNuevos(mapped.slice(5, 10))
    setConectados(mapped.filter((u: any) => u.online).slice(0, 5))
    setVisitantes(mapped.slice(10, 15))
  }

  const darFlechazo = async (targetId: string) => {
    if (flechazosEnviados.has(targetId)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: c } = await supabase.from('usuarios').select('creditos').eq('id', user.id).single()
    if (!c || c.creditos < 1) { router.push('/creditos'); return }
    await supabase.from('flechazos').insert({ emisor: user.id, receptor: targetId })
    await supabase.rpc('sumar_creditos', { uid: user.id, monto: -1 })
    setFlechazosEnviados(prev => new Set([...prev, targetId]))
    setMiPerfil(prev => prev ? { ...prev, creditos: prev.creditos - 1 } : prev)
    const { data: mutuo } = await supabase.from('flechazos').select('id').eq('emisor', targetId).eq('receptor', user.id).single()
    if (mutuo) {
      const u1 = user.id < targetId ? user.id : targetId
      const u2 = user.id < targetId ? targetId : user.id
      await supabase.from('matches').upsert({ usuario1: u1, usuario2: u2 })
    }
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:130, height:'auto' }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const Badge = ({ n }: { n: number }) => n > 0 ? (
    <span style={{ position:'absolute', top:-4, right:-4, background:'#af2245', color:'white', borderRadius:'50%', width:14, height:14, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>{n}</span>
  ) : null

  const ProfileCard = ({ u }: { u: any }) => {
    const enviado = flechazosEnviados.has(u.id)
    return (
      <div style={{ flexShrink:0, width:100, cursor:'pointer' }}>
        <div style={{ position:'relative', width:100, height:125, borderRadius:12, overflow:'hidden', background:'linear-gradient(160deg,#2A1840,#af2245)' }}>
          {u.foto_url
            ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}><IconUser /></div>
          }
          {u.online && <span style={{ position:'absolute', top:6, right:6, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'1.5px solid white' }} />}
          <button onClick={e => { e.stopPropagation(); darFlechazo(u.id) }}
            style={{ position:'absolute', bottom:5, right:5, width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', background: enviado ? '#af2245' : 'rgba(255,255,255,0.9)', display:'flex', alignItems:'center', justifyContent:'center', color: enviado ? 'white' : '#af2245' }}>
            <IconHeart filled={enviado} />
          </button>
        </div>
        <div style={{ padding:'5px 2px' }}>
          <div style={{ fontSize:11, fontWeight:500, color:'#1f2937', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.alias}</div>
          <div style={{ fontSize:10, color:'#9ca3af' }}>{u.edad} · {u.ciudad?.split(',')[0]}</div>
        </div>
      </div>
    )
  }

  const Section = ({ title, icon, users }: { title:string; icon:React.ReactNode; users:any[] }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#1f2937' }}>{icon}{title}</div>
        <button style={{ fontSize:12, color:'#af2245', background:'none', border:'none', cursor:'pointer', padding:0 }}>Ver más →</button>
      </div>
      {users.length === 0
        ? <p style={{ fontSize:12, color:'#9ca3af' }}>Sin perfiles disponibles aún.</p>
        : <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>{users.map(u => <ProfileCard key={u.id} u={u} />)}</div>
      }
    </div>
  )

  const SidebarContent = () => (
    <>
      {/* Mi perfil */}
      <div style={{ background:'#1e1b17', borderRadius:14, padding:16, color:'white', textAlign:'center' }}>
        <div style={{ position:'relative', display:'inline-block', marginBottom:10 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:600, color:'white' }}>
            {miPerfil?.alias?.[0]?.toUpperCase() || 'U'}
          </div>
          <span style={{ position:'absolute', bottom:2, right:2, width:13, height:13, borderRadius:'50%', background:'#22c55e', border:'2px solid #1e1b17' }} />
        </div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{miPerfil?.alias}</div>
        <div style={{ fontSize:11, opacity:0.5, marginBottom:12 }}>{miPerfil?.ciudad}</div>
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, opacity:0.6, marginBottom:4 }}><span>Perfil completado</span><span>80%</span></div>
          <div style={{ height:4, background:'rgba(255,255,255,0.15)', borderRadius:2 }}>
            <div style={{ height:'100%', borderRadius:2, width:'80%', background:'linear-gradient(90deg,#af2245,#f07855)' }} />
          </div>
        </div>
        <button onClick={() => router.push('/creditos')}
          style={{ background:'rgba(175,34,69,0.25)', border:'1px solid rgba(175,34,69,0.4)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'#f07855', display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer', marginBottom:8 }}>
          <IconFlame /> {miPerfil?.creditos} créditos
        </button><br/>
        <button onClick={() => router.push('/perfil')}
          style={{ width:'100%', padding:'7px 0', borderRadius:20, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'white', fontSize:12, cursor:'pointer' }}>
          Modificar perfil
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background:'#f9f5f0', borderRadius:14, padding:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
          <IconSearch /> Búsqueda
        </div>
        <div style={{ position:'relative', marginBottom:8 }}>
          <button onClick={() => setCiudadOpen(!ciudadOpen)}
            style={{ width:'100%', padding:'7px 10px', borderRadius:8, textAlign:'left', border:'0.5px solid #e0bec1', background:'white', fontSize:12, color: ciudadFiltro ? '#2A1840' : '#9ca3af', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
            {ciudadFiltro || 'Ciudad...'} <IconChevronDown />
          </button>
          {ciudadOpen && (
            <div style={{ position:'absolute', top:'110%', left:0, right:0, zIndex:50, background:'white', border:'0.5px solid #e0bec1', borderRadius:10, maxHeight:200, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
              <button onClick={() => { setCiudadFiltro(''); setCiudadOpen(false) }}
                style={{ width:'100%', textAlign:'left', padding:'7px 12px', fontSize:11, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' }}>
                Todas las ciudades
              </button>
              {Object.entries(CIUDADES).map(([region, cities]) => (
                <div key={region}>
                  <div style={{ padding:'5px 12px', fontSize:10, fontWeight:600, background:'#f9f5f0', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em' }}>{region}</div>
                  {cities.map(c => (
                    <button key={c} onClick={() => { setCiudadFiltro(c); setCiudadOpen(false) }}
                      style={{ width:'100%', textAlign:'left', padding:'6px 16px', fontSize:12, background: ciudadFiltro === c ? '#fff0f3' : 'none', color: ciudadFiltro === c ? '#af2245' : '#374151', border:'none', cursor:'pointer' }}>
                      {c}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>Edad: 18 – {edadMax} años</div>
          <input type="range" min={18} max={80} value={edadMax} onChange={e => setEdadMax(Number(e.target.value))} style={{ width:'100%' }} />
        </div>
        <select value={busca} onChange={e => setBusca(e.target.value)}
          style={{ width:'100%', padding:'7px 10px', borderRadius:8, fontSize:12, border:'0.5px solid #e0bec1', background:'white', marginBottom:8, color: busca ? '#2A1840' : '#9ca3af' }}>
          <option value="">¿Qué busca?</option>
          <option>Aventura discreta</option>
          <option>Amistad especial</option>
          <option>Sin compromiso</option>
          <option>Relación seria</option>
        </select>
        <select style={{ width:'100%', padding:'7px 10px', borderRadius:8, fontSize:12, border:'0.5px solid #e0bec1', background:'white', marginBottom:10, color:'#2A1840' }}>
          <option>Dentro de 10 km</option>
          <option>Dentro de 25 km</option>
          <option>Dentro de 50 km</option>
          <option>Todo el país</option>
        </select>
        <button onClick={() => { cargarPerfiles(userId); setSidebarOpen(false) }}
          style={{ width:'100%', padding:'9px 0', borderRadius:20, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(175,34,69,0.25)' }}>
          Buscar perfiles
        </button>
      </div>
    </>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .dash-grid { display: grid; grid-template-columns: 260px 1fr; max-width: 1100px; margin: 0 auto; }
        .sidebar-desktop { display: flex; flex-direction: column; gap: 16px; padding: 20px 16px; border-right: 0.5px solid #f0d4d8; min-height: calc(100vh - 52px); background: white; }
        .main-content { padding: 20px 24px; overflow-y: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 24px; }
        .bottom-nav { display: none; }
        .mobile-drawer { display: none; }
        .topbar-menu-btn { display: none; }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .sidebar-desktop { display: none !important; }
          .main-content { padding: 16px; padding-bottom: 80px; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .bottom-nav { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 0.5px solid #f0d4d8; z-index: 40; padding: 8px 0; }
          .mobile-drawer { display: block; }
          .topbar-menu-btn { display: flex !important; }
          .topbar-status { display: none !important; }
          .topbar-logout { display: none !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
        {/* Logo real */}
        <img src={LOGO} alt="LUAPP" style={{ height:34, width:'auto', objectFit:'contain' }} />

        {/* Iconos centro */}
        <div style={{ display:'flex', alignItems:'center', gap:16, color:'#6b7280' }}>
          {[
            { icon:<IconMail />, badge:3, path:'/mensajes' },
            { icon:<IconStar />, badge:0, path:'' },
            { icon:<IconEye />, badge:7, path:'' },
            { icon:<IconBell />, badge:2, path:'' },
          ].map((item, i) => (
            <button key={i} onClick={() => item.path && router.push(item.path)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', position:'relative' }}>
              {item.icon}
              <Badge n={item.badge} />
            </button>
          ))}
        </div>

        {/* Derecha desktop */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="topbar-status" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280', background:'#f9fafb', border:'0.5px solid #e5e7eb', padding:'4px 12px', borderRadius:20 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} /> Conectada
          </div>
          <button className="topbar-logout" onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
            <IconLogout /> Salir
          </button>
          {/* Botón hamburguesa mobile */}
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', alignItems:'center' }}>
            <IconMenu />
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {sidebarOpen && (
        <div className="mobile-drawer">
          {/* Overlay */}
          <div onClick={() => setSidebarOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:40 }} />
          {/* Panel */}
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:280, background:'white', zIndex:50, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <img src={LOGO} alt="LUAPP" style={{ height:28, width:'auto' }} />
              <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
                <IconX />
              </button>
            </div>
            <SidebarContent />
            <button onClick={logout} style={{ width:'100%', padding:'10px 0', borderRadius:20, border:'0.5px solid #e0bec1', background:'white', color:'#6b7280', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <IconLogout /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Grid layout */}
      <div className="dash-grid">
        {/* Sidebar desktop */}
        <div className="sidebar-desktop">
          <SidebarContent />
        </div>

        {/* Main content */}
        <div className="main-content">
          {/* Stats */}
          <div className="stats-grid">
            {[
              { num:24, lbl:'Visitantes hoy' },
              { num:8, lbl:'Flechazos recibidos' },
              { num:3, lbl:'Matches nuevos' },
              { num: miPerfil?.creditos ?? 0, lbl:'Créditos' },
            ].map(s => (
              <div key={s.lbl} style={{ background:'white', border:'0.5px solid #f0d4d8', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#af2245' }}>{s.num}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <Section title="Miembro del día" icon={<IconCrown />} users={miembrosDelDia} />
          <Section title="Nuevos miembros" icon={<IconUsers />} users={nuevos} />
          <Section
            title="Conectados ahora"
            icon={<span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />}
            users={conectados}
          />
          <Section title="Mis últimos visitantes" icon={<IconEye />} users={visitantes} />
        </div>
      </div>

      {/* Bottom nav mobile */}
      <div className="bottom-nav">
        {[
          { icon:<IconSearch />, path:'/explorar', lbl:'Explorar', active:true },
          { icon:<IconMessage />, path:'/mensajes', lbl:'Mensajes', active:false },
          { icon:<IconFlame />, path:'/creditos', lbl:'Créditos', active:false },
          { icon:<IconUser />, path:'/perfil', lbl:'Perfil', active:false },
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

