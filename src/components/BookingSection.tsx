import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAvailability } from '@/hooks/useAvailability';
import { useScheduleConfig } from '@/hooks/useScheduleConfig';
import { toast } from 'sonner';

const VISIT_TYPES = [
  {
    value: 'bodega_1_vino',
    label: 'Visita guiada a la bodega + degustación de 1 vino',
    price: 8,
  },
  {
    value: 'bodega_2_vinos',
    label: 'Visita guiada a la bodega + degustación de 2 vinos',
    price: 11,
  },
] as const;

const bookingSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(100),
  email: z.string().trim().email('Email no válido').max(255),
  phone: z.string().trim().min(6, 'Teléfono no válido').max(20),
  guests: z.string().min(1, 'Selecciona el número de personas'),
  date: z.date({ required_error: 'Selecciona una fecha' }),
  time: z.string().min(1, 'Selecciona una hora'),
  visit_type: z.string().min(1, 'Selecciona el tipo de visita'),
  message: z.string().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', visit_type: '' },
  });

  const selectedDate = form.watch('date');
  const { isFull, spotsLeft, isLoading: availLoading } = useAvailability(selectedDate);
  const { getTimesForDate, isDayOpen, isLoading: schedLoading } = useScheduleConfig();
  const tourTimes = getTimesForDate(selectedDate);

  async function onSubmit(data: BookingFormValues) {
    setSubmitting(true);
    try {
      const bookingDate = format(data.date, 'yyyy-MM-dd');
      const { error } = await supabase.from('bookings').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        guests: parseInt(data.guests),
        booking_date: bookingDate,
        booking_time: data.time,
        visit_type: data.visit_type,
        message: data.message || null,
      });
      if (error) throw error;

      supabase.functions.invoke('notify-new-booking', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          guests: data.guests,
          booking_date: bookingDate,
          booking_time: data.time,
          visit_type: data.visit_type,
          message: data.message || null,
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }).catch((err) => console.error('Notification error:', err));

      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setSubmitted(true);
    } catch (err: any) {
      toast.error('Error al enviar la reserva. Inténtalo de nuevo.');
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section id="reservar" className="py-24 md:py-32 bg-cream">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <CheckCircle size={56} className="mx-auto text-forest mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¡Solicitud recibida!
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tu solicitud de reserva ha sido recibida. Nos pondremos en contacto contigo para confirmar disponibilidad.
          </p>
          <button
            onClick={() => { setSubmitted(false); form.reset(); }}
            className="mt-8 text-wine underline underline-offset-4 hover:opacity-80 transition-opacity text-sm"
          >
            Hacer otra reserva
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="reservar" className="py-24 md:py-32 bg-cream">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-wine mb-3 font-sans">Reservas</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Reservar visita
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
          <p className="text-muted-foreground mt-6">
            Rellena el formulario y nos pondremos en contacto para confirmar tu visita.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+34 600 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo de visita */}
            <FormField
              control={form.control}
              name="visit_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de visita</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {VISIT_TYPES.map((vt) => (
                        <label
                          key={vt.value}
                          className={cn(
                            'flex items-start gap-3 p-4 rounded-sm border cursor-pointer transition-colors',
                            field.value === vt.value
                              ? 'border-wine bg-wine/5'
                              : 'border-border hover:border-wine/40'
                          )}
                        >
                          <RadioGroupItem value={vt.value} className="mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm text-foreground">{vt.label}</span>
                            <span className="block text-sm font-semibold text-wine mt-1">
                              {vt.price}€ por persona
                            </span>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personas</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nº" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} {n === 1 ? 'persona' : 'personas'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            field.onChange(d);
                            form.setValue('time', '');
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;
                            if (schedLoading) return true;
                            return !isDayOpen(date);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedDate || availLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={availLoading ? 'Cargando...' : 'Hora'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tourTimes.map((t) => {
                          const full = isFull(t);
                          const left = spotsLeft(t);
                          return (
                            <SelectItem key={t} value={t} disabled={full}>
                              {t} — {full ? 'Completo' : `${left} plazas`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Alguna petición especial o pregunta?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-wine text-wine-foreground hover:opacity-90 rounded-sm uppercase tracking-widest text-sm py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar solicitud de reserva'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
