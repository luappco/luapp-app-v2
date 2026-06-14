 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconCrown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconHeart = ({ filled }: { filled?: boolean } = {}) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#c97a6f' : 'none'} stroke={filled ? '#c97a6f' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>

interface Usuario { id: string; alias: string; edad: number; ciudad: string; bio?: string; foto_principal?: string }
interface MiPerfil { id: string; alias: string; creditos: number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [idx, setIdx] = useState(0)
  const [stats, setStats] = useState({ visitas: 0, flechazos: 0, matches: 0 })

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    
    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0 })

    const { data: usuarios } = await supabase.from('usuarios').select('id, alias, edad, ciudad, bio, foto_principal').neq('id', uid).limit(50)
    if (usuarios) setPerfiles(usuarios)

    const { count: v } = await supabase.from('visitantes').select('*', { count: 'exact' }).eq('visitado_id', uid)
    const { count: f } = await supabase.from('flechazos').select('*', { count: 'exact' }).eq('receptor_id', uid)
    const { count: m } = await supabase.from('matches').select('*', { count: 'exact' }).or(`usuario1.eq.${uid},usuario2.eq.${uid}`)
    
    setStats({ visitas: v || 0, flechazos: f || 0, matches: m || 0 })
    setCargando(false)
  }

  const perfil = perfiles[idx]
  const enviarFlechazo = async () => {
    if (!perfil) return
    await supabase.from('flechazos').insert({ emisor_id: userId, receptor_id: perfil.id })
    setIdx(idx + 1)
  }
  const saltar = () => setIdx(idx + 1)
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '2px solid rgba(200,180,150,0.2)', borderTop: '2px solid #c8b496', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#e0e0e0', display: 'flex', fontFamily: '"Trebuchet MS", sans-serif' }}>
      <style>{`
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05) }
        ::-webkit-scrollbar-thumb { background: rgba(200,180,150,0.3); border-radius: 3px }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: '#252525', borderRight: '1px solid rgba(200,180,150,0.1)', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: 30 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c8b496', letterSpacing: 1 }}>LUAPP</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { icon: IconHome(), label: 'Panel Principal', id: 'main' },
            { icon: IconSearch(), label: 'Búsqueda Avanzada', id: 'search' },
            { icon: IconChat(), label: 'Conversaciones', onClick: () => router.push('/mensajes') },
            { icon: IconUsers(), label: 'Matches', id: 'matches' },
            { icon: IconCrown(), label: 'Mi Suscripción', id: 'sub' },
          ].map(item => (
            <button key={item.id} onClick={item.onClick || (() => {})} style={{ background: 'none', border: 'none', padding: '12px 20px', color: '#a0a0a0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, transition: 'all 0.2s', textAlign: 'left' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#c8b496'; e.currentTarget.style.background = 'rgba(200,180,150,0.05)' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.background = 'none' }}>
              <span style={{ opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 20px', borderTop: '1px solid rgba(200,180,150,0.1)', paddingTop: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>MI PERFIL</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c8b496', marginBottom: 4 }}>{miPerfil?.alias}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Status: En línea</div>
            <div style={{ height: 3, background: 'rgba(200,180,150,0.2)', borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#c8b496,#d4a574)', width: '70%', borderRadius: 2 }} />
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '10px 0', background: 'none', border: '1px solid rgba(200,180,150,0.2)', color: '#888', fontSize: 12, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,180,150,0.05)'; e.currentTarget.style.color = '#c8b496' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888' }}>
            {IconLogout()} Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#1a1a1a 0%,#222222 100%)' }}>
        {/* TOP BAR */}
        <div style={{ borderBottom: '1px solid rgba(200,180,150,0.1)', padding: '12px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: '#888' }}>Panel Principal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/mensajes')} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', padding: 4 }} onMouseEnter={(e) => e.currentTarget.style.color = '#c8b496'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}>✉️</button>
            <span style={{ fontSize: 12, color: '#888' }}>{miPerfil?.creditos} créditos</span>
            <button style={{ padding: '6px 12px', background: 'rgba(200,180,150,0.1)', border: '1px solid rgba(200,180,150,0.2)', color: '#c8b496', fontSize: 11, cursor: 'pointer', borderRadius: 3 }}>Premium</button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, borderBottom: '1px solid rgba(200,180,150,0.1)' }}>
          {[
            { label: 'Visitas Recientes', value: stats.visitas, sub: 'Últimas 30 días' },
            { label: 'Flechazos recibidos', value: stats.flechazos, sub: 'Top 5% activos' },
            { label: 'Matches nuevos', value: stats.matches, sub: 'Conexiones' },
            { label: 'Suscripción Premium', value: 'Nivel Oro', sub: 'Renovación en 15 días' }
          ].map((s, i) => (
            <div key={i} style={{ padding: 20, border: '1px solid rgba(200,180,150,0.15)', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: '#c8b496', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CARRUSEL */}
        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c8b496', marginBottom: 20 }}>MIEMBRO DESTACADO</div>
          
          {perfil ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, flex: 1 }}>
              {/* FOTO */}
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', minHeight: 400 }}>
                {perfil.foto_principal && (
                  <img src={perfil.foto_principal} alt={perfil.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.7) 100%)', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: 'white', marginBottom: 4 }}>{perfil.alias}, {perfil.edad}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{perfil.ciudad}</div>
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>DESCRIPCIÓN</div>
                  <div style={{ fontSize: 13, color: '#c0c0c0', lineHeight: 1.6 }}>
                    {perfil.bio || 'Sin descripción'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={enviarFlechazo} style={{ padding: '12px 20px', background: 'rgba(201, 122, 111, 0.2)', border: '1px solid #c97a6f', color: '#c97a6f', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 122, 111, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 122, 111, 0.2)'}>
                    {IconHeart()} Me interesa
                  </button>
                  <button onClick={saltar} style={{ padding: '12px 20px', background: 'rgba(200,180,150,0.1)', border: '1px solid rgba(200,180,150,0.2)', color: '#a0a0a0', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,180,150,0.15)'; e.currentTarget.style.color = '#c8b496' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,180,150,0.1)'; e.currentTarget.style.color = '#a0a0a0' }}>
                    {IconX()} Pasar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              No hay más perfiles
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
