CREATE TYPE public.app_role AS ENUM ('doctor','commission','patient','admin');
CREATE TYPE public.case_status AS ENUM ('unreviewed','reviewing','approved','rejected','reappeal');
CREATE TYPE public.med_form AS ENUM ('syrup','tablet','ampoule','suppository');
CREATE TYPE public.wallet_tx_type AS ENUM ('deposit','withdraw');
CREATE TYPE public.wallet_tx_status AS ENUM ('pending','done','failed');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('doctor','commission','admin'))
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  province text,
  city text,
  address text,
  specialty text,
  medical_code text,
  commission_title text,
  national_id text,
  birth_cert_no text,
  birth_date text,
  father_name text,
  issued_from text,
  insurance_name text,
  card_number text,
  sheba text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name',''), COALESCE(NEW.raw_user_meta_data->>'last_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'patient'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  national_id text,
  phone text,
  province text,
  city text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guardian own" ON public.guardians FOR ALL TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (patient_id = auth.uid());

CREATE SEQUENCE public.case_number_seq START 1001;
CREATE TABLE public.commission_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number bigint NOT NULL DEFAULT nextval('public.case_number_seq'),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disease_name text,
  insurance_name text,
  doctor_prescription_url text,
  needs_doctor_prescription boolean NOT NULL DEFAULT false,
  status public.case_status NOT NULL DEFAULT 'unreviewed',
  documents_finalized boolean NOT NULL DEFAULT false,
  paid boolean NOT NULL DEFAULT false,
  fee_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.commission_cases TO authenticated;
GRANT ALL ON public.commission_cases TO service_role;
ALTER TABLE public.commission_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases select" ON public.commission_cases FOR SELECT TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "cases insert" ON public.commission_cases FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "cases update" ON public.commission_cases FOR UPDATE TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (patient_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER cases_updated BEFORE UPDATE ON public.commission_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.commission_cases(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_documents TO authenticated;
GRANT ALL ON public.case_documents TO service_role;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs select" ON public.case_documents FOR SELECT TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "docs write" ON public.case_documents FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "docs delete" ON public.case_documents FOR DELETE TO authenticated USING (patient_id = auth.uid());

CREATE TABLE public.commission_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.commission_cases(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved boolean NOT NULL,
  medication_name text,
  medication_form public.med_form,
  daily_dose numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, member_id)
);
GRANT SELECT, INSERT, UPDATE ON public.commission_votes TO authenticated;
GRANT ALL ON public.commission_votes TO service_role;
ALTER TABLE public.commission_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes select" ON public.commission_votes FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.commission_cases c WHERE c.id = case_id AND c.patient_id = auth.uid())
);
CREATE POLICY "votes insert" ON public.commission_votes FOR INSERT TO authenticated WITH CHECK (member_id = auth.uid() AND public.has_role(auth.uid(),'commission'));
CREATE POLICY "votes update" ON public.commission_votes FOR UPDATE TO authenticated USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE TRIGGER votes_updated BEFORE UPDATE ON public.commission_votes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.commission_cases(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disease_name text NOT NULL,
  medication_name text NOT NULL,
  medication_form public.med_form NOT NULL,
  daily_dose numeric NOT NULL,
  unit_volume numeric,
  dispensing_interval_days integer,
  reduction_percent numeric,
  reduction_interval_months integer,
  issue_date_jalali text,
  signature_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rx select" ON public.prescriptions FOR SELECT TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "rx insert" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (doctor_id = auth.uid() AND (public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'commission')));
CREATE POLICY "rx update" ON public.prescriptions FOR UPDATE TO authenticated USING (doctor_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (doctor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER rx_updated BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.case_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.commission_cases(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.case_appeals TO authenticated;
GRANT ALL ON public.case_appeals TO service_role;
ALTER TABLE public.case_appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appeals select" ON public.case_appeals FOR SELECT TO authenticated USING (patient_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "appeals insert" ON public.case_appeals FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.wallet_tx_type NOT NULL,
  amount integer NOT NULL,
  status public.wallet_tx_status NOT NULL DEFAULT 'pending',
  description text,
  card_number text,
  sheba text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet select" ON public.wallet_transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "wallet insert" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "docs owner read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'medical-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid()))
);
CREATE POLICY "docs owner write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'medical-docs' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "docs owner delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'medical-docs' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "avatars read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars owner write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "avatars owner update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);