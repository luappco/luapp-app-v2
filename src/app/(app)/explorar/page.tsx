'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

/* ────────── Iconos SVG ────────── */
const IconSearch = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart = ({ filled, size = 18 }: { filled?: boolean; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconX = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconMail = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconFlame = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconCrown = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>
const IconChevronDown = ({ size = 12 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevronUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const IconChevL = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevR = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconClose = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconMessage = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>

/* Iconos grandes para stats */
const IconGauge = () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }}><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><circle cx="12" cy="14" r="1.5" fill="#ef4444"/></svg>
const IconHeartGlow = () => <svg width="46" height="46" viewBox="0 0 24 24" fill="#af2245" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMatchGlow = () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }}><circle cx="8" cy="10" r="3.2"/><circle cx="16" cy="10" r="3.2"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M10.5 20a5.5 5.5 0 0 1 11 0"/><path d="M12 4l.7 1.4 1.5.2-1.1 1.1.3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1.1 1.5-.2z" fill="#ef4444" stroke="none"/></svg>
const IconCoinGlow = () => <svg width="46" height="46" viewBox="0 0 24 24" style={{ filter:'drop-shadow(0 0 8px rgba(212,175,55,0.7))' }}><defs><linearGradient id="goldgrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fde047"/><stop offset="50%" stopColor="#d4af37"/><stop offset="100%" stopColor="#92651e"/></linearGradient></defs><circle cx="12" cy="12" r="9.5" fill="url(#goldgrad)" stroke="#92651e" strokeWidth="0.8"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5c3d0b">$</text></svg>

const CIUDADES: Record<string, string[]> = {
  'Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  'México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  'Centroamérica': ['Ciudad de Guatemala','San José (CR)','Panamá','Santo Domingo'],
  'Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata'],
  'Chile': ['Santiago','Valparaíso','Concepción'],
  'Perú': ['Lima','Arequipa','Cusco'],
  'Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  'España': ['Madrid','Barcelona','Valencia','Sevilla','Bilbao'],
  'Portugal': ['Lisboa','Oporto'],
  'Francia': ['París','Lyon','Marsella'],
}

interface Usuario { id:string; alias:string; edad:number; ciudad:string; busca:string; bio?:string; foto_principal?:string; online?:boolean; status?:string; foto_url?:string | null }
interface MiPerfil { alias:string; ciudad:string; creditos:number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [conectados, setConectados] = useState<Usuario[]>([])
  const [visitantes, setVisitantes] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [pasos, setPasos] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [carruselIdx, setCarruselIdx] = useState(0)

  const [openExp, setOpenExp] = useState(true)
  const [openBus, setOpenBus] = useState(true)
  const [openBus2, setOpenBus2] = useState(false)

