import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Availability {
  booking_time: string;
  total_guests: number;
}

const MAX_PER_TOUR = 15;

export function useAvailability(date: Date | undefined) {
  const dateStr = date ? date.toISOString().split('T')[0] : null;

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
  const spotsLeft = (time: string) => MAX_PER_TOUR - getOccupancy(time);

  return { ...query, getOccupancy, isFull, spotsLeft };
}
