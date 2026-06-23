'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconChat    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconGift    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
const IconMail    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconMsg     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconCamera  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const IconEdit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconLock    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconTrash   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
const IconStar    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconChevL   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevR   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconShield  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconLogout  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconHeart   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconPlus    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconFlag    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
const IconBlock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>

interface Usuario {
  id: string; alias: string; edad: number; ciudad: string; pais?: string; region?: string
  bio?: string; genero?: string; estado_civil?: string; orientacion_sexual?: string
  hijos?: string; profesion?: string; ingresos?: string; signo_zodiacal?: string
  etnia?: string; talla?: string; silueta?: string; ojos?: string; cabello?: string
  largo_cabello?: string; fumador?: boolean; relacion_buscada?: string[]
  personalidad?: string[]; deportes?: string[]; actividades?: string[]
  idiomas?: string[]; foto_principal?: string; modo_incognito?: boolean; creditos?: number
  verificado?: boolean; premium?: boolean
}

export default function PerfilPage() {
  const [usuario, setUsuario]   = useState<Usuario | null>(null)
  const [email, setEmail]       = useState('')
  const [fotosPublicas, setFotosPublicas] = useState<string[]>([])
  const [urlsPublicas, setUrlsPublicas]   = useState<string[]>([])
  const [fotosPrivadas, setFotosPrivadas] = useState<string[]>([])
  const [urlsPrivadas, setUrlsPrivadas]   = useState<string[]>([])
  const [fotoIdx, setFotoIdx]   = useState(0)
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje]   = useState('')
  const inputPublicRef  = useRef<HTMLInputElement>(null)
  const inputPrivadoRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    setEmail(session.user.email || '')
    const { data } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
    if (data) setUsuario(data)
    await cargarFotos(session.user.id)
    setCargando(false)
  }

  const cargarFotos = async (uid: string) => {
    const { data } = await supabase.storage.from('fotos').list(uid, { sortBy: { column: 'created_at', order: 'asc' } })
    if (!data) return
    const publicas = data.filter(f => !f.name.startsWith('priv_'))
    const privadas = data.filter(f => f.name.startsWith('priv_'))
    const pathsPub  = publicas.map(f => `${uid}/${f.name}`)
    const pathsPriv = privadas.map(f => `${uid}/${f.name}`)
    setFotosPublicas(pathsPub)
    setUrlsPublicas(pathsPub.map(p => supabase.storage.from('fotos').getPublicUrl(p).data.publicUrl))
    setFotosPrivadas(pathsPriv)
    setUrlsPrivadas(pathsPriv.map(p => supabase.storage.from('fotos').getPublicUrl(p).data.publicUrl))
  }

  const subirFotos = async (e: React.ChangeEvent<HTMLInputElement>, privada = false) => {
    const files = e.target.files
    if (!files || !usuario) return
    const actuales = privada ? fotosPrivadas.length : fotosPublicas.length
    if (actuales + files.length > 5) { setMensaje(`Máximo 5 fotos ${privada ? 'privadas' : 'públicas'}.`); setTimeout(() => setMensaje(''), 3000); return }
    setSubiendo(true)
    for (const file of Array.from(files)) {
      const ext  = file.name.split('.').pop()
      const prefix = privada ? 'priv_' : ''
      const path = `${usuario.id}/${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      await supabase.storage.from('fotos').upload(path, file, { contentType: file.type })
    }
    if (!privada && !usuario.foto_principal) {
      const { data: fl } = await supabase.storage.from('fotos').list(usuario.id)
      const pub = fl?.filter(f => !f.name.startsWith('priv_'))
      if (pub?.[0]) {
        const p = `${usuario.id}/${pub[0].name}`
        await supabase.from('usuarios').update({ foto_principal: p }).eq('id', usuario.id)
        setUsuario(prev => prev ? { ...prev, foto_principal: p } : prev)
      }
    }
    await cargarFotos(usuario.id)
    setSubiendo(false)
    setMensaje(`Foto${files.length > 1 ? 's' : ''} subida${files.length > 1 ? 's' : ''} correctamente.`)
    setTimeout(() => setMensaje(''), 3000)
    e.target.value = ''
  }

  const setFotoPrincipal = async (path: string) => {
    if (!usuario) return
    await supabase.from('usuarios').update({ foto_principal: path }).eq('id', usuario.id)
    setUsuario(prev => prev ? { ...prev, foto_principal: path } : prev)
    setMensaje('Foto principal actualizada.')
    setTimeout(() => setMensaje(''), 3000)
  }

  const eliminarFoto = async (path: string, privada = false) => {
    await supabase.storage.from('fotos').remove([path])
    if (!privada && usuario?.foto_principal === path) {
      const nuevas = fotosPublicas.filter(f => f !== path)
      await supabase.from('usuarios').update({ foto_principal: nuevas[0] || null }).eq('id', usuario!.id)
      setUsuario(prev => prev ? { ...prev, foto_principal: nuevas[0] || undefined } : prev)
    }
    await cargarFotos(usuario!.id)
    setMensaje('Foto eliminada.')
    setTimeout(() => setMensaje(''), 3000)
  }

  const toggleIncognito = async () => {
    if (!usuario) return
    await supabase.from('usuarios').update({ modo_incognito: !usuario.modo_incognito }).eq('id', usuario.id)
    setUsuario({ ...usuario, modo_incognito: !usuario.modo_incognito })
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  // Calcular % de perfil completo
  const calcProgreso = () => {
    if (!usuario) return 0
    const campos = ['alias','bio','ciudad','edad','estado_civil','orientacion_sexual','silueta','ojos','cabello','talla','relacion_buscada','personalidad']
    const llenos  = campos.filter(c => {
      const v = (usuario as any)[c]
      return v && (Array.isArray(v) ? v.length > 0 : v !== '')
    })
    const conFoto = fotosPublicas.length > 0 ? 1 : 0
    return Math.round(((llenos.length + conFoto) / (campos.length + 1)) * 100)
  }

  const fotoActual = urlsPublicas[fotoIdx] || null
  const progreso   = calcProgreso()

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:120 }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const card: React.CSSProperties = { background:'white', borderRadius:14, border:'1px solid #f0d4d8', padding:'18px 20px', marginBottom:12 }
  const secTit: React.CSSProperties = { fontSize:11, fontWeight:700, color:'#af2245', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:7 }
  const fila: React.CSSProperties  = { display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f9f5f0', fontSize:13 }
  const lbl: React.CSSProperties   = { color:'#9ca3af' }
  const val: React.CSSProperties   = { color:'#1f2937', fontWeight:500, textAlign:'right' }
  const modBtn: React.CSSProperties = { display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#af2245', background:'none', border:'none', cursor:'pointer', marginTop:12, padding:0, fontWeight:600, letterSpacing:'0.04em' }

  const Fila = ({ l, v }: { l: string; v?: string | null }) => (
    <div style={fila}><span style={lbl}>{l}</span><span style={val}>{v || '—'}</span></div>
  )

  const GaleriaFotos = ({ fotos, urls, privada }: { fotos: string[]; urls: string[]; privada: boolean }) => (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:8 }}>
      {urls.map((url, i) => {
        const path = fotos[i]
        const esPrincipal = !privada && usuario?.foto_principal === path
        return (
          <div key={path} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'3/4', background:'#f0d4d8' }}>
            <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            {esPrincipal && (
              <div style={{ position:'absolute', top:4, left:4, background:'#af2245', color:'white', borderRadius:6, padding:'2px 5px', fontSize:9, display:'flex', alignItems:'center', gap:2 }}>
                <IconStar /> Principal
              </div>
            )}
            <div style={{ position:'absolute', bottom:3, left:3, right:3, display:'flex', gap:3 }}>
              {!privada && !esPrincipal && (
                <button onClick={() => setFotoPrincipal(path)}
                  style={{ flex:1, padding:'2px 0', borderRadius:5, border:'none', background:'rgba(255,255,255,0.9)', fontSize:8, color:'#af2245', cursor:'pointer', fontWeight:600 }}>
                  Principal
                </button>
              )}
              <button onClick={() => eliminarFoto(path, privada)}
                style={{ width:22, height:22, borderRadius:5, border:'none', background:'rgba(0,0,0,0.5)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <IconTrash />
              </button>
            </div>
          </div>
        )
      })}
      {fotos.length < 5 && (
        <button onClick={() => (privada ? inputPrivadoRef : inputPublicRef).current?.click()}
          style={{ aspectRatio:'3/4', borderRadius:10, border:'2px dashed #e0bec1', background:'#fafafa', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#e0bec1', gap:5 }}>
          {subiendo
            ? <div style={{ width:18, height:18, border:'2px solid #f0d4d8', borderTop:'2px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            : <><IconPlus /><span style={{ fontSize:9, fontWeight:600 }}>Agregar</span></>
          }
        </button>
      )}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', paddingBottom:90 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        @media(max-width:768px){
          .perfil-grid{grid-template-columns:1fr!important}
          .perfil-foto{max-width:340px;margin:0 auto}
        }
      `}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid #f0d4d8', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:30, width:'auto' }} />
        <div style={{ flex:1, marginLeft:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', display:'flex', alignItems:'center', gap:6 }}>
            {usuario?.alias}
            {usuario?.verificado && <span style={{ background:'#3b82f6', borderRadius:'50%', width:16, height:16, display:'inline-flex', alignItems:'center', justifyContent:'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>}
            {usuario?.premium && <span style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius:6, padding:'1px 6px', fontSize:9, color:'white', fontWeight:700 }}>PREMIUM</span>}
          </div>
          <div style={{ fontSize:11, color:'#9ca3af' }}>{email}</div>
        </div>
        <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
          <IconLogout /> Salir
        </button>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px' }}>
        <div className="perfil-grid" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16, alignItems:'start' }}>

          {/* ── Columna izquierda ── */}
          <div>
            {/* Foto principal */}
            <div className="perfil-foto" style={{ position:'relative', borderRadius:16, overflow:'hidden', background:'#1e1b17', aspectRatio:'3/4', marginBottom:12 }}>
              {fotoActual
                ? <img src={fotoActual} alt="foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, color:'rgba(255,255,255,0.25)' }}>
                    <IconCamera />
                    <span style={{ fontSize:12 }}>Sin fotos</span>
                  </div>
              }
              {urlsPublicas.length > 1 && (
                <>
                  <button onClick={() => setFotoIdx(i => (i - 1 + urlsPublicas.length) % urlsPublicas.length)}
                    style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconChevL />
                  </button>
                  <button onClick={() => setFotoIdx(i => (i + 1) % urlsPublicas.length)}
                    style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconChevR />
                  </button>
                  <div style={{ position:'absolute', bottom:48, left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
                    {urlsPublicas.map((_, i) => (
                      <div key={i} onClick={() => setFotoIdx(i)}
                        style={{ width: i === fotoIdx ? 14 : 6, height:6, borderRadius:3, background: i === fotoIdx ? '#af2245' : 'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.2s' }} />
                    ))}
                  </div>
                </>
              )}
              {/* Progreso */}
              <div style={{ position:'absolute', bottom:10, right:10 }}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#af2245" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 18 * progreso / 100} ${2 * Math.PI * 18}`}
                    strokeLinecap="round" transform="rotate(-90 22 22)"/>
                  <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{progreso}%</text>
                </svg>
              </div>
              {/* Online */}
              <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)', borderRadius:20, padding:'3px 8px' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
                <span style={{ fontSize:10, color:'white', fontWeight:500 }}>En línea</span>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div style={{ background:'white', borderRadius:14, border:'1px solid #f0d4d8', overflow:'hidden', marginBottom:12 }}>
              {[
                { icon:<IconCamera />, label:'Subir foto pública',  action: () => inputPublicRef.current?.click() },
                { icon:<IconLock />,   label:'Subir foto privada',  action: () => inputPrivadoRef.current?.click() },
                { icon:<IconHeart />,  label:'Explorar perfiles',   action: () => router.push('/explorar') },
                { icon:<IconFlame />,  label:`${usuario?.creditos || 0} créditos`,  action: () => router.push('/creditos') },
                { icon:<IconShield />, label: usuario?.modo_incognito ? 'Incógnito activado' : 'Activar incógnito', action: toggleIncognito },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'none', border:'none', borderBottom:'1px solid #f9f5f0', cursor:'pointer', color:'#374151', fontSize:13, textAlign:'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <span style={{ color:'#af2245', display:'flex' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Evaluación / personalidad */}
            {usuario?.personalidad && usuario.personalidad.length > 0 && (
              <div style={{ background:'white', borderRadius:14, border:'1px solid #f0d4d8', padding:'14px 16px' }}>
                <div style={secTit}><IconHeart /> Personalidad</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {usuario.personalidad.map(p => (
                    <span key={p} style={{ background:'#f9f5f0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#6b7280' }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Columna derecha ── */}
          <div>

            {/* Botones de acceso rápido */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
              {[
                { icon:<IconChat />,  label:'Chat',      action: () => router.push('/mensajes') },
                { icon:<IconMsg />,   label:'Mensajes',  action: () => router.push('/mensajes') },
                { icon:<IconHeart />, label:'Flechazos', action: () => router.push('/explorar') },
              ].map((b, i) => (
                <button key={i} onClick={b.action}
                  style={{ padding:'11px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {b.icon} {b.label}
                </button>
              ))}
            </div>

            {mensaje && (
              <div style={{ padding:'9px 14px', borderRadius:10, background: mensaje.includes('Máx')||mensaje.includes('Error') ? '#fef2f2' : '#f0fdf4', border:`1px solid ${mensaje.includes('Máx')||mensaje.includes('Error') ? '#fecaca' : '#bbf7d0'}`, fontSize:12, color: mensaje.includes('Máx')||mensaje.includes('Error') ? '#dc2626' : '#16a34a', textAlign:'center', marginBottom:12 }}>
                {mensaje}
              </div>
            )}

            {/* Presentación */}
            <div style={card}>
              <div style={secTit}><IconMsg /> Mi presentación</div>
              <p style={{ fontSize:13, color:'#4b5563', fontStyle:'italic', lineHeight:1.6, margin:'0 0 10px' }}>
                "{usuario?.bio || 'Agrega una frase que te describa...'}"
              </p>
              <button onClick={() => router.push('/perfil/editar')} style={modBtn}><IconEdit /> MODIFICAR <IconChevRight /></button>
            </div>

            {/* Datos personales */}
            <div style={card}>
              <div style={secTit}><IconUser /> Datos personales</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0 24px' }}>
                <div>
                  <Fila l="Ciudad"            v={usuario?.ciudad} />
                  <Fila l="Región"            v={usuario?.region} />
                  <Fila l="País"              v={usuario?.pais || 'Colombia'} />
                  <Fila l="Género"            v={usuario?.genero} />
                  <Fila l="Situación"         v={usuario?.estado_civil} />
                  <Fila l="Hijos"             v={usuario?.hijos} />
                  <Fila l="Orientación"       v={usuario?.orientacion_sexual} />
                  <Fila l="Edad"              v={usuario?.edad ? `${usuario.edad} años` : undefined} />
                  <Fila l="Talla"             v={usuario?.talla} />
                </div>
                <div>
                  <Fila l="Signo"             v={usuario?.signo_zodiacal} />
                  <Fila l="Etnia"             v={usuario?.etnia} />
                  <Fila l="Silueta"           v={usuario?.silueta} />
                  <Fila l="Ojos"              v={usuario?.ojos} />
                  <Fila l="Cabello"           v={usuario?.cabello} />
                  <Fila l="Largo cabello"     v={usuario?.largo_cabello} />
                  <Fila l="Fumador"           v={usuario?.fumador ? 'Sí' : 'No'} />
                  <Fila l="Profesión"         v={usuario?.profesion} />
                  <Fila l="Ingresos"          v={usuario?.ingresos} />
                </div>
              </div>
              <button onClick={() => router.push('/perfil/editar')} style={modBtn}><IconEdit /> MODIFICAR <IconChevRight /></button>
            </div>

            {/* Fotos públicas */}
            <div style={card}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={secTit}><IconCamera /> Fotos públicas ({fotosPublicas.length}/5)</div>
                {fotosPublicas.length < 5 && (
                  <button onClick={() => inputPublicRef.current?.click()}
                    style={{ fontSize:11, color:'#af2245', background:'none', border:'none', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                    AÑADIR <IconChevRight />
                  </button>
                )}
              </div>
              {fotosPublicas.length === 0
                ? <div style={{ textAlign:'center', padding:'20px 0', color:'#9ca3af', fontSize:13 }}>Sin fotos públicas aún</div>
                : <GaleriaFotos fotos={fotosPublicas} urls={urlsPublicas} privada={false} />
              }
            </div>

            {/* Fotos privadas */}
            <div style={card}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={secTit}><IconLock /> Fotos privadas ({fotosPrivadas.length}/5)</div>
                {fotosPrivadas.length < 5 && (
                  <button onClick={() => inputPrivadoRef.current?.click()}
                    style={{ fontSize:11, color:'#af2245', background:'none', border:'none', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                    AÑADIR <IconChevRight />
                  </button>
                )}
              </div>
              {fotosPrivadas.length === 0
                ? <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:'#f0d4d8', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', color:'#af2245' }}><IconLock /></div>
                    <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>Solo tus matches verán estas fotos</p>
                  </div>
                : <GaleriaFotos fotos={fotosPrivadas} urls={urlsPrivadas} privada={true} />
              }
            </div>

            {/* Lo que busco */}
            {(usuario?.relacion_buscada?.length || usuario?.personalidad?.length) && (
              <div style={card}>
                <div style={secTit}><IconHeart /> Lo que busco</div>
                {usuario?.relacion_buscada && usuario.relacion_buscada.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:7 }}>Tipo de relación</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {usuario.relacion_buscada.map(r => <span key={r} style={{ background:'#fff0f3', border:'1px solid #f0d4d8', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#af2245' }}>{r}</span>)}
                    </div>
                  </div>
                )}
                <button onClick={() => router.push('/perfil/editar')} style={modBtn}><IconEdit /> MODIFICAR <IconChevRight /></button>
              </div>
            )}

            {/* Estilo de vida */}
            {(usuario?.actividades?.length || usuario?.deportes?.length || usuario?.idiomas?.length) && (
              <div style={card}>
                <div style={secTit}><IconFlame /> Estilo de vida</div>
                {usuario?.actividades && usuario.actividades.length > 0 && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:6 }}>Actividades</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {usuario.actividades.map(a => <span key={a} style={{ background:'#f9f5f0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151' }}>{a}</span>)}
                    </div>
                  </div>
                )}
                {usuario?.deportes && usuario.deportes.length > 0 && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:6 }}>Deportes</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {usuario.deportes.map(d => <span key={d} style={{ background:'#f9f5f0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151' }}>{d}</span>)}
                    </div>
                  </div>
                )}
                {usuario?.idiomas && usuario.idiomas.length > 0 && (
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:6 }}>Idiomas</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {usuario.idiomas.map(i => <span key={i} style={{ background:'#f9f5f0', borderRadius:20, padding:'3px 10px', fontSize:11, color:'#374151' }}>{i}</span>)}
                    </div>
                  </div>
                )}
                <button onClick={() => router.push('/perfil/editar')} style={modBtn}><IconEdit /> MODIFICAR <IconChevRight /></button>
              </div>
            )}

            {/* Configuración */}
            <div style={card}>
              <div style={secTit}><IconShield /> Configuración</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f9f5f0' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>Modo incógnito</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{usuario?.modo_incognito ? 'No apareces en búsquedas' : 'Visible para todos'}</div>
                </div>
                <button onClick={toggleIncognito}
                  style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background: usuario?.modo_incognito ? '#af2245' : '#e5e7eb', position:'relative', transition:'background 0.2s' }}>
                  <div style={{ width:20, height:20, background:'white', borderRadius:'50%', position:'absolute', top:2, left: usuario?.modo_incognito ? 22 : 2, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
              <button onClick={logout}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'10px 0', background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:13, fontWeight:600, marginTop:4 }}>
                <IconLogout /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs ocultos */}
      <input ref={inputPublicRef}  type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => subirFotos(e, false)} />
      <input ref={inputPrivadoRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => subirFotos(e, true)} />

      {/* Bottom Nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #f0d4d8', display:'flex', zIndex:40, padding:'8px 0', boxShadow:'0 -1px 8px rgba(0,0,0,0.04)' }}>
        {[
          { icon:<IconSearch />, path:'/explorar', label:'Explorar' },
          { icon:<IconMsg />,    path:'/mensajes', label:'Mensajes' },
          { icon:<IconFlame />,  path:'/creditos', label:'Créditos' },
          { icon:<IconUser />,   path:'/perfil',   label:'Perfil', active:true },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: (item as any).active ? '#af2245' : '#9ca3af', fontSize:10, fontWeight: (item as any).active ? 600 : 400 }}>
            {item.icon}<span>{item.label}</span>
            {(item as any).active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#af2245' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
