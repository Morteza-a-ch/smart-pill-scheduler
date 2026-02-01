// محاسبات تقویم شمسی - بدون وابستگی خارجی

export interface PersianDate {
  year: number;
  month: number;
  day: number;
}

// تبدیل عدد به فارسی
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// نام ماه‌های شمسی
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// تعداد روزهای هر ماه شمسی
export function getDaysInMonth(month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  return 29; // ماه ۱۲ (اسفند)
}

// فرمت تاریخ شمسی
export function formatPersianDate(date: PersianDate): string {
  const { year, month, day } = date;
  return `${toPersianDigits(year)}/${toPersianDigits(month.toString().padStart(2, '0'))}/${toPersianDigits(day.toString().padStart(2, '0'))}`;
}

// فرمت تاریخ شمسی با نام ماه
export function formatPersianDateWithMonth(date: PersianDate): string {
  const { year, month, day } = date;
  return `${toPersianDigits(day)} ${persianMonths[month - 1]} ${toPersianDigits(year)}`;
}

// اعتبارسنجی تاریخ شمسی
export function isValidPersianDate(date: PersianDate): boolean {
  const { year, month, day } = date;
  if (year < 1300 || year > 1500) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > getDaysInMonth(month)) return false;
  return true;
}

// تبدیل تاریخ شمسی به روز ترتیبی سال
export function getDayOfYear(date: PersianDate): number {
  let days = 0;
  for (let m = 1; m < date.month; m++) {
    days += getDaysInMonth(m);
  }
  return days + date.day;
}

// تبدیل تاریخ شمسی به عدد روز مطلق (برای محاسبات)
export function toAbsoluteDay(date: PersianDate): number {
  const daysInYear = 365; // سال عادی
  const yearDays = (date.year - 1300) * daysInYear;
  return yearDays + getDayOfYear(date);
}

// اضافه کردن روز به تاریخ شمسی
export function addDays(date: PersianDate, days: number): PersianDate {
  let { year, month, day } = date;
  day += days;

  while (day > getDaysInMonth(month)) {
    day -= getDaysInMonth(month);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  while (day < 1) {
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    day += getDaysInMonth(month);
  }

  return { year, month, day };
}

// محاسبه تفاوت روز بین دو تاریخ
export function daysBetween(from: PersianDate, to: PersianDate): number {
  return toAbsoluteDay(to) - toAbsoluteDay(from);
}

// محاسبه تاریخ کمیسیون بعدی (۶ ماه بعد، اواخر ماه)
export function getNextCommissionDate(startDate: PersianDate): PersianDate {
  let { year, month, day } = startDate;
  
  // اضافه کردن ۶ ماه
  month += 6;
  if (month > 12) {
    month -= 12;
    year++;
  }
  
  // انتخاب روز ۲۵ ماه (اواخر ماه)
  day = 25;
  
  return { year, month, day };
}

// واحدهای دارو
export type MedicationType = 'syrup' | 'ampoule' | 'tablet';

export interface MedicationInfo {
  type: MedicationType;
  unitVolume: number; // حجم هر واحد (مثلاً ۲۵۰ سی‌سی)
  dailyDose: number; // مصرف روزانه (مثلاً ۱۲ سی‌سی)
  unitLabel: string; // برچسب واحد (شیشه، آمپول، بسته)
}

export const medicationTypes: Record<MedicationType, { label: string; unitLabel: string; defaultVolume: number }> = {
  syrup: { label: 'شربت', unitLabel: 'شیشه', defaultVolume: 250 },
  ampoule: { label: 'آمپول', unitLabel: 'آمپول', defaultVolume: 1 },
  tablet: { label: 'قرص', unitLabel: 'بسته', defaultVolume: 30 },
};

export interface DoseSchedule {
  doseNumber: number;
  startDate: PersianDate;
  endDate: PersianDate;
  daysCount: number;
  medicationAmount: number;
  daysFromStart: number;
  isFinal: boolean;
}

// محاسبه برنامه نوبت‌های دارو
export function calculateDoseSchedule(
  startDate: PersianDate,
  medication: MedicationInfo,
  maxMedicationPerDose?: number // محدودیت تعداد دارو در هر نوبت
): DoseSchedule[] {
  const MAX_DOSE_DAYS = 62; // حداکثر روز هر نوبت
  const commissionDate = getNextCommissionDate(startDate);
  const totalDays = daysBetween(startDate, commissionDate);
  
  const schedule: DoseSchedule[] = [];
  let currentDate = { ...startDate };
  let daysFromStart = 0;
  let doseNumber = 1;
  let remainingDays = totalDays;

  while (remainingDays > 0) {
    const isLast = remainingDays <= MAX_DOSE_DAYS;
    let daysCount = isLast ? remainingDays : MAX_DOSE_DAYS;
    
    // محاسبه مقدار دارو - همیشه رو به پایین گرد می‌شود
    let totalDoseNeeded = (medication.dailyDose * daysCount) / medication.unitVolume;
    let medicationAmount = Math.floor(totalDoseNeeded);
    medicationAmount = Math.max(1, medicationAmount); // حداقل یک واحد
    
    // اعمال محدودیت تعداد دارو
    if (maxMedicationPerDose && medicationAmount > maxMedicationPerDose) {
      medicationAmount = maxMedicationPerDose;
      // محاسبه تعداد روزهای واقعی بر اساس محدودیت
      daysCount = Math.floor((medicationAmount * medication.unitVolume) / medication.dailyDose);
      daysCount = Math.max(1, daysCount);
    }
    
    const endDate = addDays(currentDate, daysCount - 1);
    
    schedule.push({
      doseNumber,
      startDate: { ...currentDate },
      endDate,
      daysCount,
      medicationAmount,
      daysFromStart,
      isFinal: isLast && remainingDays <= daysCount,
    });
    
    daysFromStart += daysCount;
    currentDate = addDays(currentDate, daysCount);
    remainingDays -= daysCount;
    doseNumber++;
    
    // جلوگیری از حلقه بی‌نهایت
    if (doseNumber > 20) break;
  }
  
  return schedule;
}

// تولید آرایه سال‌ها
export function generateYears(startYear: number = 1400, endYear: number = 1410): number[] {
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

// تولید آرایه روزها برای یک ماه
export function generateDays(month: number): number[] {
  const days: number[] = [];
  const maxDays = getDaysInMonth(month);
  for (let d = 1; d <= maxDays; d++) {
    days.push(d);
  }
  return days;
}
