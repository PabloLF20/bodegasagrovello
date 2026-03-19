import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_PER_TOUR = 15;
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

  const occupancyMap = useMemo(() => {
    const map: Record<string, { '10:00': number; '17:00': number }> = {};
    for (const b of bookings as any[]) {
      const key = b.booking_date;
      if (!map[key]) map[key] = { '10:00': 0, '17:00': 0 };
      if (b.booking_time === '10:00' || b.booking_time === '17:00') {
        map[key][b.booking_time as '10:00' | '17:00'] += b.guests;
      }
    }
    return map;
  }, [bookings]);

  const days = eachDayOfInterval({ start, end });
  // Monday-based offset
  const firstDayOffset = (getDay(start) + 6) % 7;

  function getDayColor(dateStr: string) {
    const occ = occupancyMap[dateStr];
    if (!occ) return 'bg-card';
    const total = occ['10:00'] + occ['17:00'];
    if (total === 0) return 'bg-card';
    const bothFull = occ['10:00'] >= MAX_PER_TOUR && occ['17:00'] >= MAX_PER_TOUR;
    if (bothFull) return 'bg-destructive/20 border-destructive/40';
    const oneFull = occ['10:00'] >= MAX_PER_TOUR || occ['17:00'] >= MAX_PER_TOUR;
    if (oneFull || total >= MAX_PER_TOUR) return 'bg-gold/20 border-gold/40';
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
          const occ = occupancyMap[dateStr];
          return (
            <div
              key={dateStr}
              className={cn(
                'rounded-md border p-2 min-h-[70px] text-left text-xs space-y-1',
                getDayColor(dateStr)
              )}
            >
              <div className="font-medium text-foreground">{format(day, 'd')}</div>
              {occ && (
                <>
                  <div className="text-muted-foreground">10h: {occ['10:00']}/{MAX_PER_TOUR}</div>
                  <div className="text-muted-foreground">17h: {occ['17:00']}/{MAX_PER_TOUR}</div>
                </>
              )}
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
