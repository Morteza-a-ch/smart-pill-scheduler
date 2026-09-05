UPDATE public.case_documents d
SET file_path = CASE WHEN d.title = 'گزارش MRI'
  THEN '6b99c3ef-be76-452b-a203-93efecd39842/demo-1.pdf'
  ELSE '6b99c3ef-be76-452b-a203-93efecd39842/demo-2.pdf' END
WHERE d.patient_id = '6b99c3ef-be76-452b-a203-93efecd39842';

UPDATE public.commission_cases
SET doctor_prescription_url = '6b99c3ef-be76-452b-a203-93efecd39842/demo-rx.pdf',
    needs_doctor_prescription = true
WHERE patient_id = '6b99c3ef-be76-452b-a203-93efecd39842';