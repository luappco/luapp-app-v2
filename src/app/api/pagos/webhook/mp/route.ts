import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    )

    const payment = await response.json()

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const { usuario_id, creditos } = payment.metadata
    if (!usuario_id || !creditos) return NextResponse.json({ ok: true })

    const supabase = await createClient()

    await supabase.rpc('sumar_creditos', {
      p_usuario_id: usuario_id,
      p_creditos: creditos
    })

    await supabase.from('transacciones').insert({
      usuario_id,
      tipo: 'compra',
      creditos,
      descripcion: `Compra ${creditos} créditos`,
      pago_id: String(paymentId),
      pago_metodo: 'mercadopago'
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}