'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
...resto del código igual

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

const paquetes = [
  { id: '50', creditos: 50, precio: 4.99, nombre: '50 Créditos' },
  { id: '150', creditos: 150, precio: 11.99, nombre: '150 Créditos', popular: true },
  { id: '350', creditos: 350, precio: 24.99, nombre: '350 Créditos' },
  { id: '800', creditos: 800, precio: 49.99, nombre: '800 Créditos' },
]

function CreditosContent() {
  const [creditos, setCreditos] = useState(0)
  const [seleccionado, setSeleccionado] = useState('150')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    cargarCreditos()
    const estado = searchParams.get('estado')
    if (estado === 'ok') setMensaje('✅ Pago exitoso. Créditos agregados.')
    if (estado === 'error') setMensaje('❌ Error en el pago. Intenta de nuevo.')
  }, [])

  const cargarCreditos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase
      .from('usuarios').select('creditos').eq('id', user.id).single()
    setCreditos(data?.creditos || 0)
  }

  const comprar = async () => {
    setCargando(true)
    const res = await fetch('/api/pagos/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paquete: seleccionado })
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setMensaje('❌ Error. Intenta de nuevo.')
      setCargando(false)
    }
  }

  const pkg = paquetes.find(p => p.id === seleccionado)

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col max-w-md mx-auto pb-24">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 text-xl">←</button>
        <h1 className="text-xl font-bold text-[#2A1840]">Comprar Créditos</h1>
      </div>

      <div className="mx-4 p-5 rounded-2xl mb-5 text-white"
        style={{ background: 'linear-gradient(135deg,#1e1b17,#2A1840)' }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-xs opacity-50 tracking-widest uppercase">Saldo actual</div>
            <div className="text-3xl font-bold">{creditos} <span className="text-sm font-normal opacity-60">créditos</span></div>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-white border border-rose-100 text-sm text-center text-gray-600">
          {mensaje}
        </div>
      )}

      <div className="px-4 mb-5">
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Elige tu paquete</p>
        <div className="grid grid-cols-2 gap-3">
          {paquetes.map(p => (
            <button key={p.id}
              onClick={() => setSeleccionado(p.id)}
              className="relative p-4 rounded-2xl border-2 text-center transition-all"
              style={{
                borderColor: seleccionado === p.id ? '#af2245' : '#e0bec1',
                background: seleccionado === p.id ? '#1e1b17' : 'white'
              }}>
              {p.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
                  ⭐ Popular
                </div>
              )}
              <div className="text-2xl font-bold mb-0.5"
                style={{ color: seleccionado === p.id ? 'white' : '#2A1840' }}>
                {p.creditos}
              </div>
              <div className="text-xs mb-2"
                style={{ color: seleccionado === p.id ? 'rgba(255,255,255,.5)' : '#8c7072' }}>
                créditos
              </div>
              <div className="text-lg font-bold"
                style={{ color: seleccionado === p.id ? '#F2C4CE' : '#af2245' }}>
                ${p.precio}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <button onClick={comprar} disabled={cargando}
          className="w-full text-white py-4 rounded-full font-medium tracking-widest uppercase text-xs disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#af2245,#f07855)',
            boxShadow: '0 8px 24px rgba(175,34,69,.3)' }}>
          {cargando ? 'Procesando...' : `Pagar $${pkg?.precio} USD`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          🔒 Pago seguro · No guardamos datos de tu tarjeta
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-rose-100 flex py-2 z-10">
        <button onClick={() => router.push('/explorar')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">🔍</span>
        </button>
        <button onClick={() => router.push('/mensajes')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">💬</span>
        </button>
        <button onClick={() => router.push('/creditos')}
          className="flex-1 flex flex-col items-center gap-0.5 text-[#af2245]">
          <span className="text-lg">🔥</span>
          <div className="w-1 h-1 rounded-full bg-[#af2245]"></div>
        </button>
        <button onClick={() => router.push('/perfil')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">👤</span>
        </button>
      </div>
    </div>
  )
}

export default function CreditosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fff8f1] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🔥</div>
      </div>
    }>
      <CreditosContent />
    </Suspense>
  )
}
