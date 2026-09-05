import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, roleLabels } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface P { id: string; first_name: string; last_name: string; phone: string | null; specialty: string | null }

export default function Users() {
  const [rows, setRows] = useState<P[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole[]>>({});
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Record<string, AppRole>>({});

  const load = useCallback(async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('id,first_name,last_name,phone,specialty'),
      supabase.from('user_roles').select('user_id,role'),
    ]);
    setRows((p as P[]) ?? []);
    const m: Record<string, AppRole[]> = {};
    ((r ?? []) as { user_id: string; role: AppRole }[]).forEach((x) => {
      m[x.user_id] = [...(m[x.user_id] ?? []), x.role];
    });
    setRoles(m);
  }, []);

  useEffect(() => { load(); }, [load]);

  const assign = async (userId: string) => {
    const role = pick[userId];
    if (!role) return toast.error('نقش را انتخاب کنید');
    await supabase.from('user_roles').delete().eq('user_id', userId);
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) return toast.error('خطا: ' + error.message);
    toast.success('نقش کاربر به‌روزرسانی شد');
    load();
  };

  const [filter, setFilter] = useState<AppRole | 'all'>('all');

  const shown = rows.filter((r) => {
    const nameOk = `${r.first_name} ${r.last_name}`.includes(q.trim());
    const roleOk = filter === 'all' ? true : (roles[r.id] ?? []).includes(filter);
    return nameOk && roleOk;
  });

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
      <h2 className="text-xl font-bold">مدیریت کاربران و نقش‌ها</h2>
      <Input placeholder="جستجوی نام" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {(['all', ...(Object.keys(roleLabels) as AppRole[])] as (AppRole | 'all')[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg border text-xs ${filter === k ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
          >
            {k === 'all' ? `همه (${rows.length})` : `${roleLabels[k]} (${rows.filter((r) => (roles[r.id] ?? []).includes(k)).length})`}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {shown.map((r) => (
          <div key={r.id} className="border border-border rounded-xl p-4 grid sm:grid-cols-[1fr_auto_auto] gap-3 items-center text-sm">
            <div className="space-y-1">
              <p className="font-bold">{`${r.first_name} ${r.last_name}`.trim() || 'بدون نام'}</p>
              <p className="text-muted-foreground">{r.phone || '—'}{r.specialty ? ` · ${r.specialty}` : ''}</p>
              <div className="flex flex-wrap gap-1">
                {(roles[r.id] ?? []).length
                  ? (roles[r.id] ?? []).map((x) => (
                      <span key={x} className="px-2 py-0.5 rounded-md bg-muted text-xs">{roleLabels[x]}</span>
                    ))
                  : <span className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">بدون نقش</span>}
              </div>
            </div>
            <Select value={pick[r.id] ?? ''} onValueChange={(v) => setPick((s) => ({ ...s, [r.id]: v as AppRole }))}>
              <SelectTrigger className="w-40"><SelectValue placeholder="انتخاب نقش" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as AppRole[]).map((k) => (
                  <SelectItem key={k} value={k}>{roleLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => assign(r.id)}>ثبت نقش</Button>
          </div>
        ))}
        {!shown.length && <p className="text-sm text-muted-foreground">کاربری یافت نشد.</p>}
      </div>
    </div>
  );
}