  const [edadMax, setEdadMax] = useState(60)
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [ciudadOpen, setCiudadOpen] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    const [{ data: p }] = await Promise.all([
      supabase.from('usuarios').select('alias,ciudad,creditos').eq('id', uid).single(),
      cargarPerfiles(uid),
    ])
    if (p) setMiPerfil({ alias: p.alias, ciudad: p.ciudad, creditos: p.creditos || 0 })
    setCargando(false)
  }

  const cargarPerfiles = async (uid: string) => {
    const { data } = await supabase.from('usuarios').select('id,alias,edad,ciudad,busca,bio,foto_principal').neq('id', uid).limit(30)
    if (!data) return
    const statuses = ['Hablamos?', 'Buscando compañía', 'Una aventura discreta', 'Conversemos', 'Conociendo gente']
    const mapped: Usuario[] = data.map((u, i) => ({
      ...u,
      online: Math.random() > 0.4,
      status: statuses[i % statuses.length],
      foto_url: u.foto_principal
        ? (u.foto_principal.startsWith('http')
            ? u.foto_principal
            : supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl)
        : null,
    }))
    setPerfiles(mapped)
    setConectados(mapped.filter(u => u.online).slice(0, 6))
    setVisitantes(mapped.slice(0, 9))
  }

  const darFlechazo = async (targetId: string) => {
    if (flechazosEnviados.has(targetId)) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const uid = session.user.id
    const { data: c } = await supabase.from('usuarios').select('creditos').eq('id', uid).single()
    if (!c || c.creditos < 1) { router.push('/creditos'); return }
    await supabase.from('flechazos').insert({ emisor: uid, receptor: targetId })
    await supabase.rpc('sumar_creditos', { uid, monto: -1 })
    setFlechazosEnviados(prev => new Set([...prev, targetId]))
    setMiPerfil(prev => prev ? { ...prev, creditos: prev.creditos - 1 } : prev)
    const { data: mutuo } = await supabase.from('flechazos').select('id').eq('emisor', targetId).eq('receptor', uid).single()
    if (mutuo) {
      const u1 = uid < targetId ? uid : targetId
      const u2 = uid < targetId ? targetId : uid
      await supabase.from('matches').upsert({ usuario1: u1, usuario2: u2 })
    }
  }

  const darPaso = (id: string) => setPasos(prev => new Set([...prev, id]))

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#1a0f2e', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:140, height:'auto', filter:'brightness(1.2)' }} />
      <div style={{ width:30, height:30, border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #d4af37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const Badge = ({ n }: { n: number }) => n > 0 ? (
    <span style={{ position:'absolute', top:-4, right:-4, background:'#af2245', color:'white', borderRadius:'50%', minWidth:14, height:14, fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'1.5px solid #1a0f2e' }}>{n}</span>
  ) : null

  const visiblesCarrusel = perfiles.slice(carruselIdx, carruselIdx + 3)

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <>
      {/* Expandida: Mi perfil */}
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(212,175,55,0.18)', overflow:'hidden' }}>
        <button onClick={() => setOpenExp(!openExp)}
          style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#d4af37', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>
          EXPANDIDA <span style={{ display:'flex' }}>{openExp ? <IconChevronUp /> : <IconChevronDown size={14} />}</span>
        </button>
        {openExp && (
          <div style={{ padding:'0 14px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:12 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:600, color:'white', border:'2px solid rgba(212,175,55,0.4)' }}>
                  {miPerfil?.alias?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid #1a0f2e' }} />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'white' }}>{miPerfil?.alias}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{miPerfil?.ciudad} · <span style={{ color:'#d4af37' }}>Nivel: Oro</span></div>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:4 }}><span>Completado</span><span style={{ fontWeight:700, color:'white' }}>80%</span></div>
              <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                <div style={{ height:'100%', borderRadius:3, width:'80%', background:'linear-gradient(90deg,#af2245,#f07855)', boxShadow:'0 0 8px rgba(240,120,85,0.5)' }} />
              </div>
            </div>
            <button onClick={() => router.push('/perfil')}
              style={{ width:'100%', padding:'8px 0', borderRadius:20, border:'1px solid rgba(212,175,55,0.4)', background:'transparent', color:'#d4af37', fontSize:11, fontWeight:600, cursor:'pointer' }}>
              Modificar perfil
            </button>
          </div>
        )}
      </div>

      {/* Búsqueda */}
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(212,175,55,0.18)', overflow:'hidden' }}>
        <button onClick={() => setOpenBus(!openBus)}
          style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#d4af37', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><IconSearch /> BÚSQUEDA</span>
          {openBus ? <IconChevronUp /> : <IconChevronDown size={14} />}
        </button>
        {openBus && (
          <div style={{ padding:'0 14px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ position:'relative' }}>
              <button onClick={() => setCiudadOpen(!ciudadOpen)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, textAlign:'left', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', fontSize:12, color: ciudadFiltro ? 'white' : 'rgba(255,255,255,0.5)', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                {ciudadFiltro || 'Ciudad...'} <IconChevronDown size={12} />
              </button>
              {ciudadOpen && (
                <div style={{ position:'absolute', top:'105%', left:0, right:0, zIndex:50, background:'#241638', border:'1px solid rgba(212,175,55,0.3)', borderRadius:10, maxHeight:200, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.5)' }}>
                  <button onClick={() => { setCiudadFiltro(''); setCiudadOpen(false) }}
                    style={{ width:'100%', textAlign:'left', padding:'7px 12px', fontSize:11, color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer' }}>
                    Todas las ciudades
                  </button>
                  {Object.entries(CIUDADES).map(([region, cities]) => (
                    <div key={region}>
                      <div style={{ padding:'5px 12px', fontSize:10, fontWeight:600, background:'rgba(255,255,255,0.04)', color:'#d4af37', textTransform:'uppercase', letterSpacing:'0.05em' }}>{region}</div>
                      {cities.map(c => (
                        <button key={c} onClick={() => { setCiudadFiltro(c); setCiudadOpen(false) }}
                          style={{ width:'100%', textAlign:'left', padding:'6px 16px', fontSize:12, background: ciudadFiltro === c ? 'rgba(212,175,55,0.12)' : 'none', color: ciudadFiltro === c ? '#d4af37' : 'rgba(255,255,255,0.85)', border:'none', cursor:'pointer' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:4 }}>Edad: 18 – {edadMax} años</div>
              <input type="range" min={18} max={80} value={edadMax} onChange={e => setEdadMax(Number(e.target.value))} style={{ width:'100%', accentColor:'#d4af37' }} />
            </div>
            <select value={busca} onChange={e => setBusca(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:12, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color: busca ? 'white' : 'rgba(255,255,255,0.5)' }}>
              <option value="" style={{ background:'#241638' }}>¿Qué busca?</option>
              <option style={{ background:'#241638' }}>Aventura discreta</option>
              <option style={{ background:'#241638' }}>Amistad especial</option>
              <option style={{ background:'#241638' }}>Sin compromiso</option>
              <option style={{ background:'#241638' }}>Relación seria</option>
            </select>
            <select style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:12, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'white' }}>
              <option style={{ background:'#241638' }}>Dentro de 10 km</option>
              <option style={{ background:'#241638' }}>Dentro de 25 km</option>
              <option style={{ background:'#241638' }}>Dentro de 50 km</option>
              <option style={{ background:'#241638' }}>Todo el país</option>
            </select>
            <select style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:12, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)' }}>
              <option style={{ background:'#241638' }}>Género</option>
              <option style={{ background:'#241638' }}>Mujer</option>
              <option style={{ background:'#241638' }}>Hombre</option>
            </select>
          </div>
        )}
      </div>

      {/* Búsqueda secundaria */}
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(212,175,55,0.18)', overflow:'hidden' }}>
        <button onClick={() => setOpenBus2(!openBus2)}
          style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#d4af37', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>
          BÚSQUEDA {openBus2 ? <IconChevronUp /> : <IconChevronDown size={14} />}
        </button>
      </div>

      {/* Botón dorado */}
      <button onClick={() => { cargarPerfiles(userId); setSidebarOpen(false) }}
        style={{ width:'100%', padding:'14px 0', borderRadius:30, border:'none', background:'linear-gradient(135deg,#f5d77a,#d4af37,#92651e)', color:'#2A1840', fontSize:12, fontWeight:800, cursor:'pointer', letterSpacing:'0.08em', boxShadow:'0 0 18px rgba(212,175,55,0.35)' }}>
        BUSCAR PERFILES
      </button>
    </>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color:'white' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        * { box-sizing: border-box }
        .dash-grid { display: grid; grid-template-columns: 260px 1fr; gap: 18px; max-width: 1380px; margin: 0 auto; padding: 18px; }
        .sidebar-desktop { display: flex; flex-direction: column; gap: 12px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 14px; }
        .content-grid { display: grid; grid-template-columns: 1fr 310px 290px; gap: 14px; align-items: start; }
        .stat-card { position: relative; background: linear-gradient(160deg,rgba(60,30,90,0.55),rgba(40,15,60,0.7)); border: 1px solid rgba(212,175,55,0.25); border-radius: 18px; padding: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
        .stat-card::before { content:''; position: absolute; inset: 0; border-radius: 18px; padding: 1px; background: linear-gradient(135deg,rgba(212,175,55,0.5),transparent 50%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .card-w { background: linear-gradient(160deg,rgba(60,30,90,0.55),rgba(40,15,60,0.7)); border: 1px solid rgba(212,175,55,0.22); border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
        .bottom-nav { display: none; }
        .mobile-drawer { display: none; }
        .topbar-menu-btn { display: none !important; }
        @media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr; padding: 12px; }
          .sidebar-desktop { display: none; }
          .stats-grid { grid-template-columns: repeat(2,1fr); gap: 10px; }
          .content-grid { grid-template-columns: 1fr; }
          .bottom-nav { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0; background: #1a0f2e; border-top: 1px solid rgba(212,175,55,0.2); z-index: 40; padding: 8px 0; }
          .mobile-drawer { display: block; }
          .topbar-menu-btn { display: flex !important; }
          .topbar-status { display: none !important; }
          .topbar-logout { display: none !important; }
          .main-wrap { padding-bottom: 80px; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background:'rgba(26,15,46,0.85)', borderBottom:'1px solid rgba(212,175,55,0.22)', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, backdropFilter:'blur(8px)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:32, width:'auto', filter:'brightness(1.3)' }} />

        <div style={{ display:'flex', alignItems:'center', gap:22, color:'#d4af37' }}>
          {[
            { icon:<IconMail />, badge:3, path:'/mensajes' },
            { icon:<IconStar />, badge:0, path:'' },
            { icon:<IconEye />, badge:2, path:'' },
            { icon:<IconBell />, badge:1, path:'' },
          ].map((item, i) => (
            <button key={i} onClick={() => item.path && router.push(item.path)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.85)', position:'relative', padding:2 }}>
              {item.icon}
              <Badge n={item.badge} />
            </button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="topbar-status" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'white', background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', padding:'5px 14px', borderRadius:20 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e' }} /> Conectada
          </div>
          <button className="topbar-logout" onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
            <IconLogout /> Salir
          </button>
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#d4af37', alignItems:'center' }}>
            <IconMenu />
          </button>
        </div>
      </div>

      {/* Drawer móvil */}
      {sidebarOpen && (
        <div className="mobile-drawer">
          <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40 }} />
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:300, background:'#1a0f2e', zIndex:50, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <img src={LOGO} alt="LUAPP" style={{ height:28, filter:'brightness(1.3)' }} />
              <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#d4af37' }}>
                <IconClose />
              </button>
            </div>
            <SidebarContent />
            <button onClick={logout} style={{ width:'100%', padding:'10px 0', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.7)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <IconLogout /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* ── Layout ── */}
      <div className="dash-grid main-wrap">
        <div className="sidebar-desktop">
          <SidebarContent />
        </div>

        <div>
          {/* Stats */}
          <div className="stats-grid">
            {/* Visitantes hoy */}
            <div className="stat-card">
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:14 }}>Visitantes de hoy</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:38, fontWeight:800, color:'white', lineHeight:1 }}>24</div>
                <IconGauge />
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>
                Visitas únicas: 24<br/>Repetidos: 12
              </div>
            </div>

            {/* Flechazos */}
            <div className="stat-card">
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:14 }}>Flechazos recibidos</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:38, fontWeight:800, color:'white', lineHeight:1 }}>8</div>
                <IconHeartGlow />
              </div>
              <div style={{ display:'inline-block', fontSize:10, fontWeight:700, color:'#fef3c7', background:'linear-gradient(135deg,#92400e,#d4af37)', padding:'4px 14px', borderRadius:12, clipPath:'polygon(0 0,100% 0,90% 50%,100% 100%,0 100%)' }}>
                Top 5%
              </div>
            </div>

            {/* Matches */}
            <div className="stat-card">
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:14 }}>Matches nuevos</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:38, fontWeight:800, color:'white', lineHeight:1 }}>3</div>
                <IconMatchGlow />
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>
                Matches totales: 12<br/>Pendientes: 2
              </div>
            </div>

            {/* Créditos */}
            <div className="stat-card">
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:14 }}>Mis Créditos</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:38, fontWeight:800, color:'white', lineHeight:1 }}>{miPerfil?.creditos ?? 0}</div>
                <IconCoinGlow />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => router.push('/creditos')}
                  style={{ fontSize:10, fontWeight:800, color:'#d4af37', background:'transparent', border:'1px solid #d4af37', borderRadius:14, padding:'4px 14px', cursor:'pointer', letterSpacing:'0.06em' }}>
                  RECARGAR
                </button>
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)' }}>Última: hoy</span>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="content-grid">
            {/* Carrusel */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, fontWeight:700, color:'white' }}>
                  Miembro del Día <IconCrown /> Nuevos Miembros
                </div>
                <button style={{ fontSize:12, fontWeight:600, color:'#d4af37', background:'none', border:'none', cursor:'pointer' }}>Ver más →</button>
              </div>

              {perfiles.length === 0 ? (
                <div style={{ padding:'40px 0', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>
                  <p style={{ fontSize:13, margin:0 }}>Sin perfiles disponibles aún.</p>
                </div>
              ) : (
                <div style={{ position:'relative' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {visiblesCarrusel.map((u, idx) => {
                      const enviado = flechazosEnviados.has(u.id)
                      const esDestacado = idx === 0 && carruselIdx === 0
                      return (
                        <div key={u.id} style={{ borderRadius:14, overflow:'hidden', position:'relative', background:'#1a0f2e', boxShadow: esDestacado ? '0 0 18px rgba(239,68,68,0.55), 0 0 4px rgba(239,68,68,0.8) inset' : '0 4px 12px rgba(0,0,0,0.3)', border: esDestacado ? '1px solid rgba(239,68,68,0.7)' : '1px solid rgba(212,175,55,0.18)' }}>
                          <div style={{ position:'relative', aspectRatio:'3/3.6', background:'linear-gradient(160deg,#2A1840,#af2245)' }}>
                            {u.foto_url
                              ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}><IconUser size={42} /></div>
                            }
                            {/* Overlay info */}
                            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'30px 12px 12px', background:'linear-gradient(to top,rgba(0,0,0,0.92) 30%,transparent)' }}>
                              <div style={{ fontSize:15, fontWeight:700, color:'white', fontStyle:'italic', marginBottom:3 }}>{u.alias}, {u.edad}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                Bio: {u.bio || u.busca || 'Conociendo gente nueva'}
                              </div>
                            </div>
                            {/* Botones acción flotantes */}
                            <div style={{ position:'absolute', top:8, right:8, display:'flex', flexDirection:'column', gap:6 }}>
                              <button onClick={() => darFlechazo(u.id)}
                                style={{ width:30, height:30, borderRadius:'50%', border:'none', background: enviado ? '#af2245' : 'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <IconHeart filled={enviado} size={14} />
                              </button>
                              <button onClick={() => darPaso(u.id)}
                                style={{ width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)', color: pasos.has(u.id) ? '#9ca3af' : 'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <IconX />
                              </button>
                            </div>
                            {u.online && <span style={{ position:'absolute', top:10, left:10, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'2px solid white' }} />}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {perfiles.length > 3 && (
                    <>
                      <button onClick={() => setCarruselIdx(i => Math.max(0, i - 3))}
                        disabled={carruselIdx === 0}
                        style={{ position:'absolute', left:-14, top:'46%', width:38, height:38, borderRadius:'50%', background:'rgba(40,15,60,0.95)', border:'1px solid rgba(212,175,55,0.4)', boxShadow:'0 4px 12px rgba(0,0,0,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: carruselIdx === 0 ? 'rgba(255,255,255,0.25)' : '#d4af37' }}>
                        <IconChevL size={18} />
                      </button>
                      <button onClick={() => setCarruselIdx(i => Math.min(Math.max(0, perfiles.length - 3), i + 3))}
                        disabled={carruselIdx >= perfiles.length - 3}
                        style={{ position:'absolute', right:-14, top:'46%', width:38, height:38, borderRadius:'50%', background:'rgba(40,15,60,0.95)', border:'1px solid rgba(212,175,55,0.4)', boxShadow:'0 4px 12px rgba(0,0,0,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: carruselIdx >= perfiles.length - 3 ? 'rgba(255,255,255,0.25)' : '#d4af37' }}>
                        <IconChevR size={18} />
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {perfiles.length > 3 && (
                    <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
                      {Array.from({ length: Math.ceil(perfiles.length / 3) }).map((_, i) => (
                        <div key={i}
                          onClick={() => setCarruselIdx(i * 3)}
                          style={{ width: Math.floor(carruselIdx / 3) === i ? 22 : 6, height:5, borderRadius:3, background: Math.floor(carruselIdx / 3) === i ? '#d4af37' : 'rgba(255,255,255,0.2)', cursor:'pointer', transition:'all 0.2s' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conectados */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:14 }}>Conectados ahora</div>
              {conectados.length === 0 ? (
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>Nadie conectado en este momento.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {conectados.map(u => (
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:11, cursor:'pointer' }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:46, height:46, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#2A1840,#af2245)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>
                          {u.foto_url
                            ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <IconUser size={20} />}
                        </div>
                        <span style={{ position:'absolute', bottom:0, right:0, width:11, height:11, borderRadius:'50%', background:'#22c55e', border:'2px solid #1a0f2e' }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.alias}, {u.edad}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{u.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visitantes */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:14 }}>Recientes Visitantes</div>
              {visitantes.length === 0 ? (
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>Aún no tienes visitantes.</p>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {visitantes.slice(0, 9).map(u => (
                      <div key={u.id} style={{ aspectRatio:'1', borderRadius:10, overflow:'hidden', background:'linear-gradient(135deg,#2A1840,#af2245)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(212,175,55,0.15)' }}>
                        {u.foto_url
                          ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <IconUser size={22} />}
                      </div>
                    ))}
                  </div>
                  <button style={{ fontSize:12, fontWeight:600, color:'#d4af37', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:12 }}>Ver más →</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav móvil */}
      <div className="bottom-nav">
        {[
          { icon:<IconSearch />, path:'/explorar', lbl:'Explorar', active:true },
          { icon:<IconMessage size={16} />, path:'/mensajes', lbl:'Mensajes', active:false },
          { icon:<IconFlame size={16} />, path:'/creditos', lbl:'Créditos', active:false },
          { icon:<IconUser size={16} />, path:'/perfil', lbl:'Perfil', active:false },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: item.active ? '#d4af37' : 'rgba(255,255,255,0.5)', fontSize:10 }}>
            {item.icon}
            <span>{item.lbl}</span>
            {item.active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#d4af37' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
