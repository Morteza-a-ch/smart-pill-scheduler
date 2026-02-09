import { 
  DoseSchedule, 
  MedicationInfo,
  PersianDate,
  formatPersianDate,
  formatPersianDateWithMonth,
  toPersianDigits,
  getMaxPrescriptionDate,
  calculateDaysPerUnit
} from '@/utils/persianCalendar';
import { Calendar, Package, Clock, AlertCircle, CheckCircle2, Printer, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DoseScheduleDisplayProps {
  schedule: DoseSchedule[];
  medication: MedicationInfo;
  startDate: PersianDate;
}

export function DoseScheduleDisplay({ schedule, medication, startDate }: DoseScheduleDisplayProps) {
  const maxDate = getMaxPrescriptionDate(startDate);
  const daysPerUnit = medication.type === 'ampoule' ? 0 : calculateDaysPerUnit(medication);
  
  const totalMedication = schedule.reduce((sum, dose) => sum + dose.medicationAmount, 0);
  const totalVolume = schedule.reduce((sum, dose) => sum + dose.medicationVolume, 0);
  const totalDays = schedule.reduce((sum, dose) => sum + dose.daysCount, 0);
  const hasReduction = medication.reductionPercent && medication.reductionPercent > 0;
  const isAmpouleWithInterval = medication.type === 'ampoule' && medication.dispensingIntervalDays;

  // تابع چاپ نوبت
  const handlePrintDose = (dose: DoseSchedule) => {
    const printContent = `
      <html dir="rtl">
        <head>
          <title>نوبت ${dose.doseNumber}</title>
          <style>
            body { font-family: Vazirmatn, Tahoma, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>برگه تجویز دارو - نوبت ${toPersianDigits(dose.doseNumber)}</h2>
          </div>
          <div class="info"><span class="label">نوع دارو:</span> ${medication.unitLabel}</div>
          <div class="info"><span class="label">تعداد:</span> ${toPersianDigits(dose.medicationAmount)} ${medication.unitLabel}</div>
          <div class="info"><span class="label">مقدار کل:</span> ${toPersianDigits(dose.medicationVolume)} ${medication.type === 'syrup' ? 'سی‌سی' : medication.type === 'tablet' ? 'قرص' : 'عدد'}</div>
          <div class="info"><span class="label">مصرف روزانه:</span> ${toPersianDigits(Number(dose.dailyDoseForPeriod.toFixed(2)))} ${medication.type === 'syrup' ? 'سی‌سی' : 'عدد'}</div>
          <div class="info"><span class="label">از تاریخ:</span> ${formatPersianDate(dose.startDate)}</div>
          <div class="info"><span class="label">تا تاریخ:</span> ${formatPersianDate(dose.endDate)}</div>
          <div class="info"><span class="label">مدت:</span> ${toPersianDigits(dose.daysCount)} روز</div>
          ${dose.isFinal ? '<div class="info" style="color: green;"><strong>نوبت آخر</strong></div>' : ''}
          <div class="footer">سامانه تجویز دارو</div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // تابع تعیین واحد مقدار
  const getVolumeUnit = () => {
    if (medication.type === 'syrup') return 'سی‌سی';
    if (medication.type === 'tablet') return 'قرص';
    return 'عدد';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* خلاصه */}
      <div className="schedule-container">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">خلاصه برنامه تجویز</h3>
            <p className="text-sm text-muted-foreground">
              از {formatPersianDateWithMonth(startDate)} تا حداکثر {formatPersianDateWithMonth(maxDate)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAmpouleWithInterval ? (
                <>
                  تحویل هر {toPersianDigits(medication.dispensingIntervalDays!)} روز
                  {hasReduction && (
                    <span className="mr-2 text-accent">
                      • کاهش {toPersianDigits(medication.reductionPercent!)}٪ هر {toPersianDigits(medication.reductionIntervalMonths!)} ماه
                    </span>
                  )}
                </>
              ) : (
                <>
                  هر {medication.unitLabel}: {toPersianDigits(daysPerUnit)} روز
                  {hasReduction && (
                    <span className="mr-2 text-accent">
                      • کاهش {toPersianDigits(medication.reductionPercent!)}٪ هر {toPersianDigits(medication.reductionIntervalMonths!)} ماه
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-primary">{toPersianDigits(schedule.length)}</div>
            <div className="text-sm text-muted-foreground">تعداد نوبت</div>
          </div>
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-secondary">{toPersianDigits(totalMedication)}</div>
            <div className="text-sm text-muted-foreground">کل {medication.unitLabel}</div>
          </div>
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-accent">{toPersianDigits(totalVolume)}</div>
            <div className="text-sm text-muted-foreground">{getVolumeUnit()}</div>
          </div>
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-muted-foreground">{toPersianDigits(totalDays)}</div>
            <div className="text-sm text-muted-foreground">روز</div>
          </div>
        </div>
      </div>

      {/* لیست نوبت‌ها */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          جزئیات نوبت‌ها
        </h3>

        {schedule.map((dose, index) => (
          <div 
            key={dose.doseNumber}
            className={dose.isFinal ? 'dose-card-final' : 'dose-card-normal'}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  dose.isFinal 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {toPersianDigits(dose.doseNumber)}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    نوبت {toPersianDigits(dose.doseNumber)}
                    {dose.isFinal && (
                      <span className="mr-2 px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary">
                        نوبت آخر
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {toPersianDigits(dose.daysFromStart)} روز بعد از ثبت نسخه
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl text-center ${
                  dose.isFinal 
                    ? 'bg-secondary/10' 
                    : 'bg-primary/10'
                }`}>
                  <div className={`text-2xl font-bold ${
                    dose.isFinal ? 'text-secondary' : 'text-primary'
                  }`}>
                    {toPersianDigits(dose.medicationAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">{medication.unitLabel}</div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintDose(dose)}
                  className="gap-1"
                >
                  <Printer className="w-4 h-4" />
                  چاپ
                </Button>
              </div>
            </div>

            {/* نمایش مقدار دارو */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">مقدار کل:</span>
                <span className="font-medium text-foreground">
                  {toPersianDigits(dose.medicationVolume)} {getVolumeUnit()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasReduction && dose.dailyDoseForPeriod < medication.dailyDose ? (
                  <TrendingDown className="w-4 h-4 text-accent" />
                ) : (
                  <Clock className="w-4 h-4 text-secondary" />
                )}
                <span className="text-muted-foreground">مصرف روزانه:</span>
                <span className="font-medium text-foreground">
                  {toPersianDigits(Number(dose.dailyDoseForPeriod.toFixed(2)))} {getVolumeUnit()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>از: {formatPersianDate(dose.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>تا: {formatPersianDate(dose.endDate)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                مدت: <span className="font-medium text-foreground">{toPersianDigits(dose.daysCount)} روز</span>
              </span>
              
              <span className={`mr-auto flex items-center gap-1 ${dose.isFinal ? 'text-secondary' : 'text-primary'}`}>
                <CheckCircle2 className="w-4 h-4" />
                {dose.isFinal ? 'گرد شده رو به پایین' : 'گرد شده رو به بالا'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* یادداشت */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">نکات مهم:</p>
            <ul className="list-disc list-inside space-y-1">
              {!isAmpouleWithInterval && <li>هر {medication.unitLabel} برای {toPersianDigits(daysPerUnit)} روز کفایت می‌کند</li>}
              {isAmpouleWithInterval && <li>بیمار هر {toPersianDigits(medication.dispensingIntervalDays!)} روز برای دریافت دارو مراجعه می‌کند</li>}
              <li>نوبت‌های عادی رو به بالا گرد شده‌اند تا بیمار کمبود دارو نداشته باشد</li>
              <li>نوبت آخر رو به پایین گرد شده تا از انباشت دارو جلوگیری شود</li>
              <li>حداکثر تاریخ مجاز: {formatPersianDateWithMonth(maxDate)} (۶ ماه بعد از ثبت نسخه)</li>
              {hasReduction && (
                <li>دوز روزانه هر {toPersianDigits(medication.reductionIntervalMonths!)} ماه {toPersianDigits(medication.reductionPercent!)}٪ کاهش می‌یابد</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
