import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth, AppRole, roleLabels } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Stethoscope, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AppRole>('patient');

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error('ورود ناموفق: ' + error.message);
    navigate('/dashboard', { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { first_name: firstName, last_name: lastName, role },
      },
    });
    setBusy(false);
    if (error) return toast.error('ثبت‌نام ناموفق: ' + error.message);
    toast.success('ثبت‌نام انجام شد. اکنون وارد شوید.');
    navigate('/dashboard', { replace: true });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error('ورود با گوگل ناموفق بود');
    if (result.redirected) return;
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">سامانه کمیسیون دارویی</h1>
            <p className="text-sm text-muted-foreground">معاونت غذا و دارو</p>
          </div>
        </div>

        <Tabs defaultValue="signin" dir="rtl">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signin">ورود</TabsTrigger>
            <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                <LogIn className="w-4 h-4 ml-2" /> ورود به سامانه
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">نام</Label>
                  <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">نام خانوادگی</Label>
                  <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                همه حساب‌های جدید با نقش «بیمار» ایجاد می‌شوند. ارتقای نقش به پزشک، عضو کمیسیون یا مدیر فقط توسط مدیر سامانه انجام می‌شود.
              </p>

              <div className="space-y-2">
                <Label htmlFor="email2">ایمیل</Label>
                <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">رمز عبور</Label>
                <Input id="password2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                <UserPlus className="w-4 h-4 ml-2" /> ایجاد حساب کاربری
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6 text-center">
          <span className="bg-card px-3 text-xs text-muted-foreground relative z-10">یا</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          ورود با حساب گوگل
        </Button>
      </div>
    </div>
  );
}
