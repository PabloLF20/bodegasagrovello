export function LocationSection() {
  const mapsUrl = "https://www.google.com/maps/place/R%C3%BAa+do+Corgo,+67,+36980+O+Grove,+Pontevedra,+Spain";

  return (
    <section id="ubicacion" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-wine mb-3 font-sans">Cómo llegar</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">Ubicación</h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
          <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
            Nuestra bodega se encuentra en O Grove, en el corazón de la Denominación de Origen Rías Baixas.
          </p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-sm overflow-hidden shadow-md group relative"
        >
          <iframe
            title="Ubicación de AgroVello en O Grove, Galicia"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1180!2d-8.8577!3d42.4957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f06c9f5b0c0a1%3A0x4006e5398c0a440!2sR%C3%BAa%20do%20Corgo%2C%2067%2C%2036980%20O%20Grove%2C%20Pontevedra!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Abrir en Google Maps →
          </div>
        </a>

        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p className="font-medium text-foreground">Bodega AgroVello</p>
          <p>Rúa do Corgo, 67</p>
          <p>36980 O Grove, Pontevedra</p>
          <p>Galicia, España</p>
          <p className="mt-1">D.O. Rías Baixas</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-wine hover:text-wine/80 font-medium transition-colors underline underline-offset-4"
          >
            Cómo llegar →
          </a>
        </div>
      </div>
    </section>
  );
}
