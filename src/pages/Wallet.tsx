import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatToman } from '@/lib/medical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Tx {
  id: string; type: 'deposit' | 'withdraw'; amount: number;
  status: 'pending' | 'done' | 'failed'; description: string | null; created_at: string;
}

const statusLabels = { pending: 'در انتظار', done: 'انجام شده', failed: 'ناموفق' };

export default function Wallet() {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<Tx[]>([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('wallet_transactions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setRows((data as Tx[]) ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const balance = rows.filter((r) => r.status === 'done')
    .reduce((s, r) => s + (r.type === 'deposit' ? r.amount : -r.amount), 0);

  const act = async (type: 'deposit' | 'withdraw') => {
    if (!user) return;
    const value = Number(amount);
    if (!value || value <= 0) return toast.error('مبلغ را وارد کنید');
    if (type === 'withdraw' && value > balance) return toast.error('موجودی کافی نیست');
    setBusy(true);
    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type,
      amount: value,
      status: type === 'deposit' ? 'done' : 'pending',
      description: type === 'deposit' ? 'افزایش موجودی' : 'درخواست برداشت',
      card_number: type === 'withdraw' ? profile?.card_number ?? null : null,
      sheba: type === 'withdraw' ? profile?.sheba ?? null : null,
    });
    setBusy(false);
    if (error) return toast.error('خطا: ' + error.message);
    setAmount('');
    toast.success(type === 'deposit' ? 'موجودی افزایش یافت' : 'درخواست برداشت ثبت شد');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <p className="text-sm text-muted-foreground">موجودی کیف پول</p>
        <p className="text-3xl font-bold mt-1">{formatToman(balance)} ریال</p>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end mt-5">
          <div className="space-y-1.5">
            <Label>مبلغ (ریال)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button onClick={() => act('deposit')} disabled={busy}>افزایش موجودی</Button>
          <Button variant="outline" onClick={() => act('withdraw')} disabled={busy}>درخواست برداشت</Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
        <h3 className="font-bold">تراکنش‌ها</h3>
        {!rows.length && <p className="text-sm text-muted-foreground">تراکنشی ثبت نشده است.</p>}
        {rows.map((r) => (
          <div key={r.id} className="border border-border rounded-xl p-3 text-sm flex justify-between flex-wrap gap-2">
            <span>{r.description || (r.type === 'deposit' ? 'واریز' : 'برداشت')}</span>
            <span className={r.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}>
              {r.type === 'deposit' ? '+' : '−'} {formatToman(r.amount)}
            </span>
            <span className="text-muted-foreground">{statusLabels[r.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
