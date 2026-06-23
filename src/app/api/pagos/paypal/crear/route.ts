import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYPAL_API = 'https://api-m.paypal.com'

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

const PAQUETES: Record<string, { creditos: number; precio: string; nombre: string }> = {
  '50':  { creditos: 50,  precio: '4.99',  nombre: '50 Créditos LUAPP' },
  '150': { creditos: 150, precio: '11.99', nombre: '150 Créditos LUAPP' },
  '350': { creditos: 350, precio: '24.99', nombre: '350 Créditos LUAPP' },
  '800': { creditos: 800, precio: '49.99', nombre: '800 Créditos LUAPP' },
}

export async function POST(req: NextRequest) {
  try {
    const { paquete } = await req.json()
    const pkg = PAQUETES[paquete]
    if (!pkg) return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const token = await getAccessToken()
    const base = process.env.NEXT_PUBLIC_URL

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: pkg.precio },
          description: pkg.nombre,
          custom_id: `${user.id}:${pkg.creditos}`,
        }],
        application_context: {
          brand_name: 'LUAPP',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${base}/api/pagos/paypal/confirmar`,
          cancel_url: `${base}/creditos?cancelado=1`,
        },
      }),
    })

    const order = await res.json()
    const approveUrl = order.links?.find((l: any) => l.rel === 'approve')?.href

    if (!approveUrl) return NextResponse.json({ error: 'Error creando orden PayPal' }, { status: 500 })

    return NextResponse.json({ url: approveUrl, orderId: order.id })
  } catch (err) {
    console.error('PayPal crear orden:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
