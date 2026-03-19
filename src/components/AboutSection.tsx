import vineyardAerial from '@/assets/vineyard-aerial.jpg';
import bodegaInterior from '@/assets/bodega-interior.jpg';

export function AboutSection() {
  return (
    <section id="bodega" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-wine mb-3 font-sans">Nuestra historia</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Nuestra bodega
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Somos una bodega familiar fundada en 1999, situada en O Grove, en pleno corazón de la Denominación de Origen Rías Baixas.
            </p>
            <p>
              Desde nuestros inicios nos hemos dedicado a la elaboración de Albariño 100%, trabajando con uva procedente de viñedos propios y cuidando cada etapa del proceso, desde el cultivo de la vid hasta el embotellado.
            </p>
            <p>
              Nuestra forma de trabajar se basa en una filosofía sencilla: respeto por la tierra, atención al viñedo y elaboración tradicional. Todo ello con el objetivo de reflejar en cada botella el carácter atlántico que define a esta zona.
            </p>
          </div>
          <div className="relative">
            <img
              src={vineyardAerial}
              alt="Vista aérea de los viñedos de AgroVello"
              className="w-full h-[400px] object-cover rounded-sm"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <img
              src={bodegaInterior}
              alt="Interior de la bodega AgroVello"
              className="w-full h-[400px] object-cover rounded-sm"
              loading="lazy"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              A lo largo de los años hemos mantenido el carácter familiar de la bodega, apostando por una producción cuidada y cercana, donde la calidad y la identidad del territorio son siempre la prioridad.
            </p>
            <p>
              Hoy seguimos trabajando con la misma ilusión con la que empezamos, compartiendo nuestro Albariño y abriendo las puertas de la bodega a quienes desean conocer de cerca el mundo del vino en O Grove.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
