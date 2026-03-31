import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { MAX_PER_TOUR } from '@/lib/scheduleConstants';

export { MAX_PER_TOUR };

export interface Availability {
  booking_time: string;
  total_guests: number;
}

export function useAvailability(date: Date | undefined) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : null;

  const query = useQuery({
    queryKey: ['availability', dateStr],
    queryFn: async (): Promise<Availability[]> => {
      if (!dateStr) return [];
      const { data, error } = await supabase.rpc('get_availability', {
        target_date: dateStr,
      });
      if (error) throw error;
      return (data as Availability[]) ?? [];
    },
    enabled: !!dateStr,
  });

  const getOccupancy = (time: string) => {
    const slot = query.data?.find((s) => s.booking_time === time);
    return slot?.total_guests ?? 0;
  };

  const isFull = (time: string) => getOccupancy(time) >= MAX_PER_TOUR;
  const spotsLeft = (time: string) => Math.max(0, MAX_PER_TOUR - getOccupancy(time));

  return { ...query, isFull, spotsLeft };
}
