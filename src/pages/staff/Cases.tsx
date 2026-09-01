import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { caseStatusClasses, caseStatusLabels, CaseStatus } from '@/lib/medical';

interface Row {
  id: string;
  case_number: number;
  disease_name: string | null;
  status: CaseStatus;
  paid: boolean;
  patient_id: string;
}

export default function Cases() {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('commission_cases').select('*').order('created_at', { ascending: false });
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

  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl shadow-card p-4 flex gap-2 flex-wrap">
        {(['all', ...Object.keys(caseStatusLabels)] as (CaseStatus | 'all')[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
          >
            {s === 'all' ? 'همه' : caseStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="text-xl font-bold">پرونده‌های کمیسیون</h2>
        {!shown.length && <p className="text-sm text-muted-foreground">پرونده‌ای یافت نشد.</p>}
        {shown.map((r) => (
          <Link
            key={r.id}
            to={`/cases/${r.id}`}
            className={`block border rounded-xl p-4 text-sm hover:shadow-md transition-shadow ${caseStatusClasses[r.status]}`}
          >
            <div className="flex justify-between flex-wrap gap-2">
              <p className="font-bold">پرونده {r.case_number.toLocaleString('fa-IR')} — {names[r.patient_id] ?? 'بیمار'}</p>
              <span>{caseStatusLabels[r.status]}</span>
            </div>
            <p className="opacity-80 mt-1">بیماری: {r.disease_name || '—'} · {r.paid ? 'پرداخت شده' : 'پرداخت نشده'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
