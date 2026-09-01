import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { iranProvinces } from '@/data/iran';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Field = { key: string; label: string };

const baseFields: Field[] = [
  { key: 'first_name', label: 'نام' },
  { key: 'last_name', label: 'نام خانوادگی' },
  { key: 'phone', label: 'شماره تماس' },
  { key: 'address', label: 'نشانی' },
];

const patientFields: Field[] = [
  { key: 'national_id', label: 'کد ملی' },
  { key: 'birth_cert_no', label: 'شماره شناسنامه' },
  { key: 'birth_date', label: 'تاریخ تولد (شمسی)' },
  { key: 'father_name', label: 'نام پدر' },
  { key: 'issued_from', label: 'صادره از' },
  { key: 'insurance_name', label: 'نام بیمه' },
];

const staffFields: Field[] = [
  { key: 'specialty', label: 'تخصص' },
  { key: 'medical_code', label: 'شماره نظام پزشکی' },
  { key: 'commission_title', label: 'سمت در کمیسیون' },
];

export default function Profile() {
  const { profile, role, user, refresh } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      const f: Record<string, string> = {};
      Object.entries(profile).forEach(([k, v]) => { f[k] = (v as string) ?? ''; });
      setForm(f);
    }
  }, [profile]);

  const fields = [
    ...baseFields,
    ...(role === 'patient' ? patientFields : []),
    ...(role && role !== 'patient' ? staffFields : []),
  ];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const payload: Record<string, string | null> = {};
    [...fields, { key: 'province', label: '' }, { key: 'city', label: '' }].forEach(({ key }) => {
      payload[key] = form[key] || null;
    });
    payload.first_name = form.first_name || '';
    payload.last_name = form.last_name || '';
    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
    setBusy(false);
    if (error) return toast.error('ذخیره نشد: ' + error.message);
    await refresh();
    toast.success('پروفایل ذخیره شد');
  };

  const cities = form.province ? iranProvinces[form.province] ?? [] : [];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold mb-4">پروفایل من</h2>
      <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label>{f.label}</Label>
            <Input
              value={form[f.key] ?? ''}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <Label>استان</Label>
          <Select value={form.province || ''} onValueChange={(v) => setForm({ ...form, province: v, city: '' })}>
            <SelectTrigger><SelectValue placeholder="انتخاب استان" /></SelectTrigger>
            <SelectContent>
              {Object.keys(iranProvinces).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>شهر</Label>
          <Select value={form.city || ''} onValueChange={(v) => setForm({ ...form, city: v })} disabled={!cities.length}>
            <SelectTrigger><SelectValue placeholder="انتخاب شهر" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {role === 'patient' && (
          <>
            <div className="space-y-1.5">
              <Label>شماره کارت بانکی</Label>
              <Input value={form.card_number ?? ''} onChange={(e) => setForm({ ...form, card_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>شماره شبا</Label>
              <Input value={form.sheba ?? ''} onChange={(e) => setForm({ ...form, sheba: e.target.value })} />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button>
        </div>
      </form>
    </div>
  );
}
