import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const VISIT_LABELS: Record<string, string> = {
  bodega_1_vino: 'Visita guiada + degustación de 1 vino (8 €/pers)',
  bodega_2_vinos: 'Visita guiada + degustación de 2 vinos (11 €/pers)',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
    const formattedDate = formatDate(booking.booking_date)

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #faf9f6;">

        <!-- Cabecera con logo -->
        <div style="background: #2c1810; padding: 32px; text-align: center;">
          <img
            src="https://bodegasagrovello.com/logo-horizontal.png"
            alt="Bodega AgroVello"
            style="max-width: 220px; height: auto; display: block; margin: 0 auto;"
          />
        </div>

        <!-- Cuerpo -->
        <div style="padding: 40px 32px;">

          <!-- Mensaje de gratitud -->
          <div style="text-align: center; margin-bottom: 36px;">
            <p style="color: #a07c44; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px 0;">
              Reserva confirmada
            </p>
            <h2 style="font-family: Georgia, serif; color: #2c1810; font-size: 26px; font-weight: normal; margin: 0 0 16px 0;">
              ¡Muchas gracias, ${booking.name}!
            </h2>
            <p style="color: #6b5744; font-size: 16px; line-height: 1.7; margin: 0;">
              Es un placer tenerte en nuestra bodega.<br />
              Tu visita ha sido confirmada y te esperamos con los brazos abiertos<br />
              para compartir contigo el auténtico Albariño de las Rías Baixas.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #d4c5a0; margin: 0 0 32px 0;" />

          <!-- Detalles de la reserva -->
          <div style="background: #fff; border: 1px solid #e8dcc8; border-radius: 4px; padding: 24px; margin-bottom: 28px;">
            <h3 style="color: #7c2d2d; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
              Detalles de tu visita
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #4a3728;">
              <tr>
                <td style="padding: 9px 0; color: #8a7060; width: 130px; vertical-align: top; border-bottom: 1px solid #f0e8d8;">Fecha</td>
                <td style="padding: 9px 0; font-weight: bold; text-transform: capitalize; border-bottom: 1px solid #f0e8d8;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #8a7060; vertical-align: top; border-bottom: 1px solid #f0e8d8;">Hora</td>
                <td style="padding: 9px 0; font-weight: bold; border-bottom: 1px solid #f0e8d8;">${booking.booking_time}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #8a7060; vertical-align: top; border-bottom: 1px solid #f0e8d8;">Personas</td>
                <td style="padding: 9px 0; border-bottom: 1px solid #f0e8d8;">${booking.guests}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #8a7060; vertical-align: top;">Visita</td>
                <td style="padding: 9px 0;">${visitLabel}</td>
              </tr>
            </table>
          </div>

          <!-- Dirección -->
          <div style="background: #f0ebe0; border-left: 3px solid #a07c44; padding: 20px 24px; margin-bottom: 32px;">
            <p style="color: #4a3728; font-size: 14px; margin: 0 0 6px 0; font-weight: bold;">📍 Te esperamos aquí</p>
            <p style="color: #6b5744; font-size: 14px; margin: 0; line-height: 1.7;">
              Bodega AgroVello<br />
              Rúa do Corgo, 67<br />
              36980 O Grove, Pontevedra<br />
              Galicia, España
            </p>
          </div>

          <!-- Nota -->
          <p style="color: #8a7060; font-size: 13px; line-height: 1.7; margin: 0;">
            Si necesitas cambiar la fecha o tienes cualquier pregunta, responde a este correo y te ayudaremos encantados.
          </p>

        </div>

        <!-- Pie -->
        <div style="background: #2c1810; padding: 20px 32px; text-align: center;">
          <p style="color: #a07c44; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px 0;">
            Bodega AgroVello
          </p>
          <p style="color: #7a5c40; font-size: 11px; margin: 0;">
            Rúa do Corgo, 67 · 36980 O Grove, Pontevedra · D.O. Rías Baixas
          </p>
        </div>

      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Bodega AgroVello <reservas@bodegasagrovello.com>',
        to: [booking.email],
        subject: `Reserva confirmada — ${formattedDate} a las ${booking.booking_time}`,
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
