import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, roleLabels } from '@/hooks/useAuth';
import { caseStatusLabels, caseStatusClasses, CaseStatus, formatToman } from '@/lib/medical';
import { FolderOpen, FileText, Users, Wallet } from 'lucide-react';

interface Stats {
  cases: number;
  prescriptions: number;
  wallet: number;
  myStatus?: CaseStatus | null;
}

export default function Dashboard() {
  const { profile, role, user } = useAuth();
  const [stats, setStats] = useState<Stats>({ cases: 0, prescriptions: 0, wallet: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [cases, rx, tx] = await Promise.all([
        supabase.from('commission_cases').select('id,status,patient_id'),
        supabase.from('prescriptions').select('id'),
        supabase.from('wallet_transactions').select('amount,type,status').eq('user_id', user.id),
      ]);
      const balance = (tx.data ?? [])
        .filter((t) => t.status === 'done')
        .reduce((s, t) => s + (t.type === 'deposit' ? t.amount : -t.amount), 0);
      const mine = (cases.data ?? []).find((c) => c.patient_id === user.id);
      setStats({
        cases: cases.data?.length ?? 0,
        prescriptions: rx.data?.length ?? 0,
        wallet: balance,
        myStatus: (mine?.status as CaseStatus) ?? null,
      });
    })();
  }, [user]);

  const cards = [
    { to: '/my-case', label: 'پرونده کمیسیون', value: stats.cases, icon: FolderOpen, show: true },
    { to: '/prescriptions', label: 'نسخه‌ها', value: stats.prescriptions, icon: FileText, show: true },
    { to: '/patients', label: 'بیماران', value: stats.cases, icon: Users, show: role !== 'patient' },
    { to: '/wallet', label: 'موجودی کیف پول (ریال)', value: stats.wallet, icon: Wallet, show: true, money: true },
  ].filter((c) => c.show);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold mb-1">
          {profile ? `${profile.first_name} ${profile.last_name}` : 'کاربر'} عزیز، خوش آمدید
        </h2>
        <p className="text-muted-foreground text-sm">
          نقش شما در سامانه: {role ? roleLabels[role] : '—'}
        </p>
        {role === 'patient' && (
          <div className="mt-4">
            {stats.myStatus ? (
              <span className={`inline-block px-3 py-1 rounded-lg border text-sm ${caseStatusClasses[stats.myStatus]}`}>
                وضعیت پرونده: {caseStatusLabels[stats.myStatus]}
              </span>
            ) : (
              <Link to="/my-case" className="text-primary text-sm underline">
                هنوز پرونده‌ای تشکیل نداده‌اید — تشکیل پرونده کمیسیون
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="bg-card rounded-2xl shadow-card p-5 hover:shadow-lg transition-shadow">
            <c.icon className="w-6 h-6 text-primary mb-3" />
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-bold mt-1">
              {c.money ? formatToman(c.value) : c.value.toLocaleString('fa-IR')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
