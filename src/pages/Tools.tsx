import { useState } from 'react';
import { MedicationForm } from '@/components/MedicationForm';
import { DoseScheduleDisplay } from '@/components/DoseScheduleDisplay';
import { DateCalculator } from '@/components/DateCalculator';
import { PersianDate, MedicationInfo, DoseSchedule, calculateDoseSchedule } from '@/utils/persianCalendar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Tools() {
  const [schedule, setSchedule] = useState<DoseSchedule[] | null>(null);
  const [medication, setMedication] = useState<MedicationInfo | null>(null);
  const [startDate, setStartDate] = useState<PersianDate | null>(null);

  const handleSubmit = (date: PersianDate, med: MedicationInfo, max?: number, single?: boolean) => {
    setSchedule(calculateDoseSchedule(date, med, max, single));
    setMedication(med);
    setStartDate(date);
  };

  return (
    <div className="space-y-6">
      {!schedule ? (
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-bold mb-2">ماشین‌حساب تجویز دارو</h2>
          <p className="text-muted-foreground text-sm mb-6">تاریخ نسخه و مشخصات دارو را وارد کنید تا برنامه نوبت‌بندی محاسبه شود</p>
          <MedicationForm onSubmit={handleSubmit} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">برنامه تجویز دارو</h2>
            <Button variant="outline" className="gap-2" onClick={() => { setSchedule(null); setMedication(null); setStartDate(null); }}>
              <RefreshCw className="w-4 h-4" /> محاسبه جدید
            </Button>
          </div>
          {medication && startDate && (
            <DoseScheduleDisplay schedule={schedule} medication={medication} startDate={startDate} />
          )}
        </div>
      )}
      <DateCalculator />
    </div>
  );
}
