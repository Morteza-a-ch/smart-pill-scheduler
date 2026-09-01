import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { caseStatusClasses, caseStatusLabels, CaseStatus, medFormLabels, MedForm } from '@/lib/medical';
import { getSignedUrl } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

interface CaseRow {
  id: string; case_number: number; disease_name: string | null; insurance_name: string | null;
  status: CaseStatus; paid: boolean; patient_id: string;
}
interface Doc { id: string; title: string; file_path: string }
interface Vote {
  id: string; member_id: string; approved: boolean; medication_name: string | null;
  medication_form: MedForm | null; daily_dose: number | null; notes: string | null;
}
interface Appeal { id: string; message: string; created_at: string }

export default function CaseDetail() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [row, setRow] = useState<CaseRow | null>(null);
  const [patient, setPatient] = useState<Record<string, string | null> | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [approved, setApproved] = useState('yes');
  const [medName, setMedName] = useState('');
  const [medForm, setMedForm] = useState<MedForm>('syrup');
  const [dailyDose, setDailyDose] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('commission_cases').select('*').eq('id', id).maybeSingle();
    setRow((data as CaseRow) ?? null);
    if (!data) return;
    const [d, v, a, p] = await Promise.all([
      supabase.from('case_documents').select('id,title,file_path').eq('case_id', id),
      supabase.from('commission_votes').select('*').eq('case_id', id),
      supabase.from('case_appeals').select('id,message,created_at').eq('case_id', id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', data.patient_id).maybeSingle(),
    ]);
    setDocs((d.data as Doc[]) ?? []);
    setVotes((v.data as Vote[]) ?? []);
    setAppeals((a.data as Appeal[]) ?? []);
    setPatient((p.data as Record<string, string | null>) ?? null);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (status: CaseStatus) => {
    if (!id) return;
    await supabase.from('commission_cases').update({ status }).eq('id', id);
    toast.success('وضعیت پرونده به‌روزرسانی شد');
    load();
  };

  const submitVote = async () => {
    if (!id || !user) return;
    setBusy(true);
    const { error } = await supabase.from('commission_votes').insert({
      case_id: id,
      member_id: user.id,
      approved: approved === 'yes',
      medication_name: medName || null,
      medication_form: medName ? medForm : null,
      daily_dose: dailyDose ? Number(dailyDose) : null,
      notes: notes || null,
    });
    setBusy(false);
    if (error) return toast.error('ثبت رای ناموفق: ' + error.message);
    toast.success('رای شما ثبت شد');
    setMedName(''); setDailyDose(''); setNotes('');
    load();
  };

  const openDoc = async (path: string) => {
    const url = await getSignedUrl('medical-docs', path);
    if (url) window.open(url, '_blank'); else toast.error('دسترسی به فایل ممکن نشد');
  };

  if (!row) return <div className="bg-card rounded-2xl shadow-card p-6 text-sm text-muted-foreground">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold">پرونده {row.case_number.toLocaleString('fa-IR')}</h2>
          <span className={`px-3 py-1 rounded-lg border text-sm ${caseStatusClasses[row.status]}`}>{caseStatusLabels[row.status]}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mt-4 text-sm">
          <p><span className="text-muted-foreground">بیمار: </span>{patient ? `${patient.first_name} ${patient.last_name}` : '—'}</p>
          <p><span className="text-muted-foreground">کد ملی: </span>{patient?.national_id || '—'}</p>
          <p><span className="text-muted-foreground">بیماری: </span>{row.disease_name || '—'}</p>
          <p><span className="text-muted-foreground">بیمه: </span>{row.insurance_name || '—'}</p>
          <p><span className="text-muted-foreground">تماس: </span>{patient?.phone || '—'}</p>
          <p><span className="text-muted-foreground">پرداخت: </span>{row.paid ? 'انجام شده' : 'انجام نشده'}</p>
        </div>
        <div className="flex gap-2 flex-wrap mt-4">
          {(['reviewing', 'approved', 'rejected'] as CaseStatus[]).map((s) => (
            <Button key={s} size="sm" variant="outline" onClick={() => setStatus(s)}>{caseStatusLabels[s]}</Button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-bold mb-3">مدارک بیمار</h3>
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id}>
              <button onClick={() => openDoc(d.file_path)} className="flex items-center gap-2 text-sm text-primary">
                <FileText className="w-4 h-4" /> {d.title}
              </button>
            </li>
          ))}
          {!docs.length && <li className="text-sm text-muted-foreground">مدرکی ثبت نشده است.</li>}
        </ul>
      </div>

      {appeals.length > 0 && (
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h3 className="font-bold mb-3">اعتراض‌های بیمار</h3>
          <ul className="space-y-2 text-sm">
            {appeals.map((a) => <li key={a.id} className="border border-border rounded-lg p-3">{a.message}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-bold mb-3">آرای اعضای کمیسیون</h3>
        <ul className="space-y-2 text-sm">
          {votes.map((v) => (
            <li key={v.id} className="border border-border rounded-lg p-3">
              <p className={v.approved ? 'text-emerald-600' : 'text-rose-600'}>{v.approved ? 'موافق' : 'مخالف'}</p>
              {v.medication_name && (
                <p className="text-muted-foreground">
                  دارو: {v.medication_name} ({v.medication_form ? medFormLabels[v.medication_form] : ''}) — دوز روزانه: {v.daily_dose ?? '—'}
                </p>
              )}
              {v.notes && <p className="text-muted-foreground">{v.notes}</p>}
            </li>
          ))}
          {!votes.length && <li className="text-muted-foreground">هنوز رایی ثبت نشده است.</li>}
        </ul>
      </div>

      {role === 'commission' && (
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
          <h3 className="font-bold">ثبت رای من</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>نظر</Label>
              <Select value={approved} onValueChange={setApproved}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">موافق</SelectItem>
                  <SelectItem value="no">مخالف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>نام دارو (اختیاری)</Label>
              <Input value={medName} onChange={(e) => setMedName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>شکل دارو</Label>
              <Select value={medForm} onValueChange={(v) => setMedForm(v as MedForm)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(medFormLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>دوز روزانه</Label>
              <Input type="number" value={dailyDose} onChange={(e) => setDailyDose(e.target.value)} />
            </div>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="توضیحات" rows={3} />
          <Button onClick={submitVote} disabled={busy}>ثبت رای</Button>
        </div>
      )}
    </div>
  );
}
