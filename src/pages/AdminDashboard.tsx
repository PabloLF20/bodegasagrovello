import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import BookingTable from '@/components/admin/BookingTable';
import OccupancyCalendar from '@/components/admin/OccupancyCalendar';
import type { Session } from '@supabase/supabase-js';

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/admin', { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/admin', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin', { replace: true });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Cargando...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-foreground">AgroVello — Reservas</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
        </Button>
      </header>
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <BookingTable />
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <OccupancyCalendar />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
