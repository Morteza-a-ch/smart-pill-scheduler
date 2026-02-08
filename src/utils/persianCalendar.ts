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

// محاسبه حداکثر تاریخ مجاز (۶ ماه با احتساب ماه ثبت نسخه)
// مثال: اگر نسخه در فروردین ثبت شده، تا آخر شهریور (ماه ۶) اعتبار دارد
export function getMaxPrescriptionDate(startDate: PersianDate): PersianDate {
  let { year, month } = startDate;
  
  // ۶ ماه با احتساب ماه جاری یعنی ۵ ماه اضافه می‌کنیم
  month += 5;
  if (month > 12) {
    month -= 12;
    year++;
  }
  
  // آخرین روز ماه ششم
  const lastDay = getDaysInMonth(month);
  
  return { year, month, day: lastDay };
}

// محاسبه تعداد روزهایی که یک واحد دارو کفایت می‌کند
export function calculateDaysPerUnit(medication: MedicationInfo): number {
  return Math.floor(medication.unitVolume / medication.dailyDose);
}

// دریافت تاریخ شمسی امروز
export function getTodayPersianDate(): PersianDate {
  const today = new Date();
  
  // تبدیل میلادی به شمسی با استفاده از فرمول
  const gy = today.getFullYear();
  const gm = today.getMonth() + 1;
  const gd = today.getDate();
  
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  
  if (gy > 1600) {
    jy = 979;
  } else {
    jy = 0;
  }
  
  const gy2 = (gy > 1600) ? gy - 1600 : gy - 621;
  let days = (365 * gy2) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  
  if (gm > 2 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) {
    days++;
  }
  
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let jm: number;
  let jd: number;
  
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  
  return { year: jy, month: jm, day: jd };
}

// واحدهای دارو
export type MedicationType = 'syrup' | 'ampoule' | 'tablet';

export interface MedicationInfo {
  type: MedicationType;
  unitVolume: number; // حجم هر واحد (مثلاً ۲۵۰ سی‌سی)
  dailyDose: number; // مصرف روزانه (مثلاً ۱۲ سی‌سی)
  unitLabel: string; // برچسب واحد (شیشه، آمپول، بسته)
  reductionPercent?: number; // درصد کاهش در هر بازه
  reductionIntervalMonths?: number; // بازه کاهش (ماه)
}

export const medicationTypes: Record<MedicationType, { label: string; unitLabel: string; defaultVolume: number; tabletsPerBlister?: number }> = {
  syrup: { label: 'شربت', unitLabel: 'شیشه', defaultVolume: 250 },
  ampoule: { label: 'آمپول', unitLabel: 'آمپول', defaultVolume: 1 },
  tablet: { label: 'قرص', unitLabel: 'بلیستر', defaultVolume: 10, tabletsPerBlister: 10 },
};

export interface DoseSchedule {
  doseNumber: number;
  startDate: PersianDate;
  endDate: PersianDate;
  daysCount: number;
  medicationAmount: number;
  medicationVolume: number; // حجم کل دارو (سی‌سی یا تعداد قرص)
  dailyDoseForPeriod: number; // دوز روزانه این دوره (ممکن است کاهش یافته باشد)
  daysFromStart: number;
  isFinal: boolean;
}

