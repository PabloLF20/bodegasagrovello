import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ScheduleRule } from '@/hooks/useScheduleConfig';
import { AVAILABLE_TIMES } from '@/lib/scheduleConstants';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

interface RuleForm {
  name: string;
  days_of_week: number[];
  all_days: boolean;
  times: string[];
  start_date: string;
  end_date: string;
  active: boolean;
}

const emptyForm: RuleForm = {
  name: '',
  days_of_week: [0, 6],
  all_days: false,
  times: ['12:15', '13:15'],
  start_date: '',
  end_date: '',
  active: true,
};

export default function ScheduleManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['schedule-config-admin'],
    queryFn: async (): Promise<ScheduleRule[]> => {
      const { data, error } = await (supabase as any)
        .from('schedule_config')
        .select('*')
        .order('start_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveRule = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        days_of_week: form.all_days ? null : form.days_of_week,
        times: form.times,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        active: form.active,
      };
      if (editingId) {
        const { error } = await (supabase as any).from('schedule_config').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('schedule_config').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-config-admin'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
      toast.success(editingId ? 'Regla actualizada' : 'Regla creada');
      setDialogOpen(false);
    },
    onError: () => toast.error('Error al guardar'),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('schedule_config').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-config-admin'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
      toast.success('Regla eliminada');
      setDeleteId(null);
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase as any).from('schedule_config').update({ active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-config-admin'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(rule: ScheduleRule) {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      days_of_week: rule.days_of_week ?? [],
      all_days: !rule.days_of_week || rule.days_of_week.length === 0,
      times: rule.times,
      start_date: rule.start_date ?? '',
      end_date: rule.end_date ?? '',
      active: rule.active,
    });
    setDialogOpen(true);
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter((d) => d !== day)
        : [...f.days_of_week, day].sort(),
    }));
  }

  function toggleTime(time: string) {
    setForm((f) => ({
      ...f,
      times: f.times.includes(time)
        ? f.times.filter((t) => t !== time)
        : [...f.times, time].sort(),
    }));
  }

  function formatDate(d: string | null) {
    if (!d) return '—';
    return format(new Date(d + 'T00:00'), 'dd MMM yyyy', { locale: es });
  }

  function formatDays(rule: ScheduleRule) {
    if (!rule.days_of_week || rule.days_of_week.length === 0) return 'Todos los días';
    return rule.days_of_week.map((d) => DAY_NAMES[d]).join(', ');
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Define qué días y horarios están disponibles para las visitas.
        </p>
        <Button size="sm" onClick={openCreate} className="bg-wine text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Nueva regla
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Cargando...</p>
      ) : rules.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No hay reglas de horario</p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`border rounded-md p-4 flex items-start gap-4 ${!rule.active ? 'opacity-50' : ''}`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{rule.name}</span>
                  {!rule.active && <Badge variant="outline" className="text-xs">Inactiva</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Días:</span> {formatDays(rule)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Horarios:</span> {rule.times.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Desde:</span> {formatDate(rule.start_date)}
                  {' · '}
                  <span className="font-medium">Hasta:</span> {formatDate(rule.end_date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.active}
                  onCheckedChange={(v) => toggleActive.mutate({ id: rule.id, active: v })}
                />
                <Button size="sm" variant="ghost" onClick={() => openEdit(rule)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(rule.id)} className="text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar regla' : 'Nueva regla de horario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Horario regular, Semana Santa..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Días de la semana</Label>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="all-days"
                  checked={form.all_days}
                  onCheckedChange={(v) => setForm({ ...form, all_days: !!v })}
                />
                <label htmlFor="all-days" className="text-sm cursor-pointer">Todos los días</label>
              </div>
              {!form.all_days && (
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={form.days_of_week.includes(d)}
                        onCheckedChange={() => toggleDay(d)}
                      />
                      <span className="text-sm">{DAY_NAMES[d]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Horarios disponibles</Label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_TIMES.map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={form.times.includes(t)}
                      onCheckedChange={() => toggleTime(t)}
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fecha inicio (opcional)</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Fecha fin (opcional)</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>Regla activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveRule.mutate()}
              disabled={saveRule.isPending || !form.name || form.times.length === 0 || (!form.all_days && form.days_of_week.length === 0)}
              className="bg-wine text-white hover:opacity-90"
            >
              {saveRule.isPending ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear regla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteRule.mutate(deleteId)}
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
