'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart = ({ filled, size = 18 }: { filled?: boolean; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMessage = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconX = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
const IconMapPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>

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
  id: string; alias: string; edad: number; ciudad: string; busca: string
  foto_principal?: string; online?: boolean; foto_url?: string | null; bio?: string; estado_civil?: string
}
interface MiPerfil { alias: string; ciudad: string; creditos: number; genero: string }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [flechazosRecibidos, setFlechazosRecibidos] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Usuario | null>(null)
  const [tieneMatch, setTieneMatch] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [ciudadOpen, setCiudadOpen] = useState(false)

  const [edadMin, setEdadMin] = useState(18)
  const [edadMax, setEdadMax] = useState(60)
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [estadoCivilFiltro, setEstadoCivilFiltro] = useState('')
  const [soloConFoto, setSoloConFoto] = useState(false)
  const [generoBusca, setGeneroBusca] = useState('')

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)
    const { data: p } = await supabase.from('usuarios').select('alias,ciudad,creditos,genero').eq('id', user.id).single()
    if (p) {
      setMiPerfil({ alias: p.alias, ciudad: p.ciudad, creditos: p.creditos || 0, genero: p.genero })
      setGeneroBusca(p.genero?.toLowerCase() === 'hombre' ? 'mujer' : 'hombre')
    }
    await cargarFlechazosRecibidos(user.id)
    setCargando(false)
  }

  const cargarPerfiles = async () => {
    if (!userId) return
    let query = supabase.from('usuarios')
      .select('id,alias,edad,ciudad,busca,foto_principal,bio,genero,estado_civil')
      .neq('id', userId)
      .eq('genero', generoBusca)
      .gte('edad', edadMin)
      .lte('edad', edadMax)

    if (ciudadFiltro) query = query.eq('ciudad', ciudadFiltro)
    if (estadoCivilFiltro) query = query.eq('estado_civil', estadoCivilFiltro)
    if (soloConFoto) query = query.not('foto_principal', 'is', null)

    const { data } = await query.limit(50)
    if (data) {
      setPerfiles(data.map(u => ({
        ...u,
        online: Math.random() > 0.5,
        foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
      })))
    }
    setDrawerOpen(false)
  }

  const cargarFlechazosRecibidos = async (uid: string) => {
    const { data: flechazos } = await supabase.from('flechazos').select('de_usuario').eq('a_usuario', uid)
    if (!flechazos?.length) { setFlechazosRecibidos([]); return }
    const ids = flechazos.map(f => f.de_usuario)
    const { data: usuarios } = await supabase.from('usuarios').select('id,alias,edad,ciudad,busca,foto_principal,bio').in('id', ids)
    if (usuarios) {
      setFlechazosRecibidos(usuarios.map(u => ({
        ...u,
        online: Math.random() > 0.5,
        foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
      })))
    }
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
      setPerfilSeleccionado(null)
      setTimeout(() => router.push(`/mensajes/${targetId}`), 500)
    }
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#fff8f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width: 120, height: 'auto' }} />
      <div style={{ width: 28, height: 28, border: '3px solid #f0d4d8', borderTop: '3px solid #af2245', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const ProfileCard = ({ u, destacado }: { u: Usuario; destacado?: boolean }) => {
    const enviado = flechazosEnviados.has(u.id)
    return (
      <div
        onClick={() => { setPerfilSeleccionado(u); verificarMatch(u.id) }}
        style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
          aspectRatio: '3/4', background: 'linear-gradient(160deg,#2A1840,#af2245)',
          boxShadow: destacado ? '0 0 0 2px #af2245, 0 4px 20px rgba(175,34,69,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = destacado ? '0 0 0 2px #af2245, 0 8px 28px rgba(175,34,69,0.25)' : '0 8px 24px rgba(0,0,0,0.14)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = destacado ? '0 0 0 2px #af2245, 0 4px 20px rgba(175,34,69,0.2)' : '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        {u.foto_url
          ? <img src={u.foto_url} alt={u.alias} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}><IconUser size={48} /></div>
        }

        {/* Gradiente inferior */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

        {/* Badge online */}
        {u.online && (
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '3px 8px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'white', fontWeight: 500 }}>Online</span>
          </div>
        )}

        {/* Badge flechazo recibido */}
        {destacado && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#af2245', borderRadius: 20, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconHeart filled size={10} />
            <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>Flechazo</span>
          </div>
        )}

        {/* Info inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 10px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {u.alias}, {u.edad}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
            <IconMapPin />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.ciudad?.split(',')[0]}</span>
          </div>
        </div>

        {/* Botón flechazo */}
        <button
          onClick={e => darFlechazo(u.id, e)}
          style={{
            position: 'absolute', bottom: 10, right: 10, width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: enviado ? '#af2245' : 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <IconHeart filled={enviado} size={16} />
        </button>
      </div>
    )
  }

  const FiltrosSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Mi perfil */}
      <div style={{ background: 'linear-gradient(160deg,#1e1b17,#2A1840)', borderRadius: 16, padding: 20, color: 'white', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 10px', background: 'linear-gradient(135deg,#af2245,#f07855)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white' }}>
          {miPerfil?.alias?.[0]?.toUpperCase()}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{miPerfil?.alias}</div>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <IconMapPin />{miPerfil?.ciudad}
        </div>
        <button onClick={() => router.push('/creditos')}
          style={{ background: 'rgba(175,34,69,0.2)', border: '1px solid rgba(175,34,69,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#f07855', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 }}>
          <IconFlame /> {miPerfil?.creditos} créditos
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f0d4d8' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconFilter /> Filtros
        </div>

        {/* Género */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Buscando</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['hombre', 'mujer'].map(g => (
              <button key={g} onClick={() => setGeneroBusca(g)}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                  background: generoBusca === g ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white',
                  color: generoBusca === g ? 'white' : '#6b7280',
                  borderColor: generoBusca === g ? 'transparent' : '#e5e7eb',
                }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Rango edad */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Edad: {edadMin} – {edadMax}
          </label>
          <input type="range" min="18" max="80" value={edadMin} onChange={e => setEdadMin(Number(e.target.value))} style={{ width: '100%', marginBottom: 4, accentColor: '#af2245' }} />
          <input type="range" min="18" max="80" value={edadMax} onChange={e => setEdadMax(Number(e.target.value))} style={{ width: '100%', accentColor: '#af2245' }} />
        </div>

        {/* Ciudad */}
        <div style={{ marginBottom: 12, position: 'relative' }}>
          <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Ciudad</label>
          <button onClick={() => setCiudadOpen(!ciudadOpen)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, textAlign: 'left', border: '1.5px solid #e5e7eb', background: 'white', fontSize: 12, color: ciudadFiltro ? '#1f2937' : '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}>
            {ciudadFiltro || 'Todas las ciudades'} <IconChevronDown />
          </button>
          {ciudadOpen && (
            <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 50, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, maxHeight: 200, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <button onClick={() => { setCiudadFiltro(''); setCiudadOpen(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                Todas las ciudades
              </button>
              {Object.entries(CIUDADES).map(([region, cities]) => (
                <div key={region}>
                  <div style={{ padding: '5px 14px', fontSize: 10, fontWeight: 700, background: '#f9f5f0', color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{region}</div>
                  {cities.map(c => (
                    <button key={c} onClick={() => { setCiudadFiltro(c); setCiudadOpen(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '7px 18px', fontSize: 12, background: ciudadFiltro === c ? '#fff0f3' : 'none', color: ciudadFiltro === c ? '#af2245' : '#374151', border: 'none', cursor: 'pointer', fontWeight: ciudadFiltro === c ? 600 : 400 }}>
                      {c}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado civil */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado civil</label>
          <select value={estadoCivilFiltro} onChange={e => setEstadoCivilFiltro(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12, border: '1.5px solid #e5e7eb', background: 'white', color: estadoCivilFiltro ? '#1f2937' : '#9ca3af', outline: 'none', cursor: 'pointer' }}>
            <option value="">Cualquier estado civil</option>
            {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Solo con foto */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer', marginBottom: 14, userSelect: 'none' }}>
          <input type="checkbox" checked={soloConFoto} onChange={e => setSoloConFoto(e.target.checked)}
            style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#af2245' }} />
          Solo con foto
        </label>

        <button onClick={cargarPerfiles}
          style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#af2245,#f07855)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(175,34,69,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <IconSearch /> Buscar perfiles
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f1' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content { padding: 16px !important; }
          .profiles-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 769px) {
          .mobile-bottom-nav { display: none !important; }
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0d4d8', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Filtros móvil */}
          <button className="mobile-filter-btn" onClick={() => setDrawerOpen(true)}
            style={{ display: 'none', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, border: '1.5px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <IconFilter /> Filtros
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '5px 12px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Conectada
          </div>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 20, border: '1.5px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
            <IconLogOut /> Salir
          </button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', maxWidth: 1280, margin: '0 auto' }}>
        {/* Sidebar desktop */}
        <div className="desktop-sidebar" style={{ padding: '24px 16px 24px 20px', borderRight: '1px solid #f0d4d8', minHeight: 'calc(100vh - 56px)', position: 'sticky', top: 56, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <FiltrosSidebar />
        </div>

        {/* Contenido */}
        <div className="main-content" style={{ padding: '24px 28px', overflowY: 'auto' }}>
          {/* Flechazos recibidos */}
          {flechazosRecibidos.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IconHeart filled size={16} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Flechazos recibidos</h2>
                <span style={{ background: '#af2245', color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px' }}>{flechazosRecibidos.length}</span>
              </div>
              <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {flechazosRecibidos.map(u => <ProfileCard key={u.id} u={u} destacado />)}
              </div>
              <div style={{ height: 1, background: '#f0d4d8', margin: '28px 0 0' }} />
            </div>
          )}

          {/* Perfiles */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconUser size={16} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Perfiles</h2>
                {perfiles.length > 0 && (
                  <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '2px 8px' }}>{perfiles.length}</span>
                )}
              </div>
            </div>

            {perfiles.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <IconSearch />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Sin perfiles aún</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Usa los filtros y presiona Buscar perfiles</div>
                <button onClick={cargarPerfiles}
                  style={{ padding: '10px 24px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg,#af2245,#f07855)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Buscar ahora
                </button>
              </div>
            ) : (
              <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {perfiles.map(u => <ProfileCard key={u.id} u={u} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav móvil */}
      <div className="mobile-bottom-nav" style={{ display: 'none', background: 'white', borderTop: '1px solid #f0d4d8', justifyContent: 'space-around', padding: '8px 0', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}>
        {[
          { icon: <IconSearch />, path: '/explorar', lbl: 'Explorar', active: true },
          { icon: <IconMessage />, path: '/mensajes', lbl: 'Mensajes' },
          { icon: <IconFlame />, path: '/creditos', lbl: 'Créditos' },
          { icon: <IconUser />, path: '/perfil', lbl: 'Perfil' },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: item.active ? '#af2245' : '#9ca3af', fontSize: 10, fontWeight: item.active ? 600 : 400 }}>
            {item.icon}
            <span>{item.lbl}</span>
            {item.active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#af2245' }} />}
          </button>
        ))}
      </div>

      {/* Drawer filtros móvil */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff8f1', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Filtros</span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <IconX size={16} />
              </button>
            </div>
            <FiltrosSidebar />
          </div>
        </div>
      )}

      {/* Modal perfil */}
      {perfilSeleccionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.15s ease' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'relative', height: 320, background: 'linear-gradient(160deg,#2A1840,#af2245)' }}>
              {perfilSeleccionado.foto_url
                ? <img src={perfilSeleccionado.foto_url} alt={perfilSeleccionado.alias} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}><IconUser size={64} /></div>
              }
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <button onClick={() => setPerfilSeleccionado(null)}
                style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <IconX size={16} />
              </button>
              <div style={{ position: 'absolute', bottom: 16, left: 18, zIndex: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>{perfilSeleccionado.alias}, {perfilSeleccionado.edad}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                  <IconMapPin />{perfilSeleccionado.ciudad}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 20px 24px' }}>
              {perfilSeleccionado.estado_civil && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff0f3', border: '1px solid #f0d4d8', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#af2245', fontWeight: 600, marginBottom: 14 }}>
                  {perfilSeleccionado.estado_civil}
                </div>
              )}

              {perfilSeleccionado.bio && (
                <div style={{ marginBottom: 14, padding: 14, background: '#f9f5f0', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Acerca de</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{perfilSeleccionado.bio}</div>
                </div>
              )}

              {perfilSeleccionado.busca && (
                <div style={{ marginBottom: 20, padding: 14, background: '#fff0f3', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#af2245', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Busca</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{perfilSeleccionado.busca}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                {tieneMatch ? (
                  <button onClick={() => router.push(`/mensajes/${perfilSeleccionado.id}`)}
                    style={{ flex: 1, padding: '12px 0', background: 'linear-gradient(135deg,#af2245,#f07855)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <IconMessage /> Enviar mensaje
                  </button>
                ) : (
                  <button onClick={() => darFlechazo(perfilSeleccionado.id)}
                    style={{ flex: 1, padding: '12px 0', background: 'linear-gradient(135deg,#af2245,#f07855)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <IconHeart size={16} /> Me interesa
                  </button>
                )}
                <button onClick={() => setPerfilSeleccionado(null)}
                  style={{ flex: 1, padding: '12px 0', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Pasar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
