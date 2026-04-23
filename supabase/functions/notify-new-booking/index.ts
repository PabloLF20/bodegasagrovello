import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TO_EMAIL = 'webagrovello@gmail.com'

const VISIT_LABELS: Record<string, string> = {
  bodega_1_vino: 'Visita + 1 vino (8 €/pers)',
  bodega_2_vinos: 'Visita + 2 vinos (11 €/pers)',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const booking = await req.json()

    const visitLabel = VISIT_LABELS[booking.visit_type] || booking.visit_type

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c2d2d; margin-bottom: 4px;">Nueva solicitud de reserva</h2>
        <p style="color: #888; font-size: 13px; margin-top: 0;">AgroVello — Panel de reservas</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr><td style="padding: 8px 0; color: #555; width: 140px;"><strong>Nombre</strong></td><td>${booking.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Teléfono</strong></td><td>${booking.phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Email</strong></td><td>${booking.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Personas</strong></td><td>${booking.guests}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Fecha de visita</strong></td><td>${booking.booking_date}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Hora</strong></td><td>${booking.booking_time}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Tipo de visita</strong></td><td>${visitLabel}</td></tr>
          ${booking.message ? `<tr><td style="padding: 8px 0; color: #555; vertical-align: top;"><strong>Mensaje</strong></td><td>${booking.message}</td></tr>` : ''}
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa;">Gestiona esta reserva desde el panel de administración de AgroVello.</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AgroVello Reservas <reservas@agrovello.com>',
        to: [TO_EMAIL],
        subject: `Nueva reserva — ${booking.name} · ${booking.booking_date} ${booking.booking_time}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: 'Email send failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    console.error('Function error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
