import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PersianDate, 
  addDays, 
  daysBetween,
  formatPersianDateWithMonth,
  generateYears,
  generateDays,
  persianMonths,
  toPersianDigits,
  isValidPersianDate
} from '@/utils/persianCalendar';
import { Calendar, ArrowLeft, Calculator, RotateCcw } from 'lucide-react';

export function DateCalculator() {
  // حالت محاسبه تاریخ بعدی
  const [startYear, setStartYear] = useState<number>(1403);
  const [startMonth, setStartMonth] = useState<number>(1);
  const [startDay, setStartDay] = useState<number>(1);
  const [daysToAdd, setDaysToAdd] = useState<string>('62');
  const [resultDate, setResultDate] = useState<PersianDate | null>(null);

  // حالت محاسبه معکوس
  const [fromYear, setFromYear] = useState<number>(1403);
  const [fromMonth, setFromMonth] = useState<number>(1);
  const [fromDay, setFromDay] = useState<number>(1);
  const [toYear, setToYear] = useState<number>(1403);
  const [toMonth, setToMonth] = useState<number>(7);
  const [toDay, setToDay] = useState<number>(1);
  const [daysDiff, setDaysDiff] = useState<number | null>(null);

  const [error, setError] = useState<string>('');

  const years = generateYears(1400, 1410);
  const startDays = generateDays(startMonth);
  const fromDays = generateDays(fromMonth);
  const toDays = generateDays(toMonth);

  const handleCalculateForward = () => {
    setError('');
    setResultDate(null);

    const date: PersianDate = { year: startYear, month: startMonth, day: startDay };
    
    if (!isValidPersianDate(date)) {
      setError('تاریخ شروع معتبر نیست');
      return;
    }

    const days = parseInt(daysToAdd);
    if (isNaN(days) || days < 0) {
      setError('تعداد روز باید عدد مثبت باشد');
      return;
    }

    const result = addDays(date, days);
    setResultDate(result);
  };

  const handleCalculateReverse = () => {
    setError('');
    setDaysDiff(null);

    const from: PersianDate = { year: fromYear, month: fromMonth, day: fromDay };
    const to: PersianDate = { year: toYear, month: toMonth, day: toDay };
    
    if (!isValidPersianDate(from)) {
      setError('تاریخ شروع معتبر نیست');
      return;
    }

    if (!isValidPersianDate(to)) {
      setError('تاریخ پایان معتبر نیست');
      return;
    }

    const diff = daysBetween(from, to);
    setDaysDiff(diff);
  };

  const DateSelector = ({ 
    year, setYear, 
    month, setMonth, 
    day, setDay, 
    days, 
    label 
  }: { 
    year: number; setYear: (y: number) => void;
    month: number; setMonth: (m: number) => void;
    day: number; setDay: (d: number) => void;
    days: number[];
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="input-medical text-sm">
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

        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="input-medical text-sm">
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

        <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
          <SelectTrigger className="input-medical text-sm">
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
  );

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">ماشین‌حساب تاریخ</h3>
          <p className="text-sm text-muted-foreground">محاسبه تاریخ و فاصله زمانی</p>
        </div>
      </div>

      <Tabs defaultValue="forward" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="forward" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            تاریخ بعدی
          </TabsTrigger>
          <TabsTrigger value="reverse" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            فاصله زمانی
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forward" className="space-y-4">
          <DateSelector
            year={startYear} setYear={setStartYear}
            month={startMonth} setMonth={setStartMonth}
            day={startDay} setDay={setStartDay}
            days={startDays}
            label="تاریخ شروع"
          />

          <div className="space-y-2">
            <Label htmlFor="daysToAdd">تعداد روز بعد</Label>
            <Input
              id="daysToAdd"
              type="number"
              value={daysToAdd}
              onChange={(e) => setDaysToAdd(e.target.value)}
              className="input-medical"
              min="0"
              step="1"
            />
          </div>

          <Button 
            onClick={handleCalculateForward}
            className="w-full btn-medical bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Calendar className="w-4 h-4 ml-2" />
            محاسبه تاریخ
          </Button>

          {resultDate && (
            <div className="p-4 rounded-xl bg-accent/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">تاریخ محاسبه شده:</p>
              <p className="text-xl font-bold text-accent">
                {formatPersianDateWithMonth(resultDate)}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reverse" className="space-y-4">
          <DateSelector
            year={fromYear} setYear={setFromYear}
            month={fromMonth} setMonth={setFromMonth}
            day={fromDay} setDay={setFromDay}
            days={fromDays}
            label="از تاریخ"
          />

          <DateSelector
            year={toYear} setYear={setToYear}
            month={toMonth} setMonth={setToMonth}
            day={toDay} setDay={setToDay}
            days={toDays}
            label="تا تاریخ"
          />

          <Button 
            onClick={handleCalculateReverse}
            className="w-full btn-medical bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            محاسبه فاصله
          </Button>

          {daysDiff !== null && (
            <div className="p-4 rounded-xl bg-accent/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">فاصله زمانی:</p>
              <p className="text-xl font-bold text-accent">
                {toPersianDigits(Math.abs(daysDiff))} روز
                {daysDiff < 0 && ' (معکوس)'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
