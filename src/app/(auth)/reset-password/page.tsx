'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [listo, setListo] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase envía el token en la URL — hay que intercambiarlo por sesión
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError('El enlace expiró o ya fue usado. Pide uno nuevo.')
        }
        setListo(true)
      })
    } else {
      // Puede venir por fragmento (#) en vez de query param
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setListo(true)
        } else {
          setError('Enlace inválido. Pide un nuevo correo de recuperación.')
          setListo(true)
        }
      })
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al actualizar. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.replace('/explorar'), 2500)
  }

  // Splash mientras intercambia el código
  if (!listo) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <img src={LOGO} alt="LUAPP" style={{ width:130, height:'auto' }} />
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
      <div style={{ marginBottom:24, textAlign:'center' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:44, width:'auto' }} />
        <p style={{ fontSize:11, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:6 }}>Tu secreto está a salvo</p>
      </div>

      <div style={{ width:'100%', maxWidth:380, background:'white', borderRadius:24, padding:32 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#2A1840', marginBottom:4 }}>Nueva contraseña</h2>
        <p style={{ fontSize:13, color:'#9ca3af', marginBottom:24 }}>Elige una contraseña segura</p>

        {success ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <p style={{ fontSize:14, color:'#16a34a', fontWeight:600 }}>¡Contraseña actualizada!</p>
            <p style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Redirigiendo a la app...</p>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                style={{ marginTop:6, width:'100%', padding:'12px 16px', borderRadius:16, border:'0.5px solid #e0bec1', fontSize:14, background:'#f9fafb', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
                style={{ marginTop:6, width:'100%', padding:'12px 16px', borderRadius:16, border:'0.5px solid #e0bec1', fontSize:14, background:'#f9fafb', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {error && (
              <p style={{ fontSize:13, color:'#af2245', textAlign:'center', marginBottom:12 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width:'100%', padding:'14px 0', borderRadius:50, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:12, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', opacity: loading ? 0.6 : 1, boxShadow:'0 8px 24px rgba(175,34,69,0.3)' }}
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
