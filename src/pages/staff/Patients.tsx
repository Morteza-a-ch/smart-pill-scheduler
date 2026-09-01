import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { caseStatusClasses, caseStatusLabels, CaseStatus } from '@/lib/medical';
import { Input } from '@/components/ui/input';

interface Row { id: string; case_number: number; patient_id: string; status: CaseStatus; disease_name: string | null }

export default function Patients() {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('commission_cases').select('*').eq('status', 'approved');
      const list = (data as Row[]) ?? [];
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

  const shown = rows.filter((r) => (names[r.patient_id] ?? '').includes(q.trim()));

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
      <h2 className="text-xl font-bold">بیماران تاییدشده کمیسیون</h2>
      <Input placeholder="جستجوی نام بیمار" value={q} onChange={(e) => setQ(e.target.value)} />
      {!shown.length && <p className="text-sm text-muted-foreground">بیماری یافت نشد.</p>}
      <div className="space-y-3">
        {shown.map((r) => (
          <div key={r.id} className="border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 text-sm">
            <div>
              <p className="font-bold">{names[r.patient_id] ?? 'بیمار'}</p>
              <p className="text-muted-foreground">پرونده {r.case_number.toLocaleString('fa-IR')} · {r.disease_name || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg border text-xs ${caseStatusClasses[r.status]}`}>{caseStatusLabels[r.status]}</span>
              <Link to={`/prescribe/${r.id}`} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs">صدور نسخه</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
