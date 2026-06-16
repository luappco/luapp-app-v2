 'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconHeart = ({ filled }: { filled?: boolean } = {}) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

interface Usuario { id: string; alias: string; edad: number; ciudad: string; bio?: string; foto_principal?: string }
interface MiPerfil { id: string; alias: string; creditos: number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)
  
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [idxDestacado, setIdxDestacado] = useState(0)
  const [idxNuevos, setIdxNuevos] = useState(0)
  const [conectados, setConectados] = useState<Usuario[]>([])
  const [visitantes, setVisitantes] = useState<Usuario[]>([])

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    
    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0 })

    const { data: usuarios } = await supabase.from('usuarios').select('id, alias, edad, ciudad, bio, foto_principal').neq('id', uid).limit(100)
    if (usuarios) {
      setPerfiles(usuarios)
      setConectados(usuarios.slice(0, 5))
      setVisitantes(usuarios.slice(5, 10))
    }

    setCargando(false)
  }

  const perfDestacado = perfiles[idxDestacado]
  const perfNuevos = perfiles[idxNuevos]

  const enviarFlechazo = async (usuarioId: string) => {
    await supabase.from('flechazos').insert({ emisor_id: userId, receptor_id: usuarioId })
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#2d1b3d 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05) }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3) }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.95)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={LOGO} alt="LUAPP" style={{ height: 28, width: 'auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => router.push('/mensajes')} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconMail()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>{IconStar()}</button>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconEye()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          </button>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconBell()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          </button>
          <div style={{ fontSize: 12, color: '#888' }}>● Conectada</div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, padding: 6 }}>Salir</button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 20, padding: 20, overflow: 'hidden' }}>
        
        {/* SIDEBAR LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* EXPANDIDA */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', marginBottom: 12, textTransform: 'uppercase' }}>Expandida</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#af2245,#f07855)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>L</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>La</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Bogotá • Nivel: Oro</div>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', height: 4, borderRadius: 2, marginBottom: 12 }}>
              <div style={{ background: 'linear-gradient(90deg,#af2245,#f07855)', height: '100%', width: '80%', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Completado 80%</div>
            <button style={{ width: '100%', padding: '8px 0', background: 'none', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>Ver perfil completo</button>
          </div>

          {/* BÚSQUEDA */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', marginBottom: 12, textTransform: 'uppercase' }}>Búsqueda</div>
            <select style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)', color: 'white', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
              <option>Ciudad...</option>
            </select>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Edad: 18 - 60 años</div>
              <input type="range" min="18" max="60" style={{ width: '100%' }} />
            </div>
            <select style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)', color: 'white', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
              <option>¿Qué buscas?</option>
            </select>
            <button style={{ width: '100%', padding: '10px 0', background: '#d4af37', color: '#1a0f2e', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase' }}>Buscar perfiles</button>
          </div>
        </div>

        {/* CENTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>2</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Visitantes de hoy</div>
              <div style={{ fontSize: 10, background: 'rgba(100,200,100,0.2)', color: '#64c864', padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>+32%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#af2245', marginBottom: 8 }}>15 ❤️</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Flechazos recibidos</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Top 5%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>5 👥</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Matches nuevos</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Chatea ya</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>0 💰</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Mis créditos</div>
              <button style={{ fontSize: 9, background: '#af2245', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, marginTop: 6, cursor: 'pointer' }}>Recargar</button>
            </div>
          </div>

          {/* CARRUSELES */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#d4af37' }}>Miembro del día 👑 Nuevos</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setIdxDestacado(Math.max(0, idxDestacado - 1))} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>{IconChevLeft()}</button>
                <button onClick={() => setIdxDestacado(Math.min(perfiles.length - 1, idxDestacado + 1))} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>{IconChevRight()}</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[0, 1, 2].map(i => {
                const p = perfiles[(idxDestacado + i) % perfiles.length]
                return p ? (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', height: 200, background: 'linear-gradient(135deg,#2A1840,#af2245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.foto_principal && <img src={p.foto_principal} alt={p.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <button style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                    <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.alias}, {p.edad}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, flex: 1 }}>{p.bio || p.ciudad}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => enviarFlechazo(p.id)} style={{ flex: 1, padding: '8px 0', background: 'rgba(175,34,69,0.2)', border: '1px solid #af2245', color: '#af2245', fontSize: 11, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{IconHeart()} Me interesa</button>
                        <button style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: 11, borderRadius: 6, cursor: 'pointer' }}>Pasar</button>
                      </div>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* CONECTADOS */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', marginBottom: 12 }}>Conectados ahora</div>
            {conectados.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', overflow: 'hidden' }}>
                  {u.foto_principal && <img src={u.foto_principal} alt={u.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{u.alias}, {u.edad}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Hablamos?</div>
                </div>
              </div>
            ))}
          </div>

          {/* VISITANTES */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', marginBottom: 12 }}>Recientes Visitantes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {visitantes.map(u => (
                <div key={u.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                  <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: 'linear-gradient(135deg,#2A1840,#af2245)' }}>
                    {u.foto_principal && <img src={u.foto_principal} alt={u.alias} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
