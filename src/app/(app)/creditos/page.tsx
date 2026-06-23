 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

interface MiPerfil { id: string; alias: string; creditos: number; genero: string }

export default function CreditosPage() {
  const router = useRouter()
  const supabase = createClient()

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)

  useEffect(() => { init() }, [])

  // Mostrar resultado del pago al volver de PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('exito')) {
      const c = params.get('creditos')
      alert(`Pago exitoso. Se agregaron ${c} créditos a tu cuenta.`)
      window.history.replaceState({}, '', '/creditos')
    } else if (params.get('error')) {
      alert('Hubo un error con el pago. Intenta de nuevo.')
      window.history.replaceState({}, '', '/creditos')
    } else if (params.get('cancelado')) {
      window.history.replaceState({}, '', '/creditos')
    }
  }, [])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    await cargarCreditos(uid)
    setCargando(false)
  }

  const cargarCreditos = async (uid: string) => {
    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos, genero').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0, genero: p.genero })
  }

  // Suscribir a cambios de créditos en tiempo real
  useEffect(() => {
    if (!userId) return
    const sub = supabase
      .channel(`creditos_${userId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${userId}` },
        (payload: any) => {
          setMiPerfil(prev => prev ? { ...prev, creditos: payload.new.creditos } : prev)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [userId])

  const comprarCreditos = async (paquete: string, metodo: 'paypal' | 'mercadopago') => {
    setProcesando(true)
    try {
      const endpoint = metodo === 'paypal' ? '/api/pagos/paypal/crear' : '/api/pagos/mercadopago'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paquete }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al procesar el pago. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error pago:', error)
      alert('Error al procesar la compra')
    }
    setProcesando(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const paquetes = [
    { creditos: 50, precio: 4.99, desc: 'Básico' },
    { creditos: 150, precio: 11.99, desc: 'Popular', popular: true },
    { creditos: 350, precio: 24.99, desc: 'Premium' },
    { creditos: 800, precio: 49.99, desc: 'VIP' }
  ]

  const essMujer = miPerfil?.genero?.toLowerCase() === 'mujer'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.85)', borderBottom: '1px solid rgba(212,175,55,0.22)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/explorar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', padding: 2 }}>
            {IconArrowLeft()}
          </button>
          <img src={LOGO} alt="LUAPP" style={{ height: 28, width: 'auto', filter: 'brightness(1.3)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!essMujer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Créditos:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#d4af37' }}>{miPerfil?.creditos}</span>
            </div>
          )}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 2 }}>
            {IconLogout()}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          {essMujer ? (
            // MENSAJE PARA MUJERES
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>💎</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>¡Eres especial!</h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 30 }}>
                No necesitas créditos para usar LUAPP. <br />
                <strong>Los hombres pagan por la oportunidad de hablarte.</strong>
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 30 }}>
                Disfruta de mensajes ilimitados, chats, y todas las funciones premium de forma completamente gratuita.
              </p>
              <button onClick={() => router.push('/explorar')} style={{ padding: '12px 32px', background: 'linear-gradient(135deg,#af2245,#f07855)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Volver a Explorar
              </button>
            </div>
          ) : (
            // TIENDA PARA HOMBRES
            <>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Compra Créditos</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 40 }}>Los créditos te permiten enviar mensajes a otros usuarios</p>

              {/* SALDO ACTUAL */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: 20, marginBottom: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>SALDO ACTUAL</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#d4af37' }}>{miPerfil?.creditos}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>créditos disponibles</div>
              </div>

              {/* PAQUETES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                {paquetes.map((p, i) => (
                  <div key={i} style={{ background: p.popular ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)', border: p.popular ? '2px solid rgba(212,175,55,0.4)' : '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: 16, position: 'relative', textAlign: 'center' }}>
                    {p.popular && <div style={{ position: 'absolute', top: -12, left: 0, right: 0, background: '#d4af37', color: '#1a0f2e', padding: '4px 12px', borderRadius: 4, fontSize: 10, fontWeight: 700, width: 'fit-content', margin: '0 auto' }}>⭐ MÁS POPULAR</div>}
                    
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8, marginTop: p.popular ? 12 : 0 }}>{p.creditos}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>créditos</div>
                    <div style={{ fontSize: 13, color: '#d4af37', fontWeight: 700, marginBottom: 14 }}>${p.precio}</div>
                    <button onClick={() => comprarCreditos(String(p.creditos), 'paypal')} disabled={procesando}
                      style={{ width: '100%', padding: '9px 0', background: '#0070ba', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: procesando ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.828l-1.348 8.56h3.875c.524 0 .968-.382 1.05-.9l.893-5.655h2.363c4.298 0 7.664-1.747 8.647-6.797.291-1.495.13-2.7-.086-3.003z"/></svg>
                      PayPal
                    </button>
                    <button onClick={() => comprarCreditos(String(p.creditos), 'mercadopago')} disabled={procesando}
                      style={{ width: '100%', padding: '9px 0', background: '#009ee3', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: procesando ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><path fill="#009ee3" d="M7 12h10M12 7v10" stroke="white" strokeWidth="2"/></svg>
                      MercadoPago
                    </button>
                  </div>
                ))}
              </div>

              {/* INFO */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>Pago 100% seguro · No guardamos datos de tarjeta</span>
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" style={{ height:18, borderRadius:3 }} />
                  <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large@2x.png" alt="MercadoPago" style={{ height:18, borderRadius:3 }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
