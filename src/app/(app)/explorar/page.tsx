'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconHeart = ({ filled }: { filled?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconChevronDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

const CIUDADES: Record<string, string[]> = {
  '🇨🇴 Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  '🇲🇽 México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  '🇦🇷 Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza'],
  '🇨🇱 Chile': ['Santiago','Valparaíso','Concepción'],
  '🇵🇪 Perú': ['Lima','Arequipa','Cusco'],
  '🇧🇷 Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  '🇪🇸 España': ['Madrid','Barcelona','Valencia','Sevilla'],
  '🇵🇹 Portugal': ['Lisboa','Oporto'],
}

const ESTADOS_CIVILES = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Complicado']

interface Usuario { id:string; alias:string; edad:number; ciudad:string; busca:string; foto_principal?:string; online?:boolean; foto_url?:string | null; bio?:string; estado_civil?:string } 
interface MiPerfil { alias:string; ciudad:string; creditos:number; genero:string }

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [flechazosRecibidos, setFlechazosRecibidos] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [flechazosEnviados, setFlechazosEnviados] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Usuario | null>(null)
  const [tieneMatch, setTieneMatch] = useState(false)

  // Filtros
  const [edadMin, setEdadMin] = useState(18)
  const [edadMax, setEdadMax] = useState(60)
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [ciudadOpen, setCiudadOpen] = useState(false)
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
    if (!miPerfil) return

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
      const mapped = data.map(u => ({
        ...u,
        online: Math.random() > 0.5,
        foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
      }))
      setPerfiles(mapped)
    }
  }

  const cargarFlechazosRecibidos = async (uid: string) => {
    const { data: flechazos } = await supabase.from('flechazos').select('de_usuario').eq('a_usuario', uid)
    if (!flechazos || flechazos.length === 0) {
      setFlechazosRecibidos([])
      return
    }
    const emisoresIds = flechazos.map(f => f.de_usuario)
    const { data: usuarios } = await supabase.from('usuarios').select('id,alias,edad,ciudad,busca,foto_principal,bio').in('id', emisoresIds)
    if (usuarios) {
      const mapped = usuarios.map(u => ({
        ...u,
        online: Math.random() > 0.5,
        foto_url: u.foto_principal ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl : null,
      }))
      setFlechazosRecibidos(mapped)
    }
  }

  const verificarMatch = async (otroId: string) => {
    const { data } = await supabase.from('matches').select('id')
      .or(`and(usuario1.eq.${userId},usuario2.eq.${otroId}),and(usuario1.eq.${otroId},usuario2.eq.${userId})`)
      .single()
    setTieneMatch(!!data)
  }

  const darFlechazo = async (targetId: string) => {
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

  const irAlChat = (otroId: string) => {
    router.push(`/mensajes/${otroId}`)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:130, height:'auto' }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const ProfileCard = ({ u }: { u: any }) => {
    const enviado = flechazosEnviados.has(u.id)
    return (
      <div style={{ flexShrink:0, width:100, cursor:'pointer' }} onClick={() => {
        setPerfilSeleccionado(u)
        verificarMatch(u.id)
      }}>
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

  const Section = ({ title, users }: { title:string; users:any[] }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#1f2937' }}>{title} ({users.length})</div>
      </div>
      {users.length === 0
        ? <p style={{ fontSize:12, color:'#9ca3af' }}>Sin perfiles disponibles.</p>
        : <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>{users.map(u => <ProfileCard key={u.id} u={u} />)}</div>
      }
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
        <img src={LOGO} alt="LUAPP" style={{ height:34, width:'auto', objectFit:'contain' }} />
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280', background:'#f9fafb', border:'0.5px solid #e5e7eb', padding:'4px 12px', borderRadius:20 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} /> Conectada
          </div>
          <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
            🚪 Salir
          </button>
        </div>
      </div>

      {/* Filtros sidebar */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:0, maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ background:'white', borderRight:'0.5px solid #f0d4d8', padding:'20px 16px', minHeight:'calc(100vh - 52px)', overflowY:'auto' }}>
          {/* Mi perfil */}
          <div style={{ background:'#1e1b17', borderRadius:14, padding:16, color:'white', textAlign:'center', marginBottom:16 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto 10px', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:600, color:'white' }}>
              {miPerfil?.alias?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{miPerfil?.alias}</div>
            <div style={{ fontSize:11, opacity:0.5, marginBottom:12 }}>{miPerfil?.ciudad}</div>
            <button onClick={() => router.push('/creditos')}
              style={{ background:'rgba(175,34,69,0.25)', border:'1px solid rgba(175,34,69,0.4)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'#f07855', display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer' }}>
              <IconFlame /> {miPerfil?.creditos} créditos
            </button>
          </div>

          {/* Filtros */}
          <div style={{ background:'#f9f5f0', borderRadius:14, padding:14 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', marginBottom:12 }}>
              🔍 FILTROS
            </div>

            {/* Género */}
            <select value={generoBusca} onChange={e => setGeneroBusca(e.target.value)}
              style={{ width:'100%', padding:'7px 10px', borderRadius:8, fontSize:12, border:'0.5px solid #e0bec1', background:'white', marginBottom:8, color:'#2A1840', fontWeight:600 }}>
              <option value="hombre">👨 Buscando: Hombres</option>
              <option value="mujer">👩 Buscando: Mujeres</option>
            </select>

            {/* Rango edad */}
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:11, color:'#9ca3af', fontWeight:600, display:'block', marginBottom:4 }}>
                Edad: {edadMin} – {edadMax}
              </label>
              <input type="range" min="18" max="80" value={edadMin} onChange={e => setEdadMin(Number(e.target.value))}
                style={{ width:'100%', marginBottom:4 }} />
              <input type="range" min="18" max="80" value={edadMax} onChange={e => setEdadMax(Number(e.target.value))}
                style={{ width:'100%' }} />
            </div>

            {/* Ciudad */}
            <div style={{ marginBottom:8, position:'relative' }}>
              <button onClick={() => setCiudadOpen(!ciudadOpen)}
                style={{ width:'100%', padding:'7px 10px', borderRadius:8, textAlign:'left', border:'0.5px solid #e0bec1', background:'white', fontSize:12, color: ciudadFiltro ? '#2A1840' : '#9ca3af', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontWeight:600 }}>
                {ciudadFiltro || 'Todas las ciudades'} <IconChevronDown />
              </button>
              {ciudadOpen && (
                <div style={{ position:'absolute', top:'110%', left:0, right:0, zIndex:50, background:'white', border:'0.5px solid #e0bec1', borderRadius:10, maxHeight:200, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                  <button onClick={() => { setCiudadFiltro(''); setCiudadOpen(false) }}
                    style={{ width:'100%', textAlign:'left', padding:'7px 12px', fontSize:11, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' }}>
                    Todas las ciudades
                  </button>
                  {Object.entries(CIUDADES).map(([region, cities]) => (
                    <div key={region}>
                      <div style={{ padding:'5px 12px', fontSize:10, fontWeight:600, background:'#f9f5f0', color:'#9ca3af' }}>{region}</div>
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

            {/* Estado civil */}
            <select value={estadoCivilFiltro} onChange={e => setEstadoCivilFiltro(e.target.value)}
              style={{ width:'100%', padding:'7px 10px', borderRadius:8, fontSize:12, border:'0.5px solid #e0bec1', background:'white', marginBottom:8, color: estadoCivilFiltro ? '#2A1840' : '#9ca3af' }}>
              <option value="">Cualquier estado civil</option>
              {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            {/* Solo con foto */}
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151', cursor:'pointer', marginBottom:10 }}>
              <input type="checkbox" checked={soloConFoto} onChange={e => setSoloConFoto(e.target.checked)}
                style={{ width:16, height:16, cursor:'pointer' }} />
              <span>Solo con foto</span>
            </label>

            {/* Botón buscar */}
            <button onClick={cargarPerfiles}
              style={{ width:'100%', padding:'9px 0', borderRadius:20, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(175,34,69,0.25)' }}>
              🔍 Buscar perfiles
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div style={{ padding:'20px 24px', overflowY:'auto' }}>
          <Section title="❤️ Flechazos recibidos" users={flechazosRecibidos} />
          <Section title={`👥 Perfiles (${perfiles.length})`} users={perfiles} />
        </div>
      </div>

      {/* Modal de perfil */}
      {perfilSeleccionado && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:400, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ position:'relative', height:300, background:'linear-gradient(160deg,#2A1840,#af2245)', display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:16 }}>
              {perfilSeleccionado.foto_url
                ? <img src={perfilSeleccionado.foto_url} alt={perfilSeleccionado.alias} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ fontSize:60, color:'rgba(255,255,255,0.3)' }}><IconUser /></div>
              }
              <div style={{ position:'relative', zIndex:10, background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:600 }}>
                {perfilSeleccionado.alias}
              </div>
              <button onClick={() => setPerfilSeleccionado(null)} style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#af2245', zIndex:20 }}>
                <IconX />
              </button>
            </div>

            <div style={{ padding:20 }}>
              <div style={{ fontSize:18, fontWeight:700, color:'#1f2937', marginBottom:8 }}>{perfilSeleccionado.edad} años</div>
              <div style={{ fontSize:14, color:'#9ca3af', marginBottom:4 }}>📍 {perfilSeleccionado.ciudad}</div>
              <div style={{ fontSize:12, color:'#af2245', marginBottom:16 }}>💍 {perfilSeleccionado.estado_civil}</div>

              <div style={{ marginBottom:16, padding:12, background:'#f9f5f0', borderRadius:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:6 }}>Acerca de</div>
                <div style={{ fontSize:13, color:'#1f2937', lineHeight:'1.6' }}>{perfilSeleccionado.bio || 'Sin descripción'}</div>
              </div>

              <div style={{ marginBottom:20, padding:12, background:'#fff0f3', borderRadius:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#af2245', marginBottom:6 }}>¿Qué busca?</div>
                <div style={{ fontSize:13, color:'#1f2937' }}>{perfilSeleccionado.busca || 'No especificado'}</div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                {tieneMatch ? (
                  <button onClick={() => irAlChat(perfilSeleccionado.id)}
                    style={{ flex:1, padding:'12px 0', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <IconMessage /> Enviar mensaje
                  </button>
                ) : (
                  <button onClick={() => { darFlechazo(perfilSeleccionado.id) }}
                    style={{ flex:1, padding:'12px 0', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <IconHeart /> Me interesa
                  </button>
                )}
                <button onClick={() => setPerfilSeleccionado(null)}
                  style={{ flex:1, padding:'12px 0', background:'#f9f5f0', color:'#6b7280', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
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
