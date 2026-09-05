-- roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'm.abdollahi1378@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'doctor'::app_role FROM auth.users WHERE email = 'doctor@demo.ir'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'commission'::app_role FROM auth.users WHERE email = 'commission2@demo.ir'
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id AND u.email IN ('doctor@demo.ir','commission2@demo.ir') AND ur.role = 'patient';

-- profiles
UPDATE public.profiles p SET first_name='رضا', last_name='احمدی', phone='09121110001',
  province='تهران', city='تهران', specialty='داخلی', medical_code='125478'
FROM auth.users u WHERE u.id = p.id AND u.email = 'doctor@demo.ir';

UPDATE public.profiles p SET first_name='سارا', last_name='محمدی', phone='09121110002',
  province='تهران', city='تهران', specialty='عفونی', medical_code='198744', commission_title='عضو کمیسیون دارویی'
FROM auth.users u WHERE u.id = p.id AND u.email = 'commission2@demo.ir';

UPDATE public.profiles p SET first_name='علی', last_name='رضایی', phone='09121110003',
  province='تهران', city='ری', national_id='0012345678', insurance_name='تامین اجتماعی'
FROM auth.users u WHERE u.id = p.id AND u.email = 'patient@demo.ir';

-- sample case for demo patient
WITH pat AS (SELECT id FROM auth.users WHERE email = 'patient@demo.ir'),
com AS (SELECT id FROM auth.users WHERE email = 'commission2@demo.ir'),
c AS (
  INSERT INTO public.commission_cases
    (patient_id, disease_name, insurance_name, status, documents_finalized, paid, fee_amount)
  SELECT pat.id, 'ام‌اس (MS)', 'تامین اجتماعی', 'approved', true, true, 2000000 FROM pat
  RETURNING id, patient_id
)
INSERT INTO public.case_documents (case_id, patient_id, title, file_path)
SELECT c.id, c.patient_id, t.title, c.patient_id || '/demo-' || t.n || '.pdf'
FROM c, (VALUES ('گزارش MRI', 1), ('برگه آزمایش خون', 2)) AS t(title, n);

WITH c AS (
  SELECT cc.id FROM public.commission_cases cc
  JOIN auth.users u ON u.id = cc.patient_id
  WHERE u.email = 'patient@demo.ir' ORDER BY cc.created_at DESC LIMIT 1
), com AS (SELECT id FROM auth.users WHERE email = 'commission2@demo.ir')
INSERT INTO public.commission_votes (case_id, member_id, approved, medication_name, medication_form, daily_dose, notes)
SELECT c.id, com.id, true, 'اینترفرون بتا', 'ampoule'::med_form, 3, 'تایید با کاهش تدریجی دوز هر دو ماه ۱۰ درصد'
FROM c, com;