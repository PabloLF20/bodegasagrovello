import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface ScheduleRule {
  id: string;
  name: string;
  days_of_week: number[] | null;
  times: string[];
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export function useScheduleConfig() {
  const query = useQuery({
    queryKey: ['schedule-config'],
    queryFn: async (): Promise<ScheduleRule[]> => {
      const { data, error } = await (supabase as any)
        .from('schedule_config')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const rules = query.data ?? [];

  function getTimesForDate(date: Date | undefined): string[] {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    const matching = rules.find((rule) => {
      if (rule.start_date && dateStr < rule.start_date) return false;
      if (rule.end_date && dateStr > rule.end_date) return false;
      if (rule.days_of_week && rule.days_of_week.length > 0) {
        if (!rule.days_of_week.includes(dayOfWeek)) return false;
      }
      return true;
    });

    return matching ? matching.times : [];
  }

  function isDayOpen(date: Date): boolean {
    return getTimesForDate(date).length > 0;
  }

  return { ...query, rules, getTimesForDate, isDayOpen };
}
