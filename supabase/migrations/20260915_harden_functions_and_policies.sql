-- Idempotent Migration: Harden functions and policies
-- Target: PostgreSQL via Supabase

CREATE OR REPLACE FUNCTION prevent_status_history_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Status history events are append-only and cannot be altered or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
DECLARE
  u_role user_role;
BEGIN
  SELECT role INTO u_role FROM public.users WHERE id = auth.uid();
  RETURN u_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'Citizen',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Prevent citizen self-promotion to Admin/Authority
CREATE OR REPLACE FUNCTION prevent_user_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND COALESCE(public.get_current_role(), 'Citizen') != 'Admin' THEN
    RAISE EXCEPTION 'Users cannot alter their assigned system role.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_user_role_change ON public.users;
CREATE TRIGGER trg_prevent_user_role_change
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION prevent_user_role_change();

-- Realtime Publication Setup
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.complaint_status_events REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'complaint_status_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_status_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
