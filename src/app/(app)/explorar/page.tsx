'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconSearch   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart    = ({ filled, size=18 }: { filled?: boolean; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?'#af2245':'none'} stroke={filled?'#af2245':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMessage  = ({ size=18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame    = ({ size=16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser     = ({ size=16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconChevDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevRight= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconX        = ({ size=20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconFilter   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
const IconMapPin   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconLogOut   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconEye      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconStar     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconNew      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>

const CIUDADES: Record<string, string[]> = {
  'Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  'México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  'Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza'],
  'Chile': ['Santiago','Valparaíso','Concepción'],
  'Perú': ['Lima','Arequipa','Cusco'],
  'Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  'España': ['Madrid','Barcelona','Valencia','Sevilla'],
  'Portugal': ['Lisboa','Oporto'],
}
const ESTADOS_CIVILES = ['Soltero','Casado','Divorciado','Viudo','Complicado']
const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

interface Usuario {
  id: string; alias: string; edad: number; ciudad: string; busca?: string
  foto_principal?: string; online?: boolean; foto_url?: string | null
  bio?: string; estado_civil?: string; orientacion_sexual?: string
  silueta?: string; talla?: string; verificado?: boolean; premium?: boolean
  relacion_buscada?: string[]; personalidad?: string[]
}
interface MiPerfil { alias: string; ciudad: string; creditos: number; genero: string }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil]   = useState<MiPerfil | null>(null)
  const [userId, setUserId]        = useState('')
  const [perfiles, setPerfiles]    = useState<Usuario[]>([])
  const [nuevos, setNuevos]        = useState<Usuario[]>([])
  const [conectados, setConectados]= useState<Usuario[]>([])
  const [visitantes, setVisitantes]= useState<Usuario[]>([])
  const [flechazosRec, setFlechazosRec] = useState<Usuario[]>([])
  const [cargando, setCargando]    = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [perfilSel, setPerfilSel]  = useState<Usuario | null>(null)
  const [tieneMatch, setTieneMatch]= useState(false)
  const [drawerOpen, setDrawerOpen]= useState(false)
  const [ciudadOpen, setCiudadOpen]= useState(false)

  const [edadMin, setEdadMin]         = useState(18)
  const [edadMax, setEdadMax]         = useState(60)
  const [paisFiltro, setPaisFiltro]   = useState('')
  const [ciudadFiltro, setCiudadFiltro]     = useState('')
  const [estadoCivilFiltro, setEstadoCivilFiltro] = useState('')
  const [soloConFoto, setSoloConFoto] = useState(false)
  const [generoBusca, setGeneroBusca] = useState('')

  useEffect(() => { init() }, [])

  const toUsuario = (u: any): Usuario => ({
    ...u,
    online: u.ultimo_acceso ? (Date.now() - new Date(u.ultimo_acceso).getTime()) < 30 * 60 * 1000 : false,
    foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
  })

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    await supabase.rpc('actualizar_ultimo_acceso')

    const { data: p } = await supabase.from('usuarios').select('alias,ciudad,creditos,genero').eq('id', user.id).single()
    if (p) {
      setMiPerfil({ alias: p.alias, ciudad: p.ciudad, creditos: p.creditos || 0, genero: p.genero })
      const gb = p.genero?.toLowerCase() === 'hombre' ? 'mujer' : 'hombre'
      setGeneroBusca(gb)
      await Promise.all([
        cargarFlechazosRecibidos(user.id),
        cargarNuevos(user.id, gb),
        cargarConectados(user.id, gb),
        cargarVisitantes(user.id),
        cargarPerfilesInicial(user.id, gb),
      ])
    }
    setCargando(false)
  }

  const cargarNuevos = async (uid: string, gb: string) => {
    const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('usuarios')
      .select('id,alias,edad,ciudad,foto_principal,ultimo_acceso,verificado,premium')
      .neq('id', uid).eq('genero', gb)
      .gte('created_at', hace7dias)
      .order('created_at', { ascending: false }).limit(20)
    if (data) setNuevos(data.map(toUsuario))
  }

  const cargarConectados = async (uid: string, gb: string) => {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('usuarios')
      .select('id,alias,edad,ciudad,foto_principal,ultimo_acceso,verificado,premium')
      .neq('id', uid).eq('genero', gb)
      .gte('ultimo_acceso', hace24h)
      .order('ultimo_acceso', { ascending: false }).limit(20)
    if (data) setConectados(data.map(toUsuario))
  }

  const cargarVisitantes = async (uid: string) => {
    const { data: vis } = await supabase.from('visitantes')
      .select('visitante_id, created_at')
      .eq('visitado_id', uid)
      .order('created_at', { ascending: false }).limit(20)
    if (!vis?.length) return
    const ids = vis.map(v => v.visitante_id)
    const { data } = await supabase.from('usuarios')
      .select('id,alias,edad,ciudad,foto_principal,ultimo_acceso')
      .in('id', ids)
    if (data) setVisitantes(data.map(toUsuario))
  }

  const cargarFlechazosRecibidos = async (uid: string) => {
    const { data: fl } = await supabase.from('flechazos').select('de_usuario').eq('a_usuario', uid)
    if (!fl?.length) return
    const { data } = await supabase.from('usuarios')
      .select('id,alias,edad,ciudad,foto_principal,ultimo_acceso,bio,estado_civil')
      .in('id', fl.map(f => f.de_usuario))
    if (data) setFlechazosRec(data.map(toUsuario))
  }

  const cargarPerfilesInicial = async (uid: string, gb: string) => {
    const { data } = await supabase.from('usuarios')
      .select('id,alias,edad,ciudad,busca,foto_principal,bio,estado_civil,orientacion_sexual,silueta,talla,verificado,premium,ultimo_acceso,relacion_buscada,personalidad')
      .neq('id', uid).eq('genero', gb).limit(60)
    if (data) setPerfiles(data.map(toUsuario))
  }

  const cargarPerfiles = async () => {
    if (!userId) return
    let q = supabase.from('usuarios')
      .select('id,alias,edad,ciudad,busca,foto_principal,bio,estado_civil,orientacion_sexual,silueta,talla,verificado,premium,ultimo_acceso,relacion_buscada,personalidad')
      .neq('id', userId).eq('genero', generoBusca)
      .gte('edad', edadMin).lte('edad', edadMax)
    if (ciudadFiltro) q = q.eq('ciudad', ciudadFiltro)
    if (estadoCivilFiltro) q = q.eq('estado_civil', estadoCivilFiltro)
    if (soloConFoto) q = q.not('foto_principal', 'is', null)
    const { data } = await q.limit(60)
    if (data) setPerfiles(data.map(toUsuario))
    setDrawerOpen(false)
  }

  const verificarMatch = async (otroId: string) => {
    const { data } = await supabase.from('matches').select('id')
      .or(`and(usuario1.eq.${userId},usuario2.eq.${otroId}),and(usuario1.eq.${otroId},usuario2.eq.${userId})`)
      .single()
    setTieneMatch(!!data)
  }

  const darFlechazo = async (targetId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (flechazosEnviados.has(targetId)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: c } = await supabase.from('usuarios').select('creditos').eq('id', user.id).single()
    if (!c || c.creditos < 1) { router.push('/creditos'); return }
    await supabase.from('flechazos').insert({ de_usuario: user.id, a_usuario: targetId })
    await supabase.rpc('sumar_creditos', { uid: user.id, monto: -1 })
    setFlechazosEnviados(prev => new Set([...prev, targetId]))
    setMiPerfil(prev => prev ? { ...prev, creditos: prev.creditos - 1 } : prev)
    const { data: mutuo } = await supabase.from('flechazos').select('id').eq('de_usuario', targetId).eq('a_usuario', user.id).single()
    if (mutuo) {
      const u1 = user.id < targetId ? user.id : targetId
      const u2 = user.id < targetId ? targetId : user.id
      await supabase.from('matches').insert({ usuario1: u1, usuario2: u2 })
      setPerfilSel(null)
      setTimeout(() => router.push(`/mensajes/${targetId}`), 400)
    }
  }

  const abrirPerfil = async (u: Usuario) => {
    setPerfilSel(u)
    verificarMatch(u.id)
    await supabase.rpc('registrar_visita', { perfil_id: u.id })
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:120 }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Card pequeña (horizontal scroll) ──────────────────────────
  const MiniCard = ({ u, badge }: { u: Usuario; badge?: string }) => {
    const enviado = flechazosEnviados.has(u.id)
    return (
      <div onClick={() => abrirPerfil(u)} style={{ flexShrink:0, width:130, cursor:'pointer' }}>
        <div style={{ position:'relative', width:130, height:160, borderRadius:14, overflow:'hidden', background:'linear-gradient(160deg,#2A1840,#af2245)' }}>
          {u.foto_url
            ? <img src={u.foto_url} alt={u.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)' }}><IconUser size={36} /></div>
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)' }} />
          {u.online && <span style={{ position:'absolute', top:8, left:8, width:8, height:8, borderRadius:'50%', background:'#22c55e', border:'1.5px solid white' }} />}
          {u.verificado && <span style={{ position:'absolute', top:7, right:7, background:'#3b82f6', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>}
          {badge && <div style={{ position:'absolute', top:7, left:u.online?18:7, background:'#af2245', borderRadius:20, padding:'2px 7px', fontSize:9, color:'white', fontWeight:700 }}>{badge}</div>}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'8px 8px 6px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.alias}, {u.edad}</div>
            <div style={{ display:'flex', alignItems:'center', gap:2, color:'rgba(255,255,255,0.7)', fontSize:10 }}><IconMapPin />{u.ciudad?.split(',')[0]}</div>
          </div>
          <button onClick={e => darFlechazo(u.id, e)}
            style={{ position:'absolute', bottom:8, right:8, width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', background: enviado?'#af2245':'rgba(255,255,255,0.9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.2)', transition:'transform 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.15)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
            <IconHeart filled={enviado} size={13} />
          </button>
        </div>
      </div>
    )
  }

  // ── Card grande (grid) ─────────────────────────────────────────
  const BigCard = ({ u, destacado }: { u: Usuario; destacado?: boolean }) => {
    const enviado = flechazosEnviados.has(u.id)
    return (
      <div onClick={() => abrirPerfil(u)} style={{ position:'relative', borderRadius:16, overflow:'hidden', cursor:'pointer', aspectRatio:'3/4', background:'linear-gradient(160deg,#2A1840,#af2245)', boxShadow: destacado?'0 0 0 2px #af2245,0 4px 20px rgba(175,34,69,0.2)':'0 2px 12px rgba(0,0,0,0.08)', transition:'transform 0.2s,box-shadow 0.2s' }}
        onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLDivElement).style.boxShadow=destacado?'0 0 0 2px #af2245,0 8px 28px rgba(175,34,69,0.25)':'0 8px 24px rgba(0,0,0,0.14)'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';(e.currentTarget as HTMLDivElement).style.boxShadow=destacado?'0 0 0 2px #af2245,0 4px 20px rgba(175,34,69,0.2)':'0 2px 12px rgba(0,0,0,0.08)'}}>
        {u.foto_url
          ? <img src={u.foto_url} alt={u.alias} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)' }}><IconUser size={48} /></div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.05) 50%,transparent 100%)' }} />
        {u.online && <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', borderRadius:20, padding:'3px 8px' }}><span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} /><span style={{ fontSize:10, color:'white', fontWeight:500 }}>Online</span></div>}
        {destacado && <div style={{ position:'absolute', top:10, right:10, background:'#af2245', borderRadius:20, padding:'3px 8px', display:'flex', alignItems:'center', gap:3 }}><IconHeart filled size={10} /><span style={{ fontSize:10, color:'white', fontWeight:600 }}>Flechazo</span></div>}
        {u.verificado && !destacado && <div style={{ position:'absolute', top:10, right:10, background:'#3b82f6', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 12px 10px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'white', marginBottom:2 }}>{u.alias}, {u.edad}</div>
          <div style={{ display:'flex', alignItems:'center', gap:3, color:'rgba(255,255,255,0.75)', fontSize:11 }}><IconMapPin />{u.ciudad?.split(',')[0]}</div>
        </div>
        <button onClick={e=>darFlechazo(u.id,e)} style={{ position:'absolute', bottom:10, right:10, width:34, height:34, borderRadius:'50%', border:'none', cursor:'pointer', background:enviado?'#af2245':'rgba(255,255,255,0.92)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)', transition:'transform 0.15s' }}
          onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.12)')}
          onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
          <IconHeart filled={enviado} size={16} />
        </button>
      </div>
    )
  }

  // ── Sección horizontal con scroll ─────────────────────────────
  const SeccionHorizontal = ({ titulo, icono, usuarios, badge }: { titulo: string; icono: React.ReactNode; usuarios: Usuario[]; badge?: string }) => {
    const ref = useRef<HTMLDivElement>(null)
    const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
    if (!usuarios.length) return null
    return (
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:14, fontWeight:700, color:'#1f2937' }}>
            {icono} {titulo}
            <span style={{ background:'#f3f4f6', color:'#6b7280', fontSize:11, fontWeight:600, borderRadius:20, padding:'1px 7px' }}>{usuarios.length}</span>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={()=>scroll(-1)} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280' }}><IconChevLeft /></button>
            <button onClick={()=>scroll(1)}  style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280' }}><IconChevRight /></button>
          </div>
        </div>
        <div ref={ref} style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:6, scrollbarWidth:'none' }}>
          {usuarios.map(u => <MiniCard key={u.id} u={u} badge={badge} />)}
        </div>
      </div>
    )
  }

  // ── Sidebar filtros ────────────────────────────────────────────
  const FiltrosSidebar = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ background:'linear-gradient(160deg,#1e1b17,#2A1840)', borderRadius:16, padding:20, color:'white', textAlign:'center', marginBottom:14 }}>
        <div style={{ width:60, height:60, borderRadius:'50%', margin:'0 auto 10px', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'white' }}>
          {miPerfil?.alias?.[0]?.toUpperCase()}
        </div>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{miPerfil?.alias}</div>
        <div style={{ fontSize:11, opacity:0.5, marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}><IconMapPin />{miPerfil?.ciudad}</div>
        <button onClick={()=>router.push('/creditos')} style={{ background:'rgba(175,34,69,0.2)', border:'1px solid rgba(175,34,69,0.4)', borderRadius:20, padding:'6px 16px', fontSize:12, color:'#f07855', display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer', fontWeight:600 }}>
          <IconFlame /> {miPerfil?.creditos} créditos
        </button>
        <button onClick={()=>router.push('/perfil')} style={{ marginTop:10, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:20, padding:'5px 14px', fontSize:11, color:'rgba(255,255,255,0.8)', display:'inline-flex', alignItems:'center', gap:5, cursor:'pointer', fontWeight:500 }}>
          <IconUser size={12} /> Ver mi perfil
        </button>
      </div>

      <div style={{ background:'white', borderRadius:16, padding:16, border:'1px solid #f0d4d8' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}><IconFilter /> Filtros</div>

        {/* 1. Buscando */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:'#6b7280', fontWeight:600, display:'block', marginBottom:6 }}>Buscando</label>
          <div style={{ display:'flex', gap:6 }}>
            {['hombre','mujer'].map(g => (
              <button key={g} onClick={()=>setGeneroBusca(g)} style={{ flex:1, padding:'7px 0', borderRadius:8, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize', background:generoBusca===g?'linear-gradient(135deg,#af2245,#f07855)':'white', color:generoBusca===g?'white':'#6b7280', borderColor:generoBusca===g?'transparent':'#e5e7eb' }}>{g}</button>
            ))}
          </div>
        </div>

        {/* 2. País */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:'#6b7280', fontWeight:600, display:'block', marginBottom:6 }}>País</label>
          <select value={paisFiltro} onChange={e=>{setPaisFiltro(e.target.value);setCiudadFiltro('')}}
            style={{ width:'100%', padding:'8px 12px', borderRadius:8, fontSize:12, border:'1.5px solid #e5e7eb', background:'white', color:paisFiltro?'#1f2937':'#9ca3af', outline:'none', cursor:'pointer' }}>
            <option value="">Todos los países</option>
            {Object.keys(CIUDADES).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 3. Ciudad */}
        <div style={{ marginBottom:12, position:'relative' }}>
          <label style={{ fontSize:11, color:'#6b7280', fontWeight:600, display:'block', marginBottom:6 }}>Ciudad</label>
          <button onClick={()=>setCiudadOpen(!ciudadOpen)} style={{ width:'100%', padding:'8px 12px', borderRadius:8, textAlign:'left', border:'1.5px solid #e5e7eb', background:'white', fontSize:12, color:ciudadFiltro?'#1f2937':'#9ca3af', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontWeight:500 }}>
            {ciudadFiltro||'Todas las ciudades'} <IconChevDown />
          </button>
          {ciudadOpen && (
            <div style={{ position:'absolute', top:'110%', left:0, right:0, zIndex:50, background:'white', border:'1px solid #e5e7eb', borderRadius:12, maxHeight:200, overflowY:'auto', boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}>
              <button onClick={()=>{setCiudadFiltro('');setCiudadOpen(false)}} style={{ width:'100%', textAlign:'left', padding:'8px 14px', fontSize:12, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' }}>Todas las ciudades</button>
              {Object.entries(CIUDADES)
                .filter(([region]) => !paisFiltro || region === paisFiltro)
                .map(([region, cities]) => (
                <div key={region}>
                  {!paisFiltro && <div style={{ padding:'5px 14px', fontSize:10, fontWeight:700, background:'#f9f5f0', color:'#9ca3af', letterSpacing:'0.06em', textTransform:'uppercase' }}>{region}</div>}
                  {cities.map(c => <button key={c} onClick={()=>{setCiudadFiltro(c);setCiudadOpen(false)}} style={{ width:'100%', textAlign:'left', padding:'7px 18px', fontSize:12, background:ciudadFiltro===c?'#fff0f3':'none', color:ciudadFiltro===c?'#af2245':'#374151', border:'none', cursor:'pointer', fontWeight:ciudadFiltro===c?600:400 }}>{c}</button>)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Situación sentimental */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:'#6b7280', fontWeight:600, display:'block', marginBottom:6 }}>Situación sentimental</label>
          <select value={estadoCivilFiltro} onChange={e=>setEstadoCivilFiltro(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:8, fontSize:12, border:'1.5px solid #e5e7eb', background:'white', color:estadoCivilFiltro?'#1f2937':'#9ca3af', outline:'none', cursor:'pointer' }}>
            <option value="">Cualquier situación</option>
            {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* 5. Edad */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:'#6b7280', fontWeight:600, display:'block', marginBottom:6 }}>Edad</label>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:'#9ca3af', marginBottom:3 }}>Desde</div>
              <select value={edadMin} onChange={e => setEdadMin(Math.min(Number(e.target.value), edadMax - 1))}
                style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'white', fontSize:13, color:'#1f2937', outline:'none', cursor:'pointer' }}>
                {Array.from({length:63},(_,i)=>i+18).map(n => <option key={n} value={n}>{n} años</option>)}
              </select>
            </div>
            <div style={{ color:'#9ca3af', fontSize:14, paddingTop:16 }}>—</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:'#9ca3af', marginBottom:3 }}>Hasta</div>
              <select value={edadMax} onChange={e => setEdadMax(Math.max(Number(e.target.value), edadMin + 1))}
                style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1.5px solid #e5e7eb', background:'white', fontSize:13, color:'#1f2937', outline:'none', cursor:'pointer' }}>
                {Array.from({length:63},(_,i)=>i+18).map(n => <option key={n} value={n}>{n} años</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 6. Solo con foto */}
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151', cursor:'pointer', marginBottom:14, userSelect:'none' }}>
          <input type="checkbox" checked={soloConFoto} onChange={e=>setSoloConFoto(e.target.checked)} style={{ width:15, height:15, cursor:'pointer', accentColor:'#af2245' }} />
          Solo con foto
        </label>

        <button onClick={cargarPerfiles} style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(175,34,69,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <IconSearch /> Buscar perfiles
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{display:none}
        .fab-filter{display:none}
        @media(max-width:768px){
          .desktop-sidebar{display:none!important}
          .mobile-bottom-nav{display:flex!important}
          .main-grid{grid-template-columns:1fr!important}
          .profiles-grid{grid-template-columns:repeat(2,1fr)!important}
          .fab-filter{display:flex!important}
          .explorar-topbar{display:none!important}
        }
        @media(min-width:769px){
          .mobile-bottom-nav{display:none!important}
          .mobile-filter-btn{display:none!important}
        }
      `}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid #f0d4d8', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40, boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:34, width:'auto', objectFit:'contain' }} />
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="mobile-filter-btn" onClick={()=>setDrawerOpen(true)} style={{ display:'none', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:20, border:'1.5px solid #e5e7eb', background:'white', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}><IconFilter /> Filtros</button>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#6b7280', background:'#f9fafb', border:'1px solid #e5e7eb', padding:'5px 12px', borderRadius:20 }}><span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />Online</div>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:20, border:'1.5px solid #e5e7eb', background:'white', fontSize:12, fontWeight:500, color:'#6b7280', cursor:'pointer' }}><IconLogOut /> Salir</button>
        </div>
      </div>

      {/* Layout */}
      <div className="main-grid" style={{ display:'grid', gridTemplateColumns:'280px 1fr', maxWidth:1360, margin:'0 auto' }}>
        {/* Sidebar */}
        <div className="desktop-sidebar" style={{ padding:'20px 16px 20px 20px', borderRight:'1px solid #f0d4d8', position:'sticky', top:56, maxHeight:'calc(100vh - 56px)', overflowY:'auto' }}>
          <FiltrosSidebar />
        </div>

        {/* Contenido */}
        <div style={{ paddingTop:24, paddingBottom:80, overflowY:'auto' }}>

          {/* Secciones Gleeden-style */}
          <SeccionHorizontal titulo="Flechazos recibidos" icono={<IconHeart filled size={15} />} usuarios={flechazosRec} badge="Te gusta" />
          <SeccionHorizontal titulo="Nuevos miembros"     icono={<IconNew />}                    usuarios={nuevos} />
          <SeccionHorizontal titulo="Miembros conectados" icono={<span style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />} usuarios={conectados} />
          <SeccionHorizontal titulo="Mis últimos visitantes" icono={<IconEye />}                 usuarios={visitantes} />

          {/* Separador */}
          {(flechazosRec.length > 0 || nuevos.length > 0 || conectados.length > 0 || visitantes.length > 0) && (
            <div style={{ height:1, background:'#f0d4d8', margin:'4px 20px 24px' }} />
          )}

          {/* Grid de búsqueda */}
          <div style={{ padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <IconUser size={15} />
                <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1f2937' }}>Perfiles</h2>
                {perfiles.length > 0 && <span style={{ background:'#f3f4f6', color:'#6b7280', fontSize:11, fontWeight:600, borderRadius:20, padding:'1px 7px' }}>{perfiles.length}</span>}
              </div>
            </div>

            {perfiles.length === 0 ? (
              <div style={{ padding:'50px 20px', textAlign:'center', color:'#9ca3af' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><IconSearch /></div>
                <div style={{ fontSize:15, fontWeight:600, color:'#374151', marginBottom:6 }}>Sin perfiles disponibles</div>
                <div style={{ fontSize:13 }}>Ajusta los filtros para ver más resultados</div>
              </div>
            ) : (
              <div className="profiles-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {perfiles.map(u => <BigCard key={u.id} u={u} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav móvil */}
      <div className="mobile-bottom-nav" style={{ display:'none', background:'white', borderTop:'1px solid #f0d4d8', justifyContent:'space-around', padding:'8px 0', position:'fixed', bottom:0, left:0, right:0, zIndex:40 }}>
        {[
          { icon:<IconSearch />, path:'/explorar', lbl:'Explorar', active:true },
          { icon:<IconMessage />, path:'/mensajes', lbl:'Mensajes' },
          { icon:<IconFlame />, path:'/creditos', lbl:'Créditos' },
          { icon:<IconUser />, path:'/perfil', lbl:'Perfil' },
        ].map(item => (
          <button key={item.path} onClick={()=>router.push(item.path)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:item.active?'#af2245':'#9ca3af', fontSize:10, fontWeight:item.active?600:400 }}>
            {item.icon}<span>{item.lbl}</span>
            {item.active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#af2245' }} />}
          </button>
        ))}
      </div>

      {/* FAB filtros móvil */}
      <button className="fab-filter" onClick={() => setDrawerOpen(true)}
        style={{ position:'fixed', bottom:80, right:20, zIndex:45, width:52, height:52, borderRadius:'50%', border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', cursor:'pointer', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(175,34,69,0.4)', animation:'slideUp 0.3s ease' }}>
        <IconFilter />
      </button>

      {/* Drawer filtros móvil */}
      {drawerOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:50 }}>
          <div onClick={()=>setDrawerOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#fff8f1', borderRadius:'20px 20px 0 0', padding:'20px 20px 40px', maxHeight:'85vh', overflowY:'auto', animation:'fadeIn 0.2s ease' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>Filtros</span>
              <button onClick={()=>setDrawerOpen(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6b7280' }}><IconX size={16} /></button>
            </div>
            <FiltrosSidebar />
          </div>
        </div>
      )}

      {/* Modal perfil */}
      {perfilSel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'fadeIn 0.15s ease' }}>
          <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ position:'relative', height:320, background:'linear-gradient(160deg,#2A1840,#af2245)' }}>
              {perfilSel.foto_url
                ? <img src={perfilSel.foto_url} alt={perfilSel.alias} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)' }}><IconUser size={64} /></div>
              }
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)' }} />
              <button onClick={()=>setPerfilSel(null)} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', zIndex:10 }}><IconX size={16} /></button>
              <div style={{ position:'absolute', bottom:16, left:18, zIndex:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:'white' }}>{perfilSel.alias}, {perfilSel.edad}</div>
                  {perfilSel.verificado && <div style={{ background:'#3b82f6', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.8)', fontSize:13 }}><IconMapPin />{perfilSel.ciudad}</div>
              </div>
            </div>

            <div style={{ padding:'18px 20px 24px' }}>
              {/* Tags */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                {perfilSel.estado_civil && <span style={{ background:'#fff0f3', border:'1px solid #f0d4d8', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#af2245', fontWeight:600 }}>{perfilSel.estado_civil}</span>}
                {perfilSel.orientacion_sexual && <span style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#0284c7', fontWeight:600 }}>{perfilSel.orientacion_sexual}</span>}
                {perfilSel.silueta && <span style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#16a34a', fontWeight:600 }}>{perfilSel.silueta}</span>}
                {perfilSel.talla && <span style={{ background:'#fafafa', border:'1px solid #e5e7eb', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151', fontWeight:600 }}>{perfilSel.talla}</span>}
              </div>

              {perfilSel.bio && (
                <div style={{ marginBottom:12, padding:14, background:'#f9f5f0', borderRadius:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Acerca de</div>
                  <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, fontStyle:'italic' }}>"{perfilSel.bio}"</div>
                </div>
              )}

              {perfilSel.relacion_buscada?.length && (
                <div style={{ marginBottom:12, padding:14, background:'#fff0f3', borderRadius:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#af2245', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Busca</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {perfilSel.relacion_buscada.map(r => <span key={r} style={{ background:'white', border:'1px solid #f0d4d8', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151' }}>{r}</span>)}
                  </div>
                </div>
              )}

              {perfilSel.personalidad?.length && (
                <div style={{ marginBottom:16, padding:14, background:'#f9fafb', borderRadius:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Personalidad</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {perfilSel.personalidad.map(p => <span key={p} style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151' }}>{p}</span>)}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                {tieneMatch ? (
                  <button onClick={()=>router.push(`/mensajes/${perfilSel.id}`)} style={{ flex:1, padding:'12px 0', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><IconMessage /> Enviar mensaje</button>
                ) : (
                  <button onClick={()=>darFlechazo(perfilSel.id)} style={{ flex:1, padding:'12px 0', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><IconHeart size={16} /> Me interesa</button>
                )}
                <button onClick={()=>setPerfilSel(null)} style={{ flex:1, padding:'12px 0', background:'#f3f4f6', color:'#6b7280', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>Pasar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
