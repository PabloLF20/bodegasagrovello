import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useScheduleConfig } from '@/hooks/useScheduleConfig';
import { AVAILABLE_TIMES } from '@/lib/scheduleConstants';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const VISIT_TYPE_LABELS: Record<string, string> = {
  bodega_1_vino: '1 vino (8€)',
  bodega_2_vinos: '2 vinos (11€)',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold/20 text-gold-foreground border-gold/40',
  confirmed: 'bg-forest/10 text-forest border-forest/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
};


interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  guests: string;
  booking_date: string;
  booking_time: string;
  visit_type: string;
  message: string;
  status: string;
}

const emptyForm: BookingFormData = {
  name: '',
  email: '',
  phone: '',
  guests: '1',
  booking_date: '',
  booking_time: '',
  visit_type: 'bodega_1_vino',
  message: '',
  status: 'pending',
};

export default function BookingTable() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookingFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { getTimesForDate } = useScheduleConfig();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (dateFilter) query = query.eq('booking_date', dateFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, booking }: { id: string; status: string; booking?: any }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      if (status === 'confirmed' && booking) {
        supabase.functions.invoke('send-booking-confirmation', {
          body: {
            name: booking.name,
            email: booking.email,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            visit_type: booking.visit_type,
            guests: booking.guests,
          },
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }).catch((err) => console.error('Confirmation email error:', err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const saveBooking = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        guests: parseInt(form.guests),
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        visit_type: form.visit_type,
        message: form.message || null,
        status: form.status,
      };
      if (editingId) {
        const { error } = await supabase.from('bookings').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(editingId ? 'Reserva actualizada' : 'Reserva creada');
      setDialogOpen(false);
    },
    onError: () => toast.error('Error al guardar la reserva'),
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Reserva eliminada');
      setDeleteId(null);
    },
    onError: () => toast.error('Error al eliminar la reserva'),
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(b: any) {
    setEditingId(b.id);
    setForm({
      name: b.name,
      email: b.email,
      phone: b.phone,
      guests: String(b.guests),
      booking_date: b.booking_date,
      booking_time: b.booking_time,
      visit_type: b.visit_type,
      message: b.message || '',
      status: b.status,
    });
    setDialogOpen(true);
  }

  const tourTimes = form.booking_date
    ? getTimesForDate(new Date(form.booking_date + 'T00:00'))
    : [...AVAILABLE_TIMES];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>
              Limpiar fecha
            </Button>
          )}
        </div>
        <Button size="sm" onClick={openCreate} className="bg-wine text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Nueva reserva
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Cargando reservas...</p>
      ) : bookings.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No hay reservas</p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recibida</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Pers.</TableHead>
                <TableHead>Visita</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {b.created_at ? format(new Date(b.created_at), 'dd MMM yyyy HH:mm', { locale: es }) : '—'}
                  </TableCell>
                  <TableCell>{format(new Date(b.booking_date + 'T00:00'), 'dd MMM yyyy', { locale: es })}</TableCell>
                  <TableCell>{b.booking_time}</TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell>{b.guests}</TableCell>
                  <TableCell className="text-xs">{VISIT_TYPE_LABELS[b.visit_type] || b.visit_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[b.status]}>
                      {STATUS_LABELS[b.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {b.status !== 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'confirmed', booking: b })}
                          className="text-xs"
                        >
                          Confirmar
                        </Button>
                      )}
                      {b.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: b.id, status: 'cancelled' })}
                          className="text-xs text-destructive"
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(b)}
                        className="text-xs"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(b.id)}
                        className="text-xs text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Personas</Label>
                <Select value={form.guests} onValueChange={(v) => setForm({ ...form, guests: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value, booking_time: '' })}
                />
              </div>
              <div className="space-y-1">
                <Label>Hora</Label>
                <Select
                  value={form.booking_time}
                  onValueChange={(v) => setForm({ ...form, booking_time: v })}
                  disabled={!form.booking_date}
                >
                  <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                  <SelectContent>
                    {tourTimes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tipo de visita</Label>
              <Select value={form.visit_type} onValueChange={(v) => setForm({ ...form, visit_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bodega_1_vino">Visita + 1 vino (8€/pers)</SelectItem>
                  <SelectItem value="bodega_2_vinos">Visita + 2 vinos (11€/pers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mensaje (opcional)</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveBooking.mutate()}
              disabled={saveBooking.isPending || !form.name || !form.booking_date || !form.booking_time}
              className="bg-wine text-white hover:opacity-90"
            >
              {saveBooking.isPending ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBooking.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
