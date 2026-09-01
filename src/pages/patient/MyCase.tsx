import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { caseStatusClasses, caseStatusLabels, CaseStatus, COMMISSION_FEE, formatToman } from '@/lib/medical';
import { uploadPrivateFile, getSignedUrl } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, FileText, Lock } from 'lucide-react';

interface CaseRow {
  id: string;
  case_number: number;
  disease_name: string | null;
  insurance_name: string | null;
  status: CaseStatus;
  documents_finalized: boolean;
  paid: boolean;
  fee_amount: number;
}
interface Doc { id: string; title: string; file_path: string }

export default function MyCase() {
  const { user } = useAuth();
  const [row, setRow] = useState<CaseRow | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [disease, setDisease] = useState('');
  const [insurance, setInsurance] = useState('');
  const [appeal, setAppeal] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('commission_cases').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    setRow((data as CaseRow) ?? null);
    if (data) {
      const { data: d } = await supabase.from('case_documents').select('id,title,file_path').eq('case_id', data.id);
      setDocs((d as Doc[]) ?? []);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createCase = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from('commission_cases').insert({
      patient_id: user.id,
      disease_name: disease || null,
      insurance_name: insurance || null,
      fee_amount: COMMISSION_FEE,
    });
    setBusy(false);
    if (error) return toast.error('خطا: ' + error.message);
    toast.success('پرونده تشکیل شد');
    load();
  };

  const upload = async (file: File) => {
    if (!user || !row) return;
    setBusy(true);
    try {
      const path = await uploadPrivateFile('medical-docs', user.id, file);
      await supabase.from('case_documents').insert({
        case_id: row.id, patient_id: user.id, title: file.name, file_path: path,
      });
      toast.success('مدرک بارگذاری شد');
      load();
    } catch (e) {
      toast.error('بارگذاری ناموفق بود');
    }
    setBusy(false);
  };

  const openDoc = async (path: string) => {
    const url = await getSignedUrl('medical-docs', path);
    if (url) window.open(url, '_blank');
    else toast.error('دسترسی به فایل ممکن نشد');
  };

  const finalize = async () => {
    if (!row) return;
    if (!docs.length) return toast.error('حداقل یک مدرک بارگذاری کنید');
    await supabase.from('commission_cases').update({ documents_finalized: true }).eq('id', row.id);
    toast.success('مدارک نهایی شد و دیگر قابل تغییر نیست');
    load();
  };

  const pay = async () => {
    if (!row || !user) return;
    setBusy(true);
    await supabase.from('wallet_transactions').insert({
      user_id: user.id, type: 'withdraw', amount: row.fee_amount, status: 'done',
      description: `هزینه تشکیل پرونده کمیسیون شماره ${row.case_number}`,
    });
    await supabase.from('commission_cases').update({ paid: true }).eq('id', row.id);
    setBusy(false);
    toast.success('پرداخت با موفقیت ثبت شد');
    load();
  };

  const sendAppeal = async () => {
    if (!row || !user || !appeal.trim()) return;
    await supabase.from('case_appeals').insert({ case_id: row.id, patient_id: user.id, message: appeal });
    await supabase.from('commission_cases').update({ status: 'reappeal' }).eq('id', row.id);
    setAppeal('');
    toast.success('اعتراض ثبت شد');
    load();
  };

  if (!row) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-xl font-bold">تشکیل پرونده کمیسیون</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>نام بیماری</Label>
            <Input value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>نام بیمه</Label>
            <Input value={insurance} onChange={(e) => setInsurance(e.target.value)} />
          </div>
        </div>
        <Button onClick={createCase} disabled={busy}>تشکیل پرونده</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold">پرونده شماره {row.case_number.toLocaleString('fa-IR')}</h2>
          <span className={`px-3 py-1 rounded-lg border text-sm ${caseStatusClasses[row.status]}`}>
            {caseStatusLabels[row.status]}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
          <p><span className="text-muted-foreground">بیماری: </span>{row.disease_name || '—'}</p>
          <p><span className="text-muted-foreground">بیمه: </span>{row.insurance_name || '—'}</p>
          <p><span className="text-muted-foreground">هزینه پرونده: </span>{formatToman(row.fee_amount)} ریال</p>
          <p><span className="text-muted-foreground">وضعیت پرداخت: </span>{row.paid ? 'پرداخت شده' : 'پرداخت نشده'}</p>
        </div>
        {!row.paid && <Button className="mt-4" onClick={pay} disabled={busy}>پرداخت هزینه پرونده</Button>}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">مدارک پرونده</h3>
          {row.documents_finalized && (
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> نهایی شده</span>
          )}
        </div>
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id}>
              <button onClick={() => openDoc(d.file_path)} className="flex items-center gap-2 text-sm text-primary">
                <FileText className="w-4 h-4" /> {d.title}
              </button>
            </li>
          ))}
          {!docs.length && <li className="text-sm text-muted-foreground">مدرکی بارگذاری نشده است.</li>}
        </ul>
        {!row.documents_finalized && (
          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted cursor-pointer text-sm">
              <Upload className="w-4 h-4" /> بارگذاری مدرک
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            <Button variant="outline" onClick={finalize}>نهایی‌سازی مدارک</Button>
          </div>
        )}
      </div>

      {(row.status === 'rejected' || row.status === 'reappeal') && (
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
          <h3 className="font-bold">ثبت اعتراض / درخواست بررسی مجدد</h3>
          <Textarea value={appeal} onChange={(e) => setAppeal(e.target.value)} rows={4} placeholder="توضیحات اعتراض..." />
          <Button onClick={sendAppeal}>ارسال اعتراض</Button>
        </div>
      )}
    </div>
  );
}
