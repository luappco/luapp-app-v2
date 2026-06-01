'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Usuario } from '@/types'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

// ── Iconos SVG ───────────────────────────────────────────────────────────────
const IconSearch    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconMessage   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLock      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEdit      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconCamera    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const IconLogout    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconPlus      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconStar      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconTrash     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconChevron   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
// ─────────────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [fotos, setFotos] = useState<string[]>([])        // paths en storage
  const [fotoUrls, setFotoUrls] = useState<string[]>([])  // URLs públicas
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
    setUsuario(data)

    // Cargar fotos del storage
    await cargarFotos(user.id)
    setCargando(false)
  }

  const cargarFotos = async (uid: string) => {
    const { data } = await supabase.storage.from('fotos').list(uid, { sortBy: { column: 'created_at', order: 'asc' } })
    if (!data) return
    const paths = data.map(f => `${uid}/${f.name}`)
    setFotos(paths)
    const urls = paths.map(p => supabase.storage.from('fotos').getPublicUrl(p).data.publicUrl)
    setFotoUrls(urls)
  }

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!usuario) return

    if (fotos.length + files.length > 6) {
      setMensaje('Máximo 6 fotos permitidas.')
      return
    }

    setSubiendo(true)
    setMensaje('')

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${usuario.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage.from('fotos').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

      if (error) {
        setMensaje('Error al subir foto. Intenta de nuevo.')
        setSubiendo(false)
        return
      }
    }

    // Si no tiene foto principal, asignar la primera
    await cargarFotos(usuario.id)
    const { data: fotosActualizadas } = await supabase.storage.from('fotos').list(usuario.id)
    if (fotosActualizadas && fotosActualizadas.length > 0 && !usuario.foto_principal) {
      const primerPath = `${usuario.id}/${fotosActualizadas[0].name}`
      await supabase.from('usuarios').update({ foto_principal: primerPath }).eq('id', usuario.id)
      setUsuario(prev => prev ? { ...prev, foto_principal: primerPath } : prev)
    }

    setSubiendo(false)
    setMensaje('Fotos subidas correctamente.')
    setTimeout(() => setMensaje(''), 3000)
  }

  const setFotoPrincipal = async (path: string) => {
    if (!usuario) return
    await supabase.from('usuarios').update({ foto_principal: path }).eq('id', usuario.id)
    setUsuario(prev => prev ? { ...prev, foto_principal: path } : prev)
    setMensaje('Foto principal actualizada.')
    setTimeout(() => setMensaje(''), 3000)
  }

  const eliminarFoto = async (path: string) => {
    const { error } = await supabase.storage.from('fotos').remove([path])
    if (error) { setMensaje('Error al eliminar.'); return }

    // Si era la foto principal, limpiarla
    if (usuario?.foto_principal === path) {
      const nuevasFotos = fotos.filter(f => f !== path)
      const nueva = nuevasFotos[0] || null
      await supabase.from('usuarios').update({ foto_principal: nueva }).eq('id', usuario.id)
      setUsuario(prev => prev ? { ...prev, foto_principal: nueva || undefined } : prev)
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

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fotoPrincipalUrl = usuario?.foto_principal
    ? supabase.storage.from('fotos').getPublicUrl(usuario.foto_principal).data.publicUrl
    : null

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:120, height:'auto' }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', maxWidth:480, margin:'0 auto', paddingBottom:90 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,rgba(242,196,206,.4),#fff8f1)', padding:'48px 20px 28px', textAlign:'center' }}>

        {/* Avatar / foto principal */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:12 }}>
          {fotoPrincipalUrl ? (
            <img src={fotoPrincipalUrl} alt="Foto principal"
              style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:'3px solid white', boxShadow:'0 4px 16px rgba(175,34,69,0.2)' }} />
          ) : (
            <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#af2245,#f07855)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:'white', border:'3px solid white', boxShadow:'0 4px 16px rgba(175,34,69,0.2)' }}>
              {usuario?.alias?.[0]?.toUpperCase()}
            </div>
          )}
          {/* Botón cámara sobre avatar */}
          <button onClick={() => inputRef.current?.click()}
            style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#af2245', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}>
            <IconCamera />
          </button>
        </div>

        <h2 style={{ fontSize:20, fontWeight:700, color:'#2A1840', marginBottom:2 }}>{usuario?.alias}</h2>
        <p style={{ fontSize:11, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {usuario?.ciudad} · {usuario?.edad} años
        </p>

        {/* Stats */}
        <div style={{ display:'flex', justifyContent:'center', gap:32, marginTop:16 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#2A1840' }}>{usuario?.creditos || 0}</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>Créditos</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#2A1840' }}>{fotos.length}</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>Fotos</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color: usuario?.modo_incognito ? '#af2245' : '#2A1840' }}>
              {usuario?.modo_incognito ? 'ON' : 'OFF'}
            </div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>Incógnito</div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div style={{ margin:'0 16px 12px', padding:'10px 16px', borderRadius:12, background: mensaje.includes('Error') ? '#fef2f2' : '#f0fdf4', border: `0.5px solid ${mensaje.includes('Error') ? '#fecaca' : '#bbf7d0'}`, fontSize:13, color: mensaje.includes('Error') ? '#af2245' : '#16a34a', textAlign:'center' }}>
          {mensaje}
        </div>
      )}

      {/* ── Sección fotos ── */}
      <div style={{ margin:'0 16px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#2A1840', display:'flex', alignItems:'center', gap:6 }}>
            <IconCamera /> Mis fotos ({fotos.length}/6)
          </div>
          {fotos.length < 6 && (
            <button onClick={() => inputRef.current?.click()}
              style={{ fontSize:12, color:'#af2245', background:'none', border:'0.5px solid #af2245', borderRadius:20, padding:'4px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              <IconPlus /> Agregar
            </button>
          )}
        </div>

        {/* Input oculto — acepta múltiples */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display:'none' }}
          onChange={subirFoto}
        />

        {/* Grid de fotos */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {fotoUrls.map((url, i) => {
            const path = fotos[i]
            const esPrincipal = usuario?.foto_principal === path
            return (
              <div key={path} style={{ position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'3/4', background:'#f0d4d8' }}>
                <img src={url} alt={`Foto ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />

                {/* Badge principal */}
                {esPrincipal && (
                  <div style={{ position:'absolute', top:5, left:5, background:'#af2245', color:'white', borderRadius:8, padding:'2px 6px', fontSize:10, display:'flex', alignItems:'center', gap:3 }}>
                    <IconStar /> Principal
                  </div>
                )}

                {/* Botones acción */}
                <div style={{ position:'absolute', bottom:5, left:5, right:5, display:'flex', gap:4 }}>
                  {!esPrincipal && (
                    <button onClick={() => setFotoPrincipal(path)}
                      style={{ flex:1, padding:'4px 0', borderRadius:8, border:'none', background:'rgba(255,255,255,0.9)', fontSize:10, color:'#af2245', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                      <IconStar /> Principal
                    </button>
                  )}
                  <button onClick={() => eliminarFoto(path)}
                    style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(0,0,0,0.5)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconTrash />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Slot vacío para agregar */}
          {fotos.length < 6 && (
            <button onClick={() => inputRef.current?.click()}
              style={{ aspectRatio:'3/4', borderRadius:12, border:'2px dashed #e0bec1', background:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#e0bec1', gap:6 }}>
              {subiendo
                ? <div style={{ width:24, height:24, border:'2px solid #f0d4d8', borderTop:'2px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                : <><IconPlus /><span style={{ fontSize:10 }}>Agregar foto</span></>
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Opciones ── */}
      <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>

        {/* Incógnito */}
        <button onClick={toggleIncognito}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:16, background:'white', borderRadius:16, border:'0.5px solid #f0d4d8', cursor:'pointer', textAlign:'left' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#fff0f3', display:'flex', alignItems:'center', justifyContent:'center', color:'#af2245' }}>
            <IconLock />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Modo incógnito</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>{usuario?.modo_incognito ? 'Activado — no apareces en búsquedas' : 'Desactivado'}</div>
          </div>
          <div style={{ width:40, height:22, borderRadius:11, background: usuario?.modo_incognito ? '#af2245' : '#e5e7eb', position:'relative', transition:'background 0.2s' }}>
            <div style={{ width:18, height:18, background:'white', borderRadius:'50%', position:'absolute', top:2, left: usuario?.modo_incognito ? 20 : 2, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </button>

        {/* Créditos */}
        <button onClick={() => router.push('/creditos')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:16, background:'white', borderRadius:16, border:'0.5px solid #f0d4d8', cursor:'pointer', textAlign:'left' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#fff0f3', display:'flex', alignItems:'center', justifyContent:'center', color:'#af2245' }}>
            <IconFlame />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Mis créditos</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>{usuario?.creditos || 0} disponibles</div>
          </div>
          <span style={{ color:'#d1d5db' }}><IconChevron /></span>
        </button>

        {/* Editar perfil */}
        <button style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:16, background:'white', borderRadius:16, border:'0.5px solid #f0d4d8', cursor:'pointer', textAlign:'left' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#fff0f3', display:'flex', alignItems:'center', justifyContent:'center', color:'#af2245' }}>
            <IconEdit />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Editar perfil</div>
            <div style={{ fontSize:11, color:'#9ca3af' }}>Bio, ciudad, intereses</div>
          </div>
          <span style={{ color:'#d1d5db' }}><IconChevron /></span>
        </button>

        {/* Cerrar sesión */}
        <button onClick={cerrarSesion}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:16, background:'white', borderRadius:16, border:'0.5px solid #fecaca', cursor:'pointer', textAlign:'left', marginTop:8 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}>
            <IconLogout />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#ef4444' }}>Cerrar sesión</div>
          </div>
        </button>
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'white', borderTop:'0.5px solid #f0d4d8', display:'flex', zIndex:40, padding:'8px 0' }}>
        {[
          { icon:<IconSearch />, path:'/explorar', label:'Explorar', active:false },
          { icon:<IconMessage />, path:'/mensajes', label:'Mensajes', active:false },
          { icon:<IconFlame />, path:'/creditos', label:'Créditos', active:false },
          { icon:<IconUser />, path:'/perfil', label:'Perfil', active:true },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: item.active ? '#af2245' : '#9ca3af', fontSize:10 }}>
            {item.icon}
            <span>{item.label}</span>
            {item.active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#af2245' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