// محاسبه برنامه نوبت‌های دارو
export function calculateDoseSchedule(
  startDate: PersianDate,
  medication: MedicationInfo,
  maxMedicationPerDose?: number, // محدودیت تعداد دارو در هر نوبت
  singleDoseMode?: boolean // حالت تک‌نوبتی برای رسیدن به کمیسیون
): DoseSchedule[] {
  const maxDate = getMaxPrescriptionDate(startDate);
  const totalDays = daysBetween(startDate, maxDate);
  
  // محاسبه تعداد روزهایی که هر واحد دارو کفایت می‌کند
  const daysPerUnit = calculateDaysPerUnit(medication);
  
  const schedule: DoseSchedule[] = [];
  let currentDate = { ...startDate };
  let daysFromStart = 0;
  let doseNumber = 1;
  let remainingDays = totalDays;

  // ثابت‌های محدودیت روز
  const MIN_DAYS_PER_DOSE = 50;
  const MAX_DAYS_PER_DOSE = 62;
  
  // پارامترهای کاهش دارو
  const reductionPercent = medication.reductionPercent || 0;
  const reductionIntervalMonths = medication.reductionIntervalMonths || 2;
  const reductionIntervalDays = reductionIntervalMonths * 30; // تقریبی
  
  // محاسبه دوز روزانه با کاهش بر اساس زمان گذشته
  const getDailyDoseForPeriod = (daysFromStartOfPrescription: number): number => {
    if (reductionPercent <= 0) return medication.dailyDose;
    
    // تعداد بازه‌های کاهش که گذشته
    const reductionPeriods = Math.floor(daysFromStartOfPrescription / reductionIntervalDays);
    const reductionFactor = Math.pow(1 - reductionPercent / 100, reductionPeriods);
    return medication.dailyDose * reductionFactor;
  };
  
  // محاسبه مقدار دارو برای نوبت‌های عادی (برای استفاده به عنوان سقف نوبت آخر)
  const normalDoseMedicationAmount = maxMedicationPerDose || 
    Math.ceil((medication.dailyDose * MIN_DAYS_PER_DOSE) / medication.unitVolume);

  // حالت تک‌نوبتی: فقط یک نوبت تا رسیدن به اول ماه بعد + چند روز
  if (singleDoseMode) {
    // محاسبه روزهای باقی‌مانده تا اول ماه بعد
    let { year, month, day } = startDate;
    const daysLeftInMonth = getDaysInMonth(month) - day + 1;
    
    // تا اول ماه بعد + ۵ روز اضافی برای اطمینان
    const targetDays = daysLeftInMonth + 5;
    const currentDailyDose = getDailyDoseForPeriod(0);
    
    // محاسبه مقدار دارو (رو به پایین)
    let medicationAmount = Math.floor((currentDailyDose * targetDays) / medication.unitVolume);
    medicationAmount = Math.max(1, medicationAmount);
    
    // محدود کردن به سقف نوبت‌های عادی
    medicationAmount = Math.min(medicationAmount, normalDoseMedicationAmount);
    
    // محاسبه روزها بر اساس تعداد دارو
    const daysCount = Math.floor((medicationAmount * medication.unitVolume) / currentDailyDose);
    const medicationVolume = medicationAmount * medication.unitVolume;
    const endDate = addDays(startDate, daysCount - 1);
    
    schedule.push({
      doseNumber: 1,
      startDate: { ...startDate },
      endDate,
      daysCount,
      medicationAmount,
      medicationVolume,
      dailyDoseForPeriod: currentDailyDose,
      daysFromStart: 0,
      isFinal: true,
    });
    
    return schedule;
  }

  while (remainingDays > 0) {
    // محاسبه دوز روزانه فعلی با احتساب کاهش
    const currentDailyDose = getDailyDoseForPeriod(daysFromStart);
    
    // بررسی اینکه آیا این باید نوبت آخر باشد
    // نوبت آخر: فقط وقتی روزهای باقی‌مانده کمتر یا مساوی ۶۲ روز است
    const isLastDose = remainingDays <= MAX_DAYS_PER_DOSE;
    
    let medicationAmount: number;
    let daysCount: number;
    
    if (isLastDose) {
      // نوبت آخر: روزهای باقی‌مانده با گرد به پایین برای مقدار دارو
      // مقدار دارو نباید بیشتر از نوبت‌های عادی باشد
      daysCount = remainingDays;
      medicationAmount = Math.floor((currentDailyDose * daysCount) / medication.unitVolume);
      medicationAmount = Math.max(1, medicationAmount);
      
      // اطمینان از اینکه مقدار دارو نوبت آخر ≤ نوبت‌های عادی
      medicationAmount = Math.min(medicationAmount, normalDoseMedicationAmount);
      
      // محاسبه مجدد روزها بر اساس تعداد دارو (گرد به پایین)
      daysCount = Math.floor((medicationAmount * medication.unitVolume) / currentDailyDose);
      daysCount = Math.max(1, daysCount);
      
      const endDate = addDays(currentDate, daysCount - 1);
      const medicationVolume = medicationAmount * medication.unitVolume;
      
      schedule.push({
        doseNumber,
        startDate: { ...currentDate },
        endDate,
        daysCount,
        medicationAmount,
        medicationVolume,
        dailyDoseForPeriod: currentDailyDose,
        daysFromStart,
        isFinal: true,
      });
      
      // خروج از حلقه - نوبت آخر فقط یکی است
      break;
    } else {
      // نوبت‌های عادی (نوبت ۱ و ۲): بین ۵۰ تا ۶۲ روز
      // منطق: حداقل تعداد شیشه که حداقل ۵۰ روز را پوشش دهد
      // سپس تعداد روز واقعی بر اساس آن محاسبه می‌شود
      if (maxMedicationPerDose) {
        // اگر محدودیت داریم، از محدودیت استفاده کن
        medicationAmount = maxMedicationPerDose;
      } else {
        // حداقل شیشه برای پوشش ۵۰ روز (گرد رو به بالا)
        medicationAmount = Math.ceil((currentDailyDose * MIN_DAYS_PER_DOSE) / medication.unitVolume);
      }
      
      // محاسبه تعداد روزهای واقعی بر اساس تعداد دارو (گرد به پایین برای روزها)
      daysCount = Math.floor((medicationAmount * medication.unitVolume) / currentDailyDose);
      
      // اطمینان از محدوده ۵۰-۶۲ روز برای نوبت‌های عادی
      if (daysCount < MIN_DAYS_PER_DOSE) {
        // اگر کمتر از ۵۰ روز شد، تعداد دارو را افزایش بده (گرد رو به بالا)
        medicationAmount = Math.ceil((currentDailyDose * MIN_DAYS_PER_DOSE) / medication.unitVolume);
        daysCount = Math.floor((medicationAmount * medication.unitVolume) / currentDailyDose);
      }
      
      if (daysCount > MAX_DAYS_PER_DOSE) {
        // محدود کردن به ۶۲ روز
        daysCount = MAX_DAYS_PER_DOSE;
        medicationAmount = Math.ceil((currentDailyDose * daysCount) / medication.unitVolume);
        daysCount = Math.floor((medicationAmount * medication.unitVolume) / currentDailyDose);
      }
      
      daysCount = Math.max(1, daysCount);
    }
    
    const endDate = addDays(currentDate, daysCount - 1);
    const medicationVolume = medicationAmount * medication.unitVolume;
    
    schedule.push({
      doseNumber,
      startDate: { ...currentDate },
      endDate,
      daysCount,
      medicationAmount,
      medicationVolume,
      dailyDoseForPeriod: currentDailyDose,
      daysFromStart,
      isFinal: false,
    });
    
    daysFromStart += daysCount;
    currentDate = addDays(currentDate, daysCount);
    remainingDays -= daysCount;
    doseNumber++;
    
    // جلوگیری از حلقه بی‌نهایت
    if (doseNumber > 50) break;
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