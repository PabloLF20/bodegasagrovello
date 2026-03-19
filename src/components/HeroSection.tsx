import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import vineyardAerial from '@/assets/vineyard-aerial.jpg';
import logoHorizontal from '@/assets/logo-horizontal.png';

export function HeroSection() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={vineyardAerial}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <img
          src={logoHorizontal}
          alt="Adegas Agro Vello"
          className="h-20 md:h-28 lg:h-36 w-auto mx-auto mb-4 brightness-0 invert"
        />
        <p className="font-serif text-xl md:text-2xl text-white/90 italic mb-2">
          Albariño de tradición atlántica
        </p>
        <p className="text-base md:text-lg text-white/70 mt-4 max-w-xl mx-auto leading-relaxed">
          Una bodega familiar en el corazón de Rías Baixas elaborando Albariño desde 1999.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a
            href="#bodega"
            className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm font-sans text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Conocer la bodega
          </a>
          <a
            href="#reservar"
            className="px-8 py-3 bg-wine text-wine-foreground rounded-sm font-sans text-sm uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Reservar visita
          </a>
        </div>
      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all"
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </section>
  );
}
