import { Grape, Droplets, Sun, Heart } from 'lucide-react';
import vinoBotella from '@/assets/vino-botella.jpg';

const features = [
  { icon: Grape, label: '100% uva Albariño' },
  { icon: Droplets, label: 'D.O. Rías Baixas' },
  { icon: Sun, label: 'Clima atlántico' },
  { icon: Heart, label: 'Producción familiar' },
];

export function WineSection() {
  return (
    <section id="vino" className="py-24 md:py-32 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-wine mb-3 font-sans">Nuestro vino</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Nuestro Albariño
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="flex justify-center">
            <img
              src={vinoBotella}
              alt="Botella de AgroVello Albariño"
              className="h-[500px] object-contain drop-shadow-2xl"
              loading="lazy"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                AgroVello Albariño es un vino blanco fresco y elegante que refleja el carácter atlántico de Galicia.
              </p>
              <p>
                Presenta una acidez equilibrada, aromas florales y notas de cítricos y fruta de hueso, lo que lo convierte en un acompañamiento ideal para mariscos y la gastronomía gallega.
              </p>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Notas de cata</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Vista:</span> Amarillo pajizo con reflejos verdosos</p>
                <p><span className="font-medium text-foreground">Nariz:</span> Aromas florales, cítricos y fruta de hueso</p>
                <p><span className="font-medium text-foreground">Boca:</span> Fresco, equilibrado, con acidez elegante y final largo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center">
                    <Icon size={18} className="text-wine" />
                  </div>
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
