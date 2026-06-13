'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICONOS SVG
// ═══════════════════════════════════════════════════════════════════════════════════════

const IconSearch = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart = ({ filled, size = 18 }: { filled?: boolean; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconX = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconClose = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconMail = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = ({ filled = false }: { filled?: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#d4af37' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = ({ filled = false }: { filled?: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconFlame = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconCrown = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>
const IconChevronDown = ({ size = 12 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevronUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const IconChevL = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevR = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconMessage = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m6.08 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m6.08 0l4.24 4.24"/></svg>
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

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
interface MiPerfil { id: string; alias:string; ciudad:string; creditos:number; edad?:number; genero?:string; bio?:string; email?:string; foto_principal?:string }
interface Flechazo { id: string; alias: string; edad: number; foto_url?: string | null }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  // ═════ Estados principales
  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [conectados, setConectados] = useState<Usuario[]>([])
  const [visitantes, setVisitantes] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [saltados, setSaltados] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [carruselIdx, setCarruselIdx] = useState(0)

  // ═════ Estados filtros
  const [openExp, setOpenExp] = useState(true)
  const [openBus, setOpenBus] = useState(true)
  const [openBus2, setOpenBus2] = useState(false)
  const [edadMax, setEdadMax] = useState(60)
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [ciudadOpen, setCiudadOpen] = useState(false)
  const [busca, setBusca] = useState('')

  // ═════ Estados modales
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<(Usuario & { flechazosRecibidos: Flechazo[] }) | null>(null)
  const [modalMiPerfil, setModalMiPerfil] = useState(false)
  const [modalMensajes, setModalMensajes] = useState(false)
  const [modalCreditos, setModalCreditos] = useState(false)
  const [modalNotificaciones, setModalNotificaciones] = useState(false)
  const [modalFavoritos, setModalFavoritos] = useState(false)

  const [flechazosRecibidos, setFlechazosRecibidos] = useState<any>([])
  const [notificacionesCount, setNotificacionesCount] = useState(0)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    const { data: p } = await supabase.from('usuarios').select('*').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, ciudad: p.ciudad, creditos: p.creditos || 0, edad: p.edad, genero: p.genero, bio: p.bio, email: p.email, foto_principal: p.foto_principal })
    cargarPerfiles(uid)
    const { count: notifCount } = await supabase.from('flechazos').select('*', { count: 'exact' }).eq('receptor', uid)
    setNotificacionesCount(notifCount || 0)
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

  const abrirPerfil = async (usuario: Usuario) => {
    const { data: flechazos } = await supabase.from('flechazos').select('emisor').eq('receptor', usuario.id)
    let flechazosRecibidos: Flechazo[] = []
    if (flechazos && flechazos.length > 0) {
      const emisoresIds = flechazos.map(f => f.emisor)
      const { data: emisores } = await supabase.from('usuarios').select('id, alias, edad, foto_principal').in('id', emisoresIds)
      if (emisores) {
        flechazosRecibidos = emisores.map(e => ({
          id: e.id,
          alias: e.alias,
          edad: e.edad,
          foto_url: e.foto_principal
            ? (e.foto_principal.startsWith('http')
                ? e.foto_principal
                : supabase.storage.from('fotos').getPublicUrl(e.foto_principal).data.publicUrl)
            : null,
        }))
      }
    }
    setPerfilSeleccionado({ ...usuario, flechazosRecibidos })
  }

  const cargarFavoritos = async () => {
    const { data } = await supabase.from('flechazos').select('receptor').eq('emisor', userId)
    if (data) {
      const receptorIds = data.map(f => f.receptor)
      const { data: users } = await supabase.from('usuarios').select('id, alias, edad, ciudad, busca, bio, foto_principal').in('id', receptorIds)
      if (users) {
        const mapped = users.map(u => ({
          ...u,
          foto_url: u.foto_principal
            ? (u.foto_principal.startsWith('http')
                ? u.foto_principal
                : supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl)
            : null,
        }))
        setFlechazosRecibidos(mapped)
      }
    }
  }

  const darFlechazo = async (targetId: string) => {
    if (flechazosEnviados.has(targetId)) return
    const { data: c } = await supabase.from('usuarios').select('creditos').eq('id', userId).single()
    if (!c || c.creditos < 1) { setModalCreditos(true); return }
    await supabase.from('flechazos').insert({ emisor: userId, receptor: targetId })
    await supabase.rpc('sumar_creditos', { uid: userId, monto: -1 })
    setFlechazosEnviados(prev => new Set([...prev, targetId]))
    setMiPerfil(prev => prev ? { ...prev, creditos: prev.creditos - 1 } : prev)
    if (perfilSeleccionado && perfilSeleccionado.id === targetId) {
      const { data: flechazos } = await supabase.from('flechazos').select('emisor').eq('receptor', targetId)
      let flechazosRecibidos: Flechazo[] = []
      if (flechazos && flechazos.length > 0) {
        const emisoresIds = flechazos.map(f => f.emisor)
        const { data: emisores } = await supabase.from('usuarios').select('id, alias, edad, foto_principal').in('id', emisoresIds)
        if (emisores) {
          flechazosRecibidos = emisores.map(e => ({
            id: e.id,
            alias: e.alias,
            edad: e.edad,
            foto_url: e.foto_principal
              ? (e.foto_principal.startsWith('http')
                  ? e.foto_principal
                  : supabase.storage.from('fotos').getPublicUrl(e.foto_principal).data.publicUrl)
              : null,
          }))
        }
      }
      setPerfilSeleccionado(prev => prev ? { ...prev, flechazosRecibidos } : prev)
    }
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const cerrarTodo = () => {
    setPerfilSeleccionado(null)
    setModalMiPerfil(false)
    setModalMensajes(false)
    setModalCreditos(false)
    setModalNotificaciones(false)
    setModalFavoritos(false)
  }

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

  const perfilesVisibles = perfiles.filter(p => !saltados.has(p.id))
  const visiblesCarrusel = perfilesVisibles.slice(carruselIdx, carruselIdx + 3)

  const ModalBase = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, backdropFilter:'blur(4px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:101, maxWidth:520, maxHeight:'90vh', overflowY:'auto', background:'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', borderRadius:20, border:'1px solid rgba(212,175,55,0.22)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:18, borderBottom:'1px solid rgba(212,175,55,0.1)', position:'sticky', top:0, background:'rgba(26,15,46,0.9)', zIndex:102 }}>
          <h2 style={{ margin:0, color:'white', fontSize:16, fontWeight:700 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#d4af37', display:'flex', alignItems:'center' }}>
            <IconClose />
          </button>
        </div>
        <div style={{ padding:18 }}>
          {children}
        </div>
      </div>
    </>
  )

  const SidebarContent = () => (
    <>
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
            <button onClick={() => { setModalMiPerfil(true); setSidebarOpen(false) }}
              style={{ width:'100%', padding:'8px 0', borderRadius:20, border:'1px solid rgba(212,175,55,0.4)', background:'transparent', color:'#d4af37', fontSize:11, fontWeight:600, cursor:'pointer' }}>
              Ver perfil completo
            </button>
          </div>
        )}
      </div>

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
          </div>
        )}
      </div>

      <button onClick={() => { cargarPerfiles(userId); setSidebarOpen(false) }}
        style={{ width:'100%', padding:'14px 0', borderRadius:30, border:'none', background:'linear-gradient(135deg,#f5d77a,#d4af37,#92651e)', color:'#2A1840', fontSize:12, fontWeight:800, cursor:'pointer', letterSpacing:'0.08em', boxShadow:'0 0 18px rgba(212,175,55,0.35)' }}>
        BUSCAR PERFILES
      </button>
    </>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color:'white', position:'relative' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        * { box-sizing: border-box }
        .dash-grid { display: grid; grid-template-columns: 260px 1fr; gap: 18px; max-width: 1380px; margin: 0 auto; padding: 18px; }
        .sidebar-desktop { display: flex; flex-direction: column; gap: 12px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 14px; }
        .content-grid { display: grid; grid-template-columns: 1fr 310px 290px; gap: 14px; align-items: start; }
        .stat-card { position: relative; background: linear-gradient(160deg,rgba(60,30,90,0.55),rgba(40,15,60,0.7)); border: 1px solid rgba(212,175,55,0.25); border-radius: 18px; padding: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
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

      {/* ──────── TOP BAR ────────── */}
      <div style={{ background:'rgba(26,15,46,0.85)', borderBottom:'1px solid rgba(212,175,55,0.22)', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, backdropFilter:'blur(8px)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:32, width:'auto', filter:'brightness(1.3)' }} />

        <div style={{ display:'flex', alignItems:'center', gap:22, color:'#d4af37' }}>
          {[
            { icon:<IconMail />, badge:3, click:() => { setModalMensajes(true) } },
            { icon:<IconStar />, badge:0, click:() => { setModalFavoritos(true); cargarFavoritos() } },
            { icon:<IconEye />, badge:2, click:() => {} },
            { icon:<IconBell filled={notificacionesCount > 0} />, badge: notificacionesCount, click:() => { setModalNotificaciones(true) } },
          ].map((item, i) => (
            <button key={i} onClick={item.click}
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

      {/* ──────── DRAWER MÓVIL ────────── */}
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

      {/* ──────── LAYOUT PRINCIPAL ────────── */}
      <div className="dash-grid main-wrap">
        <div className="sidebar-desktop">
          <SidebarContent />
        </div>

        <div>
          <div className="stats-grid">
            {[
              { num:24, lbl:'Visitantes de hoy', icon:<IconGauge />, tag:'+32%', tagColor:'#16a34a', tagBg:'#f0fdf4' },
              { num:8, lbl:'Flechazos recibidos', icon:<IconHeartGlow />, tag:'Top 5%', tagColor:'#92400e', tagBg:'#fef3c7' },
              { num:3, lbl:'Matches nuevos', icon:<IconMatchGlow />, tag:'Chatea ya', tagColor:'#af2245', tagBg:'#fff0f3', tagClick:'msg' },
              { num: miPerfil?.creditos ?? 0, lbl:'Mis créditos', icon:<IconCoinGlow />, tag:'Recargar', tagColor:'white', tagBg:'linear-gradient(135deg,#af2245,#f07855)', tagClick:'cred' },
            ].map(s => (
              <div key={s.lbl} className="stat-card">
                <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:10 }}>{s.lbl}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontSize:32, fontWeight:800, color:'#1e1b17', lineHeight:1 }}>{s.num}</div>
                  {s.icon}
                </div>
                <button
                  onClick={() => {
                    if (s.tagClick === 'msg') setModalMensajes(true)
                    if (s.tagClick === 'cred') setModalCreditos(true)
                  }}
                  style={{ fontSize:11, fontWeight:700, color:s.tagColor, background:s.tagBg, border:'none', borderRadius:14, padding:'4px 12px', cursor: s.tagClick ? 'pointer' : 'default' }}>
                  {s.tag}
                </button>
              </div>
            ))}
          </div>

          <div className="content-grid">
            {/* CARRUSEL */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, fontWeight:700, color:'white' }}>
                  Miembro del día <IconCrown /> Nuevos
                </div>
              </div>

              {perfilesVisibles.length === 0 ? (
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
                        <div key={u.id} style={{ borderRadius:14, overflow:'hidden', position:'relative', background:'#1a0f2e', boxShadow: esDestacado ? '0 0 18px rgba(239,68,68,0.55), 0 0 4px rgba(239,68,68,0.8) inset' : '0 4px 12px rgba(0,0,0,0.3)', border: esDestacado ? '1px solid rgba(239,68,68,0.7)' : '1px solid rgba(212,175,55,0.18)', cursor:'pointer' }} onClick={() => abrirPerfil(u)}>
                          <div style={{ position:'relative', aspectRatio:'3/3.6', background:'linear-gradient(160deg,#2A1840,#af2245)' }}>
                            {u.foto_url
                              ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}><IconUser size={42} /></div>
                            }
                            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'30px 12px 12px', background:'linear-gradient(to top,rgba(0,0,0,0.92) 30%,transparent)' }}>
                              <div style={{ fontSize:15, fontWeight:700, color:'white', fontStyle:'italic', marginBottom:3 }}>{u.alias}, {u.edad}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                Bio: {u.bio || u.busca || 'Conociendo gente nueva'}
                              </div>
                            </div>
                            <div style={{ position:'absolute', top:8, right:8, display:'flex', flexDirection:'column', gap:6 }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => darFlechazo(u.id)}
                                style={{ width:30, height:30, borderRadius:'50%', border:'none', background: enviado ? '#af2245' : 'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <IconHeart filled={enviado} size={14} />
                              </button>
                              <button onClick={() => setSaltados(prev => new Set([...prev, u.id]))}
                                style={{ width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <IconX size={12} />
                              </button>
                            </div>
                            {u.online && <span style={{ position:'absolute', top:10, left:10, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'2px solid white' }} />}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {perfilesVisibles.length > 3 && (
                    <>
                      <button onClick={() => setCarruselIdx(i => Math.max(0, i - 3))}
                        disabled={carruselIdx === 0}
                        style={{ position:'absolute', left:-14, top:'46%', width:38, height:38, borderRadius:'50%', background:'rgba(40,15,60,0.95)', border:'1px solid rgba(212,175,55,0.4)', boxShadow:'0 4px 12px rgba(0,0,0,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: carruselIdx === 0 ? 'rgba(255,255,255,0.25)' : '#d4af37' }}>
                        <IconChevL size={18} />
                      </button>
                      <button onClick={() => setCarruselIdx(i => Math.min(Math.max(0, perfilesVisibles.length - 3), i + 3))}
                        disabled={carruselIdx >= perfilesVisibles.length - 3}
                        style={{ position:'absolute', right:-14, top:'46%', width:38, height:38, borderRadius:'50%', background:'rgba(40,15,60,0.95)', border:'1px solid rgba(212,175,55,0.4)', boxShadow:'0 4px 12px rgba(0,0,0,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: carruselIdx >= perfilesVisibles.length - 3 ? 'rgba(255,255,255,0.25)' : '#d4af37' }}>
                        <IconChevR size={18} />
                      </button>
                    </>
                  )}

                  {perfilesVisibles.length > 3 && (
                    <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
                      {Array.from({ length: Math.ceil(perfilesVisibles.length / 3) }).map((_, i) => (
                        <div key={i}
                          onClick={() => setCarruselIdx(i * 3)}
                          style={{ width: Math.floor(carruselIdx / 3) === i ? 22 : 6, height:5, borderRadius:3, background: Math.floor(carruselIdx / 3) === i ? '#d4af37' : 'rgba(255,255,255,0.2)', cursor:'pointer', transition:'all 0.2s' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CONECTADOS */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:14 }}>Conectados ahora</div>
              {conectados.length === 0 ? (
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>Nadie conectado.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {conectados.map(u => (
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:11, cursor:'pointer' }} onClick={() => abrirPerfil(u)}>
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

            {/* VISITANTES */}
            <div className="card-w" style={{ padding:18 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:14 }}>Recientes Visitantes</div>
              {visitantes.length === 0 ? (
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>Aún no tienes visitantes.</p>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {visitantes.slice(0, 9).map(u => (
                      <div key={u.id} style={{ aspectRatio:'1', borderRadius:10, overflow:'hidden', background:'linear-gradient(135deg,#2A1840,#af2245)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(212,175,55,0.15)' }} onClick={() => abrirPerfil(u)}>
                        {u.foto_url
                          ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <IconUser size={22} />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════ MODALES ═════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}

      {/* MODAL PERFIL USUARIO SELECCIONADO */}
      {perfilSeleccionado && (
        <ModalBase title={perfilSeleccionado.alias} onClose={() => setPerfilSeleccionado(null)}>
          <div style={{ borderRadius:16, overflow:'hidden', aspectRatio:'3/4', background:'linear-gradient(160deg,#2A1840,#af2245)', marginBottom:16, border:'1px solid rgba(212,175,55,0.22)' }}>
            {perfilSeleccionado.foto_url
              ? <img src={perfilSeleccionado.foto_url} alt={perfilSeleccionado.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}><IconUser size={60} /></div>
            }
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:14, padding:14, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:24, fontWeight:800, color:'white' }}>{perfilSeleccionado.alias}</span>
              <span style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{perfilSeleccionado.edad}</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:12 }}>{perfilSeleccionado.ciudad}</div>
            {perfilSeleccionado.bio && (
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.85)', fontStyle:'italic', margin:0, marginBottom:10, lineHeight:1.5 }}>"{perfilSeleccionado.bio}"</p>
            )}
            <div style={{ fontSize:11, color:'#d4af37', fontWeight:600, background:'rgba(212,175,55,0.12)', padding:'5px 10px', borderRadius:6, display:'inline-block' }}>
              {perfilSeleccionado.busca}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            <button onClick={() => darFlechazo(perfilSeleccionado.id)}
              disabled={flechazosEnviados.has(perfilSeleccionado.id)}
              style={{ padding:'12px 0', borderRadius:14, border:'none', background: flechazosEnviados.has(perfilSeleccionado.id) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#af2245,#f07855)', color: flechazosEnviados.has(perfilSeleccionado.id) ? 'rgba(255,255,255,0.5)' : 'white', fontSize:12, fontWeight:700, cursor: flechazosEnviados.has(perfilSeleccionado.id) ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <IconHeart filled={flechazosEnviados.has(perfilSeleccionado.id)} /> {flechazosEnviados.has(perfilSeleccionado.id) ? 'Enviado' : 'Flechazo'}
            </button>
            <button onClick={() => { setPerfilSeleccionado(null); setModalMensajes(true) }}
              style={{ padding:'12px 0', borderRadius:14, border:'1px solid rgba(212,175,55,0.4)', background:'transparent', color:'#d4af37', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <IconMessage /> Mensaje
            </button>
          </div>
          {perfilSeleccionado.flechazosRecibidos.length > 0 && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:14, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:12 }}>
                ❤️ Flechazos recibidos ({perfilSeleccionado.flechazosRecibidos.length})
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {perfilSeleccionado.flechazosRecibidos.map(f => (
                  <div key={f.id} style={{ borderRadius:10, overflow:'hidden', aspectRatio:'1', background:'linear-gradient(135deg,#2A1840,#af2245)', border:'1px solid rgba(212,175,55,0.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)' }}>
                    {f.foto_url
                      ? <img src={f.foto_url} alt={f.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <IconUser size={16} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBase>
      )}

      {/* MODAL MI PERFIL */}
      {modalMiPerfil && (
        <ModalBase title="Mi Perfil" onClose={() => setModalMiPerfil(false)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div style={{ borderRadius:12, overflow:'hidden', aspectRatio:'1', background:'linear-gradient(135deg,#2A1840,#af2245)', border:'1px solid rgba(212,175,55,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}>
              {miPerfil?.foto_principal
                ? <img src={miPerfil.foto_principal} alt="Tu foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <IconUser size={40} />}
            </div>
            <div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, marginBottom:12 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:4 }}>Alias</div>
                <div style={{ fontSize:16, fontWeight:700, color:'white', marginBottom:8 }}>{miPerfil?.alias}</div>
                <button style={{ width:'100%', padding:'6px 0', borderRadius:8, border:'1px solid rgba(212,175,55,0.3)', background:'transparent', color:'#d4af37', fontSize:10, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                  <IconEdit /> Editar
                </button>
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:4 }}>Créditos</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#d4af37', marginBottom:8 }}>{miPerfil?.creditos}</div>
                <button onClick={() => { setModalMiPerfil(false); setModalCreditos(true) }} style={{ width:'100%', padding:'6px 0', borderRadius:8, border:'1px solid rgba(212,175,55,0.3)', background:'transparent', color:'#d4af37', fontSize:10, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                  <IconPlus /> Recargar
                </button>
              </div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'white', marginBottom:10 }}>Datos personales</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:2 }}>Ciudad</div>
                <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{miPerfil?.ciudad}</div>
              </div>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:2 }}>Edad</div>
                <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{miPerfil?.edad} años</div>
              </div>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:2 }}>Género</div>
                <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{miPerfil?.genero}</div>
              </div>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:2 }}>Email</div>
                <div style={{ fontSize:13, fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{miPerfil?.email}</div>
              </div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12 }}>
            <button style={{ width:'100%', padding:'10px 0', borderRadius:8, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <IconEdit /> Editar perfil completo
            </button>
          </div>
        </ModalBase>
      )}

      {/* MODAL MENSAJES */}
      {modalMensajes && (
        <ModalBase title="Mensajes" onClose={() => setModalMensajes(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#2A1840,#af2245)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}>
                  <IconUser size={16} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Camila</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>Último mensaje hace 2h</div>
                </div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#2A1840,#af2245)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}>
                  <IconUser size={16} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Valentina</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>Hace 5 días</div>
                </div>
              </div>
            </div>
          </div>
        </ModalBase>
      )}

      {/* MODAL CRÉDITOS */}
      {modalCreditos && (
        <ModalBase title="Comprar Créditos" onClose={() => setModalCreditos(false)}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:14, marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:4 }}>SALDO ACTUAL</div>
            <div style={{ fontSize:28, fontWeight:800, color:'#d4af37' }}>{miPerfil?.creditos}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { creditos: 50, precio: '$4.99' },
              { creditos: 150, precio: '$11.99', popular: true },
              { creditos: 350, precio: '$24.99' },
              { creditos: 800, precio: '$49.99' },
            ].map((paq, i) => (
              <div key={i} style={{ background: paq.popular ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)', border: paq.popular ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, position:'relative', textAlign:'center' }}>
                {paq.popular && <span style={{ position:'absolute', top:-10, left:0, right:0, fontSize:10, fontWeight:700, color:'#d4af37', background:'rgba(212,175,55,0.2)', padding:'2px 8px', borderRadius:4, width:'fit-content', margin:'0 auto' }}>⭐ Popular</span>}
                <div style={{ fontSize:18, fontWeight:800, color:'white', marginBottom:4 }}>{paq.creditos}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:8 }}>créditos</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#d4af37' }}>{paq.precio}</div>
              </div>
            ))}
          </div>
          <button style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f5d77a,#d4af37,#92651e)', color:'#2A1840', fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:'0 0 18px rgba(212,175,55,0.35)' }}>
            Continuar al pago
          </button>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:12, textAlign:'center' }}>
            🔒 Pago seguro - No guardamos datos de tarjeta
          </div>
        </ModalBase>
      )}

      {/* MODAL NOTIFICACIONES */}
      {modalNotificaciones && (
        <ModalBase title="Notificaciones" onClose={() => setModalNotificaciones(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { tipo: '❤️', nombre: 'Camila', accion: 'Te envió un flechazo', hace: 'Hace 2 horas' },
              { tipo: '💬', nombre: 'Valentina', accion: 'Te escribió', hace: 'Hace 5 horas' },
              { tipo: '💕', nombre: 'Sofia', accion: 'Tienes un nuevo match', hace: 'Ayer' },
            ].map((notif, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:12, padding:12, cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ fontSize:18 }}>{notif.tipo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{notif.nombre}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{notif.accion}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{notif.hace}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModalBase>
      )}

      {/* MODAL FAVORITOS */}
      {modalFavoritos && (
        <ModalBase title="Mis Favoritos" onClose={() => setModalFavoritos(false)}>
          {flechazosRecibidos.length === 0 ? (
            <div style={{ textAlign:'center', color:'rgba(255,255,255,0.5)', padding:'20px 0' }}>
              <p style={{ fontSize:12 }}>Aún no tienes favoritos</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {flechazosRecibidos.map(u => (
                <div key={u.id} style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', border:'1px solid rgba(212,175,55,0.22)' }} onClick={() => { setModalFavoritos(false); abrirPerfil(u as Usuario) }}>
                  <div style={{ aspectRatio:'1', background:'linear-gradient(135deg,#2A1840,#af2245)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', overflow:'hidden' }}>
                    {u.foto_url
                      ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <IconUser size={32} />}
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.02)', padding:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'white' }}>{u.alias}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)' }}>{u.ciudad}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBase>
      )}
    </div>
  )
}
