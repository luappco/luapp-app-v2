'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Usuario } from '@/types'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconSearch  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconMsg     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconFlame   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
const IconUser    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLock    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEdit    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconCamera  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const IconLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconPlus    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconStar    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconChevR   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevL   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconHeart   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconShield  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconDot     = () => <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block',marginRight:6}}/>

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [fotos, setFotos] = useState<string[]>([])
  const [fotoUrls, setFotoUrls] = useState<string[]>([])
  const [fotoIdx, setFotoIdx] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tab, setTab] = useState<'publico'|'privado'>('publico')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    // Consultas en paralelo para carga rápida
    const [{ data }, _] = await Promise.all([
      supabase.from('usuarios').select('*').eq('id', uid).single(),
      cargarFotos(uid),
    ])
    setUsuario(data)
    setCargando(false)
  }

  const cargarFotos = async (uid: string) => {
    const { data } = await supabase.storage.from('fotos').list(uid, { sortBy: { column: 'created_at', order: 'asc' } })
    if (!data) return
    const paths = data.map(f => `${uid}/${f.name}`)
    setFotos(paths)
    setFotoUrls(paths.map(p => supabase.storage.from('fotos').getPublicUrl(p).data.publicUrl))
  }

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !usuario) return
    if (fotos.length + files.length > 6) { setMensaje('Máximo 6 fotos.'); return }
    setSubiendo(true)
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${usuario.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      await supabase.storage.from('fotos').upload(path, file, { contentType: file.type })
    }
    await cargarFotos(usuario.id)
    const { data: fl } = await supabase.storage.from('fotos').list(usuario.id)
    if (fl && fl.length > 0 && !usuario.foto_principal) {
      const p = `${usuario.id}/${fl[0].name}`
      await supabase.from('usuarios').update({ foto_principal: p }).eq('id', usuario.id)
      setUsuario(prev => prev ? { ...prev, foto_principal: p } : prev)
    }
    setSubiendo(false)
    setMensaje('Fotos subidas.')
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
    await supabase.storage.from('fotos').remove([path])
    if (usuario?.foto_principal === path) {
      const nuevas = fotos.filter(f => f !== path)
      const nueva = nuevas[0] || null
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

  const cerrarSesion = async () => { await supabase.auth.signOut(); router.push('/login') }

  const fotoActual = fotoUrls[fotoIdx] || null
  const fotoPrincipalUrl = usuario?.foto_principal
    ? supabase.storage.from('fotos').getPublicUrl(usuario.foto_principal).data.publicUrl
    : null

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:120 }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const S = { // shared styles
    card: { background:'white', borderRadius:16, border:'0.5px solid #f0d4d8', padding:'16px 18px', marginBottom:12 } as React.CSSProperties,
    secTitle: { fontSize:12, fontWeight:700, color:'#af2245', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:12, display:'flex', alignItems:'center', gap:6 },
    row: { display:'flex', justifyContent:'space-between', fontSize:12, padding:'5px 0', borderBottom:'0.5px solid #f9f5f0' } as React.CSSProperties,
    label: { color:'#9ca3af' } as React.CSSProperties,
    val: { color:'#2A1840', fontWeight:500, textAlign:'right' as const },
    modBtn: { fontSize:11, color:'#af2245', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, marginTop:10, padding:0 },
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', maxWidth:480, margin:'0 auto', paddingBottom:90 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>

      {/* ── Top bar ── */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
        <img src={LOGO} alt="LUAPP" style={{ height:30, width:'auto' }} />
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
          <IconDot />{usuario?.alias}
        </div>
        <button onClick={cerrarSesion} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
          <IconLogout /> Salir
        </button>
      </div>

      {/* ── Cabecera alias + online ── */}
      <div style={{ padding:'16px 16px 0', display:'flex', alignItems:'center', gap:8 }}>
        <IconDot />
        <span style={{ fontSize:18, fontWeight:700, color:'#2A1840' }}>{usuario?.alias}</span>
        <span style={{ fontSize:11, color:'#22c55e', fontWeight:500 }}>En línea</span>
      </div>

      {/* ── Foto principal con carrusel ── */}
      <div style={{ margin:'12px 16px 0', position:'relative', borderRadius:16, overflow:'hidden', background:'#1e1b17', aspectRatio:'4/3' }}>
        {fotoActual ? (
          <img src={fotoActual} alt="foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'rgba(255,255,255,0.3)' }}>
            <IconCamera />
            <span style={{ fontSize:12 }}>Sin fotos aún</span>
          </div>
        )}

        {/* Flechas carrusel */}
        {fotoUrls.length > 1 && (
          <>
            <button onClick={() => setFotoIdx(i => (i - 1 + fotoUrls.length) % fotoUrls.length)}
              style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconChevL />
            </button>
            <button onClick={() => setFotoIdx(i => (i + 1) % fotoUrls.length)}
              style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconChevR />
            </button>
          </>
        )}

        {/* Dots */}
        {fotoUrls.length > 1 && (
          <div style={{ position:'absolute', bottom:8, left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
            {fotoUrls.map((_, i) => (
              <div key={i} onClick={() => setFotoIdx(i)}
                style={{ width: i === fotoIdx ? 16 : 6, height:6, borderRadius:3, background: i === fotoIdx ? '#af2245' : 'rgba(255,255,255,0.6)', cursor:'pointer', transition:'all 0.2s' }} />
            ))}
          </div>
        )}

        {/* % completado */}
        <div style={{ position:'absolute', bottom:12, right:12, width:36, height:36, borderRadius:'50%', background:'#af2245', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', border:'2px solid white' }}>
          80%
        </div>
      </div>

      {/* ── Acciones rápidas ── */}
      <div style={{ margin:'10px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <button onClick={() => inputRef.current?.click()}
          style={{ padding:'10px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <IconCamera /> Subir foto
        </button>
        <button onClick={() => router.push('/explorar')}
          style={{ padding:'10px 0', borderRadius:12, border:'0.5px solid #e0bec1', background:'white', color:'#af2245', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <IconHeart /> Explorar
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={subirFoto} />

      {mensaje && (
        <div style={{ margin:'0 16px 10px', padding:'8px 14px', borderRadius:10, background: mensaje.includes('Error') || mensaje.includes('Máximo') ? '#fef2f2' : '#f0fdf4', border:`0.5px solid ${mensaje.includes('Error') || mensaje.includes('Máximo') ? '#fecaca' : '#bbf7d0'}`, fontSize:12, color: mensaje.includes('Error') || mensaje.includes('Máximo') ? '#af2245' : '#16a34a', textAlign:'center' }}>
          {mensaje}
        </div>
      )}

      <div style={{ padding:'0 16px' }}>

        {/* ── Frase de presentación ── */}
        <div style={S.card}>
          <div style={S.secTitle}><IconMsg /> Frase de presentación</div>
          <p style={{ fontSize:13, color:'#4b5563', fontStyle:'italic', margin:'0 0 10px' }}>
            "{(usuario as any)?.bio || 'Agrega una frase que te describa...'}"
          </p>
          <button style={S.modBtn}><IconEdit /> Modificar</button>
        </div>

        {/* ── Datos personales ── */}
        <div style={S.card}>
          <div style={S.secTitle}><IconUser /> Datos personales</div>
          {[
            ['Ciudad', usuario?.ciudad],
            ['País', 'Colombia'],
            ['Edad', usuario?.edad ? `${usuario.edad} años` : '—'],
            ['Busca', (usuario as any)?.busca || '—'],
            ['Modo incógnito', usuario?.modo_incognito ? 'Activado' : 'Desactivado'],
          ].map(([lbl, val]) => (
            <div key={lbl as string} style={S.row}>
              <span style={S.label}>{lbl}</span>
              <span style={S.val}>{val || '—'}</span>
            </div>
          ))}
          <button style={S.modBtn}><IconEdit /> Modificar</button>
        </div>

        {/* ── Fotos / Book ── */}
        <div style={S.card}>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {(['publico','privado'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex:1, padding:'7px 0', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                  background: tab === t ? 'linear-gradient(135deg,#af2245,#f07855)' : '#f9f5f0',
                  color: tab === t ? 'white' : '#9ca3af' }}>
                {t === 'publico' ? `Fotos públicas (${fotos.length})` : 'Álbum privado'}
              </button>
            ))}
          </div>

          {tab === 'publico' ? (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {fotoUrls.map((url, i) => {
                  const path = fotos[i]
                  const esPrincipal = usuario?.foto_principal === path
                  return (
                    <div key={path} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'3/4', background:'#f0d4d8' }}>
                      <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {esPrincipal && (
                        <div style={{ position:'absolute', top:4, left:4, background:'#af2245', color:'white', borderRadius:6, padding:'1px 5px', fontSize:9, display:'flex', alignItems:'center', gap:2 }}>
                          <IconStar /> Principal
                        </div>
                      )}
                      <div style={{ position:'absolute', bottom:4, left:4, right:4, display:'flex', gap:3 }}>
                        {!esPrincipal && (
                          <button onClick={() => setFotoPrincipal(path)}
                            style={{ flex:1, padding:'3px 0', borderRadius:6, border:'none', background:'rgba(255,255,255,0.9)', fontSize:9, color:'#af2245', cursor:'pointer' }}>
                            Principal
                          </button>
                        )}
                        <button onClick={() => eliminarFoto(path)}
                          style={{ width:24, height:24, borderRadius:6, border:'none', background:'rgba(0,0,0,0.5)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {fotos.length < 6 && (
                  <button onClick={() => inputRef.current?.click()}
                    style={{ aspectRatio:'3/4', borderRadius:10, border:'2px dashed #e0bec1', background:'#fafafa', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#e0bec1', gap:4 }}>
                    {subiendo
                      ? <div style={{ width:20, height:20, border:'2px solid #f0d4d8', borderTop:'2px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                      : <><IconPlus /><span style={{ fontSize:9 }}>Agregar</span></>}
                  </button>
                )}
              </div>
              {fotos.length < 6 && (
                <button onClick={() => inputRef.current?.click()}
                  style={{ width:'100%', marginTop:10, padding:'8px 0', borderRadius:20, border:'0.5px solid #af2245', background:'none', color:'#af2245', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <IconPlus /> Añadir una foto
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'24px 0', color:'#9ca3af' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#f0d4d8', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', color:'#af2245' }}>
                <IconLock />
              </div>
              <p style={{ fontSize:13, marginBottom:10 }}>Álbum privado — solo para tus matches</p>
              <button onClick={() => inputRef.current?.click()}
                style={{ padding:'8px 20px', borderRadius:20, border:'0.5px solid #af2245', background:'none', color:'#af2245', fontSize:12, cursor:'pointer' }}>
                Añadir foto privada
              </button>
            </div>
          )}
        </div>

        {/* ── Configuración ── */}
        <div style={S.card}>
          <div style={S.secTitle}><IconShield /> Configuración</div>

          {/* Incógnito */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid #f9f5f0' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Modo incógnito</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{usuario?.modo_incognito ? 'No apareces en búsquedas' : 'Visible para todos'}</div>
            </div>
            <button onClick={toggleIncognito}
              style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background: usuario?.modo_incognito ? '#af2245' : '#e5e7eb', position:'relative', transition:'background 0.2s' }}>
              <div style={{ width:20, height:20, background:'white', borderRadius:'50%', position:'absolute', top:2, left: usuario?.modo_incognito ? 22 : 2, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Créditos */}
          <button onClick={() => router.push('/creditos')}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', background:'none', border:'none', borderBottom:'0.5px solid #f9f5f0', cursor:'pointer' }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Mis créditos</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{usuario?.creditos || 0} disponibles</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#af2245' }}>{usuario?.creditos || 0}</span>
              <IconChevR />
            </div>
          </button>

          {/* Editar perfil */}
          <button style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', background:'none', border:'none', cursor:'pointer' }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2A1840' }}>Editar perfil</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>Bio, ciudad, intereses</div>
            </div>
            <IconChevR />
          </button>
        </div>

        {/* ── Cerrar sesión ── */}
        <button onClick={cerrarSesion}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:14, background:'white', borderRadius:16, border:'0.5px solid #fecaca', cursor:'pointer', marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}>
            <IconLogout />
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:'#ef4444' }}>Cerrar sesión</span>
        </button>
      </div>

      {/* ── Bottom Nav ── */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'white', borderTop:'0.5px solid #f0d4d8', display:'flex', zIndex:40, padding:'8px 0' }}>
        {[
          { icon:<IconSearch />, path:'/explorar', label:'Explorar', active:false },
          { icon:<IconMsg />, path:'/mensajes', label:'Mensajes', active:false },
          { icon:<IconFlame />, path:'/creditos', label:'Créditos', active:false },
          { icon:<IconUser />, path:'/perfil', label:'Perfil', active:true },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', color: item.active ? '#af2245' : '#9ca3af', fontSize:10 }}>
            {item.icon}<span>{item.label}</span>
            {item.active && <span style={{ width:4, height:4, borderRadius:'50%', background:'#af2245' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
