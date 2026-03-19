import { Clock, Users, Wine, MapPin } from 'lucide-react';
import embotellado from '@/assets/embotellado.jpg';

const experiencia = [
  { icon: MapPin, text: 'Visita guiada por la bodega' },
  { icon: Wine, text: 'Explicación del proceso de elaboración' },
  { icon: Users, text: 'Recorrido por las instalaciones' },
  { icon: Clock, text: 'Degustación de vino' },
];

export function VisitsSection() {
  return (
    <section id="visitas" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-wine mb-3 font-sans">Experiencia</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Visita AgroVello
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <img
              src={embotellado}
              alt="Proceso de embotellado en la bodega"
              className="w-full h-[450px] object-cover rounded-sm"
              loading="lazy"
            />
          </div>

          <div className="space-y-8">
            <p className="text-muted-foreground leading-relaxed text-lg">
              Invitamos a los visitantes a descubrir nuestra bodega y conocer de cerca el proceso de elaboración del Albariño.
            </p>

            <div className="space-y-5">
              <h3 className="font-serif text-xl font-semibold text-foreground">La experiencia incluye:</h3>
              {experiencia.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Duración aproximada:</span> 30 – 40 minutos
              </p>
              <p className="text-sm text-muted-foreground">
                Las visitas se realizan en grupos reducidos para ofrecer una experiencia cercana y personalizada.
              </p>
            </div>

            <a
              href="#reservar"
              className="inline-block px-8 py-3 bg-wine text-wine-foreground rounded-sm font-sans text-sm uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Reservar visita
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
