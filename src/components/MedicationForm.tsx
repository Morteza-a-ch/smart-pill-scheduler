import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  PersianDate, 
  MedicationInfo, 
  MedicationType,
  medicationTypes,
  generateYears,
  generateDays,
  persianMonths,
  toPersianDigits,
  isValidPersianDate,
  getTodayPersianDate
} from '@/utils/persianCalendar';
import { Calendar, Pill, Calculator } from 'lucide-react';

interface MedicationFormProps {
  onSubmit: (date: PersianDate, medication: MedicationInfo, maxMedicationPerDose?: number) => void;
}

export function MedicationForm({ onSubmit }: MedicationFormProps) {
  const today = getTodayPersianDate();
  const [year, setYear] = useState<number>(today.year);
  const [month, setMonth] = useState<number>(today.month);
  const [day, setDay] = useState<number>(today.day);
  const [medicationType, setMedicationType] = useState<MedicationType>('syrup');
  const [unitVolume, setUnitVolume] = useState<string>('250');
  const [dailyDose, setDailyDose] = useState<string>('12');
  const [maxMedication, setMaxMedication] = useState<string>('');
  const [error, setError] = useState<string>('');

  const years = generateYears(1400, 1410);
  const days = generateDays(month);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const date: PersianDate = { year, month, day };
    
    if (!isValidPersianDate(date)) {
      setError('تاریخ وارد شده معتبر نیست');
      return;
    }

    const volume = parseFloat(unitVolume);
    const dose = parseFloat(dailyDose);

    if (isNaN(volume) || volume <= 0) {
      setError('حجم واحد دارو باید عدد مثبت باشد');
      return;
    }

    if (isNaN(dose) || dose <= 0) {
      setError('مصرف روزانه باید عدد مثبت باشد');
      return;
    }

    const medication: MedicationInfo = {
      type: medicationType,
      unitVolume: volume,
      dailyDose: dose,
      unitLabel: medicationTypes[medicationType].unitLabel,
    };

    const maxMed = maxMedication ? parseInt(maxMedication) : undefined;
    if (maxMedication && (isNaN(maxMed!) || maxMed! <= 0)) {
      setError('محدودیت تعداد دارو باید عدد مثبت باشد');
      return;
    }

    onSubmit(date, medication, maxMed);
  };

  const typeInfo = medicationTypes[medicationType];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* بخش تاریخ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-medium">تاریخ ثبت نسخه</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">سال</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="input-medical">
                <SelectValue placeholder="سال" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {toPersianDigits(y)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">ماه</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="input-medical">
                <SelectValue placeholder="ماه" />
              </SelectTrigger>
              <SelectContent>
                {persianMonths.map((name, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">روز</Label>
            <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
              <SelectTrigger className="input-medical">
                <SelectValue placeholder="روز" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {toPersianDigits(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* بخش دارو */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-secondary">
          <Pill className="w-5 h-5" />
          <h3 className="text-lg font-medium">مشخصات دارو</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">نوع دارو</Label>
            <Select 
              value={medicationType} 
              onValueChange={(v: MedicationType) => {
                setMedicationType(v);
                setUnitVolume(String(medicationTypes[v].defaultVolume));
              }}
            >
              <SelectTrigger className="input-medical">
                <SelectValue placeholder="انتخاب نوع دارو" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(medicationTypes).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label} ({info.unitLabel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitVolume">
                حجم هر {typeInfo.unitLabel}
                {medicationType === 'syrup' && ' (سی‌سی)'}
                {medicationType === 'tablet' && ' (تعداد در بسته)'}
              </Label>
              <Input
                id="unitVolume"
                type="number"
                value={unitVolume}
                onChange={(e) => setUnitVolume(e.target.value)}
                className="input-medical"
                min="1"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyDose">
                مصرف روزانه
                {medicationType === 'syrup' && ' (سی‌سی)'}
                {medicationType === 'tablet' && ' (تعداد)'}
                {medicationType === 'ampoule' && ' (تعداد)'}
              </Label>
              <Input
                id="dailyDose"
                type="number"
                value={dailyDose}
                onChange={(e) => setDailyDose(e.target.value)}
                className="input-medical"
                min="0.1"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMedication">
              حداکثر تعداد {typeInfo.unitLabel} در هر نوبت (اختیاری)
            </Label>
            <Input
              id="maxMedication"
              type="number"
              value={maxMedication}
              onChange={(e) => setMaxMedication(e.target.value)}
              className="input-medical"
              min="1"
              step="1"
              placeholder="بدون محدودیت"
            />
            <p className="text-xs text-muted-foreground">
              اگر خالی باشد، محدودیتی اعمال نمی‌شود
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full btn-medical bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        <Calculator className="w-5 h-5 ml-2" />
        محاسبه برنامه تجویز
      </Button>
    </form>
  );
}
