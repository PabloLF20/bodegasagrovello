import { Mail, Phone, MapPin, Instagram } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">AgroVello</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Bodega familiar en O Grove, Rías Baixas. Elaborando Albariño desde 1996.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-3">
                <Phone size={16} />
                <span>+34 634 411 323</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} />
                <span>webagrovello@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Rúa do Corgo, 67, 36980 O Grove, Pontevedra</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Síguenos</h4>
            <a
              href="https://www.instagram.com/bodega_agrovello/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
              aria-label="Síguenos en Instagram"
            >
              <Instagram size={18} />
              <span>Síguenos en Instagram</span>
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} AgroVello – Bodega familiar en Rías Baixas</p>
          <p className="mt-1">D.O. Rías Baixas · O Grove, Galicia</p>
        </div>
      </div>
    </footer>
  );
}
