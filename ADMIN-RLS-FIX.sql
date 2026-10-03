-- ROW Management System: Admin + Bangladesh time RLS fix
-- Supabase project: zagnttuftlkdrhyrwabx

-- 1) Public read permissions
GRANT SELECT ON public.offices TO anon, authenticated;
GRANT SELECT ON public.daily_row_work TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.offices_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.daily_row_work_id_seq TO anon, authenticated;

-- 2) Ensure RLS is enabled
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_row_work ENABLE ROW LEVEL SECURITY;

-- 3) Remove old/conflicting policies
DROP POLICY IF EXISTS "Public can read offices" ON public.offices;
DROP POLICY IF EXISTS "Admin can insert offices" ON public.offices;
DROP POLICY IF EXISTS "Admin can update offices" ON public.offices;
DROP POLICY IF EXISTS "Public can read daily row work" ON public.daily_row_work;
DROP POLICY IF EXISTS "Public can insert today's row work" ON public.daily_row_work;
DROP POLICY IF EXISTS "Public can update today's row work" ON public.daily_row_work;
DROP POLICY IF EXISTS "Admin can update any row work" ON public.daily_row_work;
DROP POLICY IF EXISTS "Admin can insert any row work" ON public.daily_row_work;

-- 4) Public read
CREATE POLICY "ROW public read offices"
ON public.offices FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "ROW public read daily"
ON public.daily_row_work FOR SELECT TO anon, authenticated
USING (true);

-- 5) Normal users can insert/update ONLY Bangladesh today
CREATE POLICY "ROW public insert today"
ON public.daily_row_work FOR INSERT TO anon, authenticated
WITH CHECK (
  work_date = ((now() AT TIME ZONE 'Asia/Dhaka')::date)
);

CREATE POLICY "ROW public update today"
ON public.daily_row_work FOR UPDATE TO anon, authenticated
USING (
  work_date = ((now() AT TIME ZONE 'Asia/Dhaka')::date)
)
WITH CHECK (
  work_date = ((now() AT TIME ZONE 'Asia/Dhaka')::date)
);

-- 6) Admin: exact user UUID + admin role/email fallback
CREATE POLICY "ROW admin insert offices"
ON public.offices FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
);

CREATE POLICY "ROW admin update offices"
ON public.offices FOR UPDATE TO authenticated
USING (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
)
WITH CHECK (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
);

CREATE POLICY "ROW admin insert daily"
ON public.daily_row_work FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
);

CREATE POLICY "ROW admin update daily"
ON public.daily_row_work FOR UPDATE TO authenticated
USING (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
)
WITH CHECK (
  auth.uid() = '4be17fa6-a067-43f1-98c5-d62862bbbf1c'::uuid
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() ->> 'email') = 'parvezhossain89@gmail.com'
);

NOTIFY pgrst, 'reload schema';

-- Optional diagnostic: duplicate office names should return zero rows.
SELECT office_name, COUNT(*) AS duplicate_count
FROM public.offices
GROUP BY office_name
HAVING COUNT(*) > 1;
