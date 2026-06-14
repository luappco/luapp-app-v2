 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconMail = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = ({ filled }: { filled?: boolean } = { filled: false }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#d4af37' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = ({ filled = false }: { filled?: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

interface MiPerfil { id: string; alias: string; creditos: number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [contadores, setContadores] = useState({ mensajes: 0, notificaciones: 0 })

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0 })
    
    // Cargar contadores
    const { count: msgCount } = await supabase.from('matches').select('*', { count: 'exact' }).eq('usuario1', uid).or(`usuario2.eq.${uid}`)
    const { count: notCount } = await supabase.from('flechazos').select('*', { count: 'exact' }).eq('receptor_id', uid)
    
    setContadores({ mensajes: msgCount || 0, notificaciones: notCount || 0 })
    setCargando(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.85)', borderBottom: '1px solid rgba(212,175,55,0.22)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(8px)' }}>
        <img src={LOGO} alt="LUAPP" style={{ height: 32, width: 'auto', filter: 'brightness(1.3)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {/* BOTÓN MENSAJES */}
          <button onClick={() => router.push('/mensajes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', position: 'relative', padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconMail()}
            {contadores.mensajes > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#af2245', color: 'white', borderRadius: '50%', minWidth: 14, height: 14, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #1a0f2e' }}>
                {contadores.mensajes}
              </span>
            )}
          </button>

          {/* BOTÓN CRÉDITOS */}
          <button onClick={() => router.push('/creditos')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconStar()}
          </button>

          {/* BOTÓN VISITANTES */}
          <button onClick={() => router.push('/visitantes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', position: 'relative', padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconEye()}
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#af2245', color: 'white', borderRadius: '50%', minWidth: 14, height: 14, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #1a0f2e' }}>
              2
            </span>
          </button>

          {/* BOTÓN NOTIFICACIONES */}
          <button onClick={() => router.push('/notificaciones')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', position: 'relative', padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconBell()}
            {contadores.notificaciones > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', minWidth: 14, height: 14, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #1a0f2e' }}>
                {contadores.notificaciones}
              </span>
            )}
          </button>

          {/* BOTÓN LOGOUT */}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12, padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconLogout()}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 12 }}>Explorar Perfiles</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Componente de exploración aquí</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Usa los botones del top para acceder a Mensajes, Créditos, Visitantes y Notificaciones</p>
        </div>
      </div>
    </div>
  )
}
