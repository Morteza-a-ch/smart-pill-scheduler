import { MedicationType, medicationTypes } from '@/utils/persianCalendar';

export type MedForm = 'syrup' | 'tablet' | 'ampoule' | 'suppository';

export const medFormLabels: Record<MedForm, string> = {
  syrup: 'شربت',
  tablet: 'قرص',
  ampoule: 'آمپول',
  suppository: 'شیاف',
};

export const medFormUnitLabels: Record<MedForm, string> = {
  syrup: 'شیشه',
  tablet: 'بلیستر',
  ampoule: 'آمپول',
  suppository: 'بسته',
};

export const medFormDefaultVolume: Record<MedForm, number> = {
  syrup: 250,
  tablet: 10,
  ampoule: 1,
  suppository: 10,
};

/** نگاشت شکل دارو به نوع پشتیبانی‌شده در موتور محاسبات */
export function formToCalcType(form: MedForm): MedicationType {
  if (form === 'suppository') return 'tablet';
  return form as MedicationType;
}

export const caseStatusLabels = {
  unreviewed: 'بررسی نشده',
  reviewing: 'در حال بررسی',
  approved: 'تایید شده',
  rejected: 'رد شده',
  reappeal: 'اعتراض / بررسی مجدد',
} as const;

export type CaseStatus = keyof typeof caseStatusLabels;

/** رنگ‌بندی وضعیت پرونده مطابق قواعد کمیسیون */
export const caseStatusClasses: Record<CaseStatus, string> = {
  unreviewed: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  reviewing: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  rejected: 'bg-muted text-muted-foreground border-border',
  reappeal: 'bg-[hsl(25,45%,35%)]/10 text-[hsl(25,45%,35%)] border-[hsl(25,45%,35%)]/30',
};

export { medicationTypes };

export const COMMISSION_FEE = 500000; // ریال - هزینه تشکیل پرونده کمیسیون

export function formatToman(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}
