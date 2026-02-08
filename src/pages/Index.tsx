import { useState } from 'react';
import { MedicationForm } from '@/components/MedicationForm';
import { DoseScheduleDisplay } from '@/components/DoseScheduleDisplay';
import { DateCalculator } from '@/components/DateCalculator';
import { 
  PersianDate, 
  MedicationInfo, 
  DoseSchedule,
  calculateDoseSchedule 
} from '@/utils/persianCalendar';
import { Stethoscope, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [schedule, setSchedule] = useState<DoseSchedule[] | null>(null);
  const [medication, setMedication] = useState<MedicationInfo | null>(null);
  const [startDate, setStartDate] = useState<PersianDate | null>(null);

  const handleSubmit = (date: PersianDate, med: MedicationInfo, maxMedicationPerDose?: number, singleDoseMode?: boolean) => {
    const result = calculateDoseSchedule(date, med, maxMedicationPerDose, singleDoseMode);
    setSchedule(result);
    setMedication(med);
    setStartDate(date);
  };

  const handleReset = () => {
    setSchedule(null);
    setMedication(null);
    setStartDate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* هدر */}
      <header className="header-gradient text-primary-foreground py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">سامانه تجویز دارو</h1>
              <p className="text-primary-foreground/80 text-sm">
                زمان‌بندی هوشمند بر اساس تقویم شمسی
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* محتوا */}
      <main className="container max-w-2xl mx-auto px-4 py-8">
        {!schedule ? (
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">ثبت اطلاعات</h2>
              <p className="text-muted-foreground text-sm">
                تاریخ نسخه و مشخصات دارو را وارد کنید تا برنامه تجویز محاسبه شود
              </p>
            </div>
            <MedicationForm onSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">برنامه تجویز دارو</h2>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                محاسبه جدید
              </Button>
            </div>
            
            {medication && startDate && (
              <DoseScheduleDisplay 
                schedule={schedule} 
                medication={medication}
                startDate={startDate}
              />
            )}
          </div>
        )}

        {/* ماشین‌حساب تاریخ */}
        <div className="mt-8">
          <DateCalculator />
        </div>
      </main>

      {/* فوتر */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-8">
        <p>سامانه هوشمند ثبت و زمان‌بندی تجویز دارو</p>
        <p className="mt-1">طراحی شده برای داروخانه‌ها و مراکز درمانی</p>
      </footer>
    </div>
  );
};

export default Index;
