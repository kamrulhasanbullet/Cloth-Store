/*
  Bootstrap an admin account after creating it through Supabase Auth.

  1. Sign up or create the admin user with email/password in Supabase Auth.
  2. Replace the email below.
  3. Run this SQL once in the Supabase SQL editor.

  Public app registration must stay customer-only. Do not add admin signup
  to the public site.
*/

UPDATE public.profiles
SET
  role = 'admin',
  is_active = true,
  updated_at = now()
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@example.com'
);

SELECT id, full_name, role, is_active
FROM public.profiles
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@example.com'
);
