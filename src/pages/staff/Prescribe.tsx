import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { medFormLabels, medFormDefaultVolume, medFormUnitLabels, MedForm, formToCalcType } from '@/lib/medical';
import {
  calculateDoseSchedule, getTodayPersianDate, formatPersianDate,
  DoseSchedule, MedicationInfo, PersianDate,
} from '@/utils/persianCalendar';
import { DoseScheduleDisplay } from '@/components/DoseScheduleDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Prescribe() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [disease, setDisease] = useState('');
  const [medName, setMedName] = useState('');
  const [form, setForm] = useState<MedForm>('syrup');
  const [unitVolume, setUnitVolume] = useState('250');
  const [dailyDose, setDailyDose] = useState('');
  const [reductionPercent, setReductionPercent] = useState('');
  const [reductionInterval, setReductionInterval] = useState('2');
  const [interval, setInterval] = useState('');
  const [busy, setBusy] = useState(false);
  const [schedule, setSchedule] = useState<DoseSchedule[] | null>(null);
  const [medInfo, setMedInfo] = useState<MedicationInfo | null>(null);
  const [startDate] = useState<PersianDate>(getTodayPersianDate());

  useEffect(() => {
    if (!caseId) return;
    (async () => {
      const { data } = await supabase.from('commission_cases').select('patient_id,disease_name').eq('id', caseId).maybeSingle();
      if (!data) return;
      setPatientId(data.patient_id);
      setDisease(data.disease_name ?? '');
      const { data: p } = await supabase.from('profiles').select('first_name,last_name').eq('id', data.patient_id).maybeSingle();
      if (p) setPatientName(`${p.first_name} ${p.last_name}`.trim());
    })();
  }, [caseId]);

  const onFormChange = (v: MedForm) => {
    setForm(v);
    setUnitVolume(String(medFormDefaultVolume[v]));
  };

  const buildSchedule = () => {
    const dose = Number(dailyDose);
    if (!dose) return toast.error('دوز روزانه را وارد کنید');
    const info: MedicationInfo = {
      type: formToCalcType(form),
      unitVolume: Number(unitVolume) || medFormDefaultVolume[form],
      dailyDose: dose,
      unitLabel: medFormUnitLabels[form],
      reductionPercent: reductionPercent ? Number(reductionPercent) : undefined,
      reductionIntervalMonths: reductionInterval ? Number(reductionInterval) : undefined,
      dispensingIntervalDays: interval ? Number(interval) : undefined,
    };
    setMedInfo(info);
    setSchedule(calculateDoseSchedule(startDate, info));
  };

  const save = async () => {
    if (!user || !patientId) return;
    if (!medName || !disease || !dailyDose) return toast.error('اطلاعات نسخه کامل نیست');
    setBusy(true);
    const { error } = await supabase.from('prescriptions').insert({
      case_id: caseId ?? null,
      patient_id: patientId,
      doctor_id: user.id,
      disease_name: disease,
      medication_name: medName,
      medication_form: form,
      daily_dose: Number(dailyDose),
      unit_volume: Number(unitVolume) || null,
      dispensing_interval_days: interval ? Number(interval) : null,
      reduction_percent: reductionPercent ? Number(reductionPercent) : null,
      reduction_interval_months: reductionInterval ? Number(reductionInterval) : null,
      issue_date_jalali: formatPersianDate(startDate),
    });
    setBusy(false);
    if (error) return toast.error('ثبت نسخه ناموفق: ' + error.message);
    toast.success('نسخه صادر شد');
    navigate('/prescriptions');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-xl font-bold">صدور نسخه {patientName && `— ${patientName}`}</h2>
        <p className="text-sm text-muted-foreground">تاریخ ثبت نسخه: {formatPersianDate(startDate)}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>نام بیماری</Label>
            <Input value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>نام دارو</Label>
            <Input value={medName} onChange={(e) => setMedName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>شکل دارو</Label>
            <Select value={form} onValueChange={(v) => onFormChange(v as MedForm)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(medFormLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>حجم/تعداد هر {medFormUnitLabels[form]}</Label>
            <Input type="number" value={unitVolume} onChange={(e) => setUnitVolume(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>دوز روزانه</Label>
            <Input type="number" value={dailyDose} onChange={(e) => setDailyDose(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>درصد کاهش دوره‌ای (اختیاری)</Label>
            <Input type="number" value={reductionPercent} onChange={(e) => setReductionPercent(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>بازه کاهش (ماه)</Label>
            <Input type="number" value={reductionInterval} onChange={(e) => setReductionInterval(e.target.value)} />
          </div>
          {form === 'ampoule' && (
            <div className="space-y-1.5">
              <Label>بازه تحویل دارو (روز)</Label>
              <Input type="number" value={interval} onChange={(e) => setInterval(e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={buildSchedule}>محاسبه نوبت‌ها</Button>
          <Button onClick={save} disabled={busy}>ثبت نهایی نسخه</Button>
        </div>
      </div>

      {schedule && medInfo && (
        <DoseScheduleDisplay schedule={schedule} medication={medInfo} startDate={startDate} />
      )}
    </div>
  );
}
