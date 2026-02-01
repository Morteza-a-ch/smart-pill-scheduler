import { 
  DoseSchedule, 
  MedicationInfo,
  PersianDate,
  formatPersianDate,
  formatPersianDateWithMonth,
  toPersianDigits,
  getNextCommissionDate
} from '@/utils/persianCalendar';
import { Calendar, Package, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DoseScheduleDisplayProps {
  schedule: DoseSchedule[];
  medication: MedicationInfo;
  startDate: PersianDate;
}

export function DoseScheduleDisplay({ schedule, medication, startDate }: DoseScheduleDisplayProps) {
  const commissionDate = getNextCommissionDate(startDate);
  
  const totalMedication = schedule.reduce((sum, dose) => sum + dose.medicationAmount, 0);
  const totalDays = schedule.reduce((sum, dose) => sum + dose.daysCount, 0);

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
              از {formatPersianDateWithMonth(startDate)} تا کمیسیون {formatPersianDateWithMonth(commissionDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-primary">{toPersianDigits(schedule.length)}</div>
            <div className="text-sm text-muted-foreground">تعداد نوبت</div>
          </div>
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-secondary">{toPersianDigits(totalMedication)}</div>
            <div className="text-sm text-muted-foreground">کل {medication.unitLabel}</div>
          </div>
          <div className="p-4 rounded-xl bg-card">
            <div className="text-2xl font-bold text-accent">{toPersianDigits(totalDays)}</div>
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
              
              <span className="mr-auto flex items-center gap-1 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                گرد شده رو به پایین
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
              <li>تمام نوبت‌ها رو به پایین گرد شده‌اند تا داروی اضافی تجویز نشود</li>
              <li>تاریخ کمیسیون بعدی: {formatPersianDateWithMonth(commissionDate)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
