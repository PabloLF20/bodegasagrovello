import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_PER_TOUR } from '@/lib/scheduleConstants';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function OccupancyCalendar() {
  const [month, setMonth] = useState(new Date());
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-calendar', format(start, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, booking_time, guests')
        .gte('booking_date', format(start, 'yyyy-MM-dd'))
        .lte('booking_date', format(end, 'yyyy-MM-dd'))
        .neq('status', 'cancelled');
      if (error) throw error;
      return data;
    },
  });

  // Map: dateStr → { timeSlot → totalGuests }
  const occupancyMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const b of bookings as any[]) {
      const key = b.booking_date;
      if (!map[key]) map[key] = {};
      map[key][b.booking_time] = (map[key][b.booking_time] ?? 0) + b.guests;
    }
    return map;
  }, [bookings]);

  const days = eachDayOfInterval({ start, end });
  const firstDayOffset = (getDay(start) + 6) % 7;

  function getDayColor(dateStr: string) {
    const slots = occupancyMap[dateStr];
    if (!slots) return 'bg-card';
    const values = Object.values(slots) as number[];
    if (values.length === 0) return 'bg-card';
    const anyFull = values.some((v) => v >= MAX_PER_TOUR);
    const allFull = values.every((v) => v >= MAX_PER_TOUR) && values.length > 1;
    if (allFull) return 'bg-destructive/20 border-destructive/40';
    if (anyFull) return 'bg-gold/20 border-gold/40';
    return 'bg-forest/10 border-forest/30';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-serif text-lg font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const slots = occupancyMap[dateStr];
          return (
            <div
              key={dateStr}
              className={cn(
                'rounded-md border p-2 min-h-[70px] text-left text-xs space-y-1',
                getDayColor(dateStr)
              )}
            >
              <div className="font-medium text-foreground">{format(day, 'd')}</div>
              {slots && Object.entries(slots).sort().map(([time, guests]) => (
                <div key={time} className="text-muted-foreground">
                  {time}: {guests}/{MAX_PER_TOUR}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-forest/10 border border-forest/30" /> Disponible
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gold/20 border border-gold/40" /> Parcial
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40" /> Completo
        </div>
      </div>
    </div>
  );
}
