import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logoHorizontal from '@/assets/logo-horizontal.png';

const links = [
  { label: 'Bodega', href: '#bodega' },
  { label: 'Vino', href: '#vino' },
  { label: 'Visitas', href: '#visitas' },
  { label: 'Reservar', href: '#reservar' },
  { label: 'Ubicación', href: '#ubicacion' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        <a href="#hero">
          <img
            src={logoHorizontal}
            alt="Adegas Agro Vello"
            className={`h-14 md:h-16 w-auto transition-all duration-500 ${
              scrolled ? '' : 'brightness-0 invert'
            }`}
          />
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                  scrolled
                    ? 'text-foreground/80 hover:text-wine'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className={`md:hidden ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border">
          <ul className="flex flex-col items-center gap-6 py-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium tracking-wide uppercase text-foreground/80 hover:text-wine transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
