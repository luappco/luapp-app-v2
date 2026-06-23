import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYPAL_API = 'https://api-m.paypal.com'

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('token')
  const base = process.env.NEXT_PUBLIC_URL

  if (!orderId) return NextResponse.redirect(`${base}/creditos?error=1`)

  try {
    const token = await getAccessToken()

    // Capturar el pago
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    const capture = await res.json()

    if (capture.status !== 'COMPLETED') {
      return NextResponse.redirect(`${base}/creditos?error=1`)
    }

    // Extraer usuario y créditos del custom_id
    const customId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
    if (!customId) return NextResponse.redirect(`${base}/creditos?error=1`)

    const [usuarioId, creditosStr] = customId.split(':')
    const creditos = parseInt(creditosStr)
    const monto = parseFloat(capture.purchase_units[0].payments.captures[0].amount.value)

    const supabase = await createClient()

    // Sumar créditos
    await supabase.rpc('sumar_creditos', { p_usuario_id: usuarioId, p_creditos: creditos })

    // Registrar transacción
    await supabase.from('transacciones').insert({
      usuario_id: usuarioId,
      creditos,
      descripcion: `Compra ${creditos} créditos - PayPal`,
      pago_id: orderId,
      pago_metodo: 'paypal',
      estado: 'completado',
      proveedor: 'paypal',
      metadata: { capture_id: capture.purchase_units[0].payments.captures[0].id, monto },
    })

    return NextResponse.redirect(`${base}/creditos?exito=1&creditos=${creditos}`)
  } catch (err) {
    console.error('PayPal confirmar:', err)
    return NextResponse.redirect(`${base}/creditos?error=1`)
  }
}
