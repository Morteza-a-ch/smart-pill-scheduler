import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, roleLabels, AppRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Stethoscope, LayoutDashboard, User, Wallet, FolderOpen, FileText,
  Users, LogOut, Calculator, Gavel, ClipboardList,
} from 'lucide-react';

interface NavItem { to: string; label: string; icon: typeof User; roles: AppRole[] }

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'میزکار', icon: LayoutDashboard, roles: ['patient', 'doctor', 'commission', 'admin'] },
  { to: '/profile', label: 'پروفایل من', icon: User, roles: ['patient', 'doctor', 'commission', 'admin'] },
  { to: '/my-case', label: 'پرونده کمیسیون من', icon: FolderOpen, roles: ['patient'] },
  { to: '/my-prescriptions', label: 'نسخه‌های من', icon: FileText, roles: ['patient'] },
  { to: '/cases', label: 'پرونده‌های کمیسیون', icon: ClipboardList, roles: ['commission', 'admin'] },
  { to: '/patients', label: 'بیماران و نسخه‌نویسی', icon: Users, roles: ['doctor', 'commission', 'admin'] },
  { to: '/prescriptions', label: 'نسخه‌های صادرشده', icon: FileText, roles: ['doctor', 'commission', 'admin'] },
  { to: '/tools', label: 'ماشین‌حساب تجویز', icon: Calculator, roles: ['doctor', 'commission', 'admin'] },
  { to: '/wallet', label: 'کیف پول', icon: Wallet, roles: ['patient', 'doctor', 'commission', 'admin'] },
  { to: '/admin/users', label: 'مدیریت کاربران', icon: Gavel, roles: ['admin'] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const items = navItems.filter((i) => role && i.roles.includes(role));
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="header-gradient text-primary-foreground py-4 px-4">
        <div className="container max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">سامانه کمیسیون دارویی</h1>
              <p className="text-primary-foreground/80 text-xs">معاونت غذا و دارو</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">{fullName || 'کاربر'}</p>
              <p className="text-xs text-primary-foreground/80">{role ? roleLabels[role] : ''}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
            >
              <LogOut className="w-4 h-4 ml-1" /> خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <nav className="lg:sticky lg:top-6 h-fit">
          <ul className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {items.map((item) => (
              <li key={item.to} className="shrink-0 lg:w-full">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
