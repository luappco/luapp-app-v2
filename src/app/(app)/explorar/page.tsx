 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#af2245" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

interface Usuario { id: string; alias: string; edad: number; ciudad: string; bio?: string; foto_principal?: string }
interface MiPerfil { id: string; alias: string; creditos: number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)

  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [idxCarrusel, setIdxCarrusel] = useState(0)
  const [filtroEdadMin, setFiltroEdadMin] = useState(18)
  const [filtroEdadMax, setFiltroEdadMax] = useState(60)
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [conectados, setConectados] = useState<Usuario[]>([])
  const [visitantes, setVisitantes] = useState<Usuario[]>([])
  const [stats, setStats] = useState({ visitas: 0, flechazos: 0, matches: 0 })

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)

    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0 })

    cargarPerfiles(uid)
    cargarStats(uid)
    setCargando(false)
  }

  const cargarPerfiles = async (uid: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('id, alias, edad, ciudad, bio, foto_principal')
      .neq('id', uid)
      .limit(100)

    if (data) {
      setPerfiles(data)
      setConectados(data.slice(0, 5))
      setVisitantes(data.slice(5, 10))
    }
  }

  const cargarStats = async (uid: string) => {
    const { count: v } = await supabase.from('visitantes').select('*', { count: 'exact' }).eq('visitado_id', uid)
    const { count: f } = await supabase.from('flechazos').select('*', { count: 'exact' }).eq('receptor_id', uid)
    const { count: m } = await supabase.from('matches').select('*', { count: 'exact' }).or(`usuario1.eq.${uid},usuario2.eq.${uid}`)
    setStats({ visitas: v || 0, flechazos: f || 0, matches: m || 0 })
  }

  const enviarFlechazo = async () => {
    const perfil = perfiles[idxCarrusel]
    if (!perfil) return

    await supabase.from('flechazos').insert({
      emisor_id: userId,
      receptor_id: perfil.id
    })

    setIdxCarrusel(Math.min(idxCarrusel + 1, perfiles.length - 1))
  }

  const saltar = () => {
    setIdxCarrusel(Math.min(idxCarrusel + 1, perfiles.length - 1))
  }

  const siguientePerfil = () => {
    setIdxCarrusel(Math.min(idxCarrusel + 1, perfiles.length - 1))
  }

  const anteriorPerfil = () => {
    setIdxCarrusel(Math.max(idxCarrusel - 1, 0))
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const perfil = perfiles[idxCarrusel]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#2d1b3d 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.95)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={LOGO} alt="LUAPP" style={{ height: 28, width: 'auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => router.push('/mensajes')} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconMail()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          <button onClick={() => router.push('/creditos')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>{IconStar()}</button>
          <button onClick={() => router.push('/visitantes')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconEye()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.visitas}</span>
          </button>
          <button onClick={() => router.push('/notificaciones')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, position: 'relative' }}>
            {IconBell()}
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#af2245', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.flechazos}</span>
          </button>
          <div style={{ fontSize: 12, color: '#888' }}>● Conectada</div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, padding: 6 }}>Salir</button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 20, padding: 20, overflow: 'hidden' }}>

        {/* SIDEBAR LEFT - BÚSQUEDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d4af37', marginBottom: 12, textTransform: 'uppercase' }}>Búsqueda</div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Edad: {filtroEdadMin} - {filtroEdadMax}</label>
              <input type="range" min="18" max="80" value={filtroEdadMax} onChange={(e) => setFiltroEdadMax(Number(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Ciudad</label>
              <select value={filtroCiudad} onChange={(e) => setFiltroCiudad(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.2)', color: 'white', borderRadius: 6, fontSize: 12 }}>
                <option value="">Todas</option>
                <option value="Bogotá">Bogotá</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
              </select>
            </div>

            <button style={{ width: '100%', padding: '10px 0', background: '#d4af37', color: '#1a0f2e', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase' }}>Buscar perfiles</button>
          </div>
        </div>

        {/* CENTER - CARRUSEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d4af37', marginBottom: 4 }}>{stats.visitas}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Visitas</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#af2245', marginBottom: 4 }}>{stats.flechazos}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Flechazos</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d4af37', marginBottom: 4 }}>{stats.matches}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Matches</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d4af37', marginBottom: 4 }}>{miPerfil?.creditos}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Créditos</div>
            </div>
          </div>

          {/* CARRUSEL */}
          {perfil ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
              {/* FOTO */}
              <div style={{ position: 'relative', height: 400, background: 'linear-gradient(135deg,#2A1840,#af2245)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {perfil.foto_principal && (
                  <img src={perfil.foto_principal} alt={perfil.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>

              {/* INFO */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{perfil.alias}, {perfil.edad}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}{perfil.ciudad}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{perfil.bio || 'Sin descripción'}</div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={enviarFlechazo} style={{ flex: 1, padding: '12px 0', background: 'rgba(175,34,69,0.2)', border: '1px solid #af2245', color: '#af2245', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {IconHeart()} Me interesa
                  </button>
                  <button onClick={saltar} style={{ flex: 1, padding: '12px 0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}>
                    Pasar
                  </button>
                </div>

                {/* NAVEGACIÓN */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                  <button onClick={anteriorPerfil} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {IconChevLeft()}
                  </button>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{idxCarrusel + 1} / {perfiles.length}</span>
                  <button onClick={siguientePerfil} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {IconChevRight()}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'rgba(255,255,255,0.4)' }}>
              <p>No hay más perfiles</p>
            </div>
          )}
        </div>

        {/* SIDEBAR RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* CONECTADOS */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', marginBottom: 12 }}>Conectados ahora</div>
            {conectados.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {u.foto_principal ? <img src={u.foto_principal} alt={u.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : IconUser()}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{u.alias}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{u.edad} años</div>
                </div>
              </div>
            ))}
          </div>

          {/* VISITANTES */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d4af37', marginBottom: 12 }}>Visitantes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {visitantes.map(u => (
                <div key={u.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', paddingBottom: '100%', position: 'relative', height: 0 }}>
                  {u.foto_principal && <img src={u.foto_principal} alt={u.alias} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
