import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { medFormLabels, MedForm } from '@/lib/medical';

interface Rx {
  id: string;
  disease_name: string;
  medication_name: string;
  medication_form: MedForm;
  daily_dose: number;
  issue_date_jalali: string | null;
  created_at: string;
}

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Rx[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('prescriptions').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as Rx[]) ?? []));
  }, [user]);

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold mb-4">نسخه‌های من</h2>
      {!rows.length && <p className="text-sm text-muted-foreground">نسخه‌ای برای شما صادر نشده است.</p>}
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="border border-border rounded-xl p-4 text-sm">
            <div className="flex justify-between flex-wrap gap-2">
              <p className="font-bold">{r.medication_name} ({medFormLabels[r.medication_form]})</p>
              <p className="text-muted-foreground">{r.issue_date_jalali ?? ''}</p>
            </div>
            <p className="text-muted-foreground mt-1">بیماری: {r.disease_name}</p>
            <p className="text-muted-foreground">دوز روزانه: {r.daily_dose.toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
