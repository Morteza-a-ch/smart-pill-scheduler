import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { medFormLabels, MedForm } from '@/lib/medical';

interface Rx {
  id: string; patient_id: string; disease_name: string; medication_name: string;
  medication_form: MedForm; daily_dose: number; issue_date_jalali: string | null;
}

export default function Prescriptions() {
  const [rows, setRows] = useState<Rx[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
      const list = (data as Rx[]) ?? [];
      setRows(list);
      const ids = [...new Set(list.map((r) => r.patient_id))];
      if (ids.length) {
        const { data: p } = await supabase.from('profiles').select('id,first_name,last_name').in('id', ids);
        const m: Record<string, string> = {};
        (p ?? []).forEach((x) => { m[x.id] = `${x.first_name} ${x.last_name}`.trim(); });
        setNames(m);
      }
    })();
  }, []);

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
      <h2 className="text-xl font-bold">نسخه‌های صادرشده</h2>
      {!rows.length && <p className="text-sm text-muted-foreground">نسخه‌ای ثبت نشده است.</p>}
      {rows.map((r) => (
        <div key={r.id} className="border border-border rounded-xl p-4 text-sm">
          <div className="flex justify-between flex-wrap gap-2">
            <p className="font-bold">{names[r.patient_id] ?? 'بیمار'} — {r.medication_name} ({medFormLabels[r.medication_form]})</p>
            <p className="text-muted-foreground">{r.issue_date_jalali ?? ''}</p>
          </div>
          <p className="text-muted-foreground mt-1">بیماری: {r.disease_name} · دوز روزانه: {r.daily_dose.toLocaleString('fa-IR')}</p>
        </div>
      ))}
    </div>
  );
}
