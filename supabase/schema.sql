-- ============================================================================
-- AQUAGUARD DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target DB: PostgreSQL via Supabase
-- Description: Complete production schema, state machine rules, triggers, seed data, and hardened RLS.
-- ============================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Citizen', 'Authority', 'Field Officer', 'Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_approval');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE officer_status AS ENUM ('available', 'on_field', 'off_duty');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES DEFINITION

-- 2.1 USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'Citizen',
  account_status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 AUTHORITIES
CREATE TABLE IF NOT EXISTS public.authorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  jurisdiction_area TEXT NOT NULL,
  contact_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 OFFICERS
CREATE TABLE IF NOT EXISTS public.officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES public.authorities(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  status officer_status NOT NULL DEFAULT 'available',
  current_workload INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_code TEXT NOT NULL UNIQUE,
  citizen_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  description TEXT NOT NULL,
  severity complaint_severity NOT NULL DEFAULT 'Medium',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Metropolis',
  state TEXT NOT NULL DEFAULT 'State Water Board',
  pincode TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'Submitted',
  authority_id UUID REFERENCES public.authorities(id),
  assigned_officer_id UUID REFERENCES public.officers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 EVIDENCE
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 COMPLAINT STATUS EVENTS (APPEND-ONLY HISTORY TABLE)
CREATE TABLE IF NOT EXISTS public.complaint_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status complaint_status NOT NULL,
  note TEXT,
  updated_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Protect APPEND-ONLY integrity: Prevent UPDATE or DELETE on status history
CREATE OR REPLACE FUNCTION prevent_status_history_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Status history events are append-only and cannot be altered or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_status_history_update ON public.complaint_status_events;
CREATE TRIGGER trg_prevent_status_history_update
BEFORE UPDATE OR DELETE ON public.complaint_status_events
FOR EACH ROW EXECUTE FUNCTION prevent_status_history_tampering();

-- 2.8 ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2.9 NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id),
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_internal BOOLEAN NOT NULL DEFAULT false
);

-- 2.10 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'status_update',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STATE MACHINE TRANSITION & AUDIT TRIGGER
CREATE OR REPLACE FUNCTION log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.complaint_status_events (complaint_id, status, note, updated_by)
    VALUES (NEW.id, NEW.status, 'Complaint reported by citizen.', NEW.citizen_id);
  ELSIF (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Enforce state machine transition rules
    IF OLD.status = 'Submitted' AND NEW.status NOT IN ('Acknowledged', 'Assigned') THEN
      RAISE EXCEPTION 'Submitted complaints can only transition to Acknowledged or Assigned.';
    ELSIF OLD.status = 'Acknowledged' AND NEW.status NOT IN ('Assigned') THEN
      RAISE EXCEPTION 'Acknowledged complaints must be Assigned next.';
    ELSIF OLD.status = 'Assigned' AND NEW.status NOT IN ('In Progress') THEN
      RAISE EXCEPTION 'Assigned complaints must transition to In Progress.';
    ELSIF OLD.status = 'In Progress' AND NEW.status NOT IN ('Resolved') THEN
      RAISE EXCEPTION 'In Progress complaints must transition to Resolved.';
    ELSIF OLD.status = 'Resolved' AND NEW.status NOT IN ('Closed') THEN
      RAISE EXCEPTION 'Resolved complaints can only transition to Closed.';
    ELSIF OLD.status = 'Closed' THEN
      RAISE EXCEPTION 'Closed complaints cannot change status.';
    END IF;

    -- Log append-only audit event
    INSERT INTO public.complaint_status_events (complaint_id, status, note, updated_by)
    VALUES (NEW.id, NEW.status, 'Status transitioned from ' || OLD.status || ' to ' || NEW.status, auth.uid());
    
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_log_complaint_status ON public.complaints;
DROP TRIGGER IF EXISTS trg_log_complaint_insert ON public.complaints;
CREATE TRIGGER trg_log_complaint_insert
AFTER INSERT ON public.complaints
FOR EACH ROW EXECUTE FUNCTION log_complaint_status_change();

DROP TRIGGER IF EXISTS trg_log_complaint_update ON public.complaints;
CREATE TRIGGER trg_log_complaint_update
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION log_complaint_status_change();

-- 4. AUTOMATIC NEW USER REGISTRATION TRIGGER (ROLE SECURITY BOUNDARY)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'Citizen', -- SECURITY MANDATE: Public registrations default strictly to Citizen
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. CATEGORIES SEED DATA
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Water Shortage', 'Complete lack of water supply or severe restriction in scheduled timing.', true),
  ('Pipeline Leakage', 'Main line or street pipe leakage causing major water wastage.', true),
  ('Contaminated Water', 'Discolored, smelly, or toxic water supply from municipal tap.', true),
  ('Low Water Pressure', 'Insufficient water flow preventing normal domestic usage.', true),
  ('Dry Borewell', 'Government community borewell dried up or pump failed.', true),
  ('Broken Pipeline', 'Physical burst or damaged infrastructure line.', true),
  ('Water Tank Overflow', 'Public storage overhead tank overflowing continuously.', true),
  ('Illegal Water Usage', 'Unauthorized commercial tap or main line bypass detected.', true),
  ('Other', 'General water infrastructure issues not covered above.', true)
ON CONFLICT (name) DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES — PRODUCTION HARDENED & STRICTLY SCOPED

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role safely without RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
DECLARE
  u_role user_role;
BEGIN
  SELECT role INTO u_role FROM public.users WHERE id = auth.uid();
  RETURN u_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 6.1 USERS RLS
DROP POLICY IF EXISTS "Users can view own profile or Admins view all" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record on registration" ON public.users;

CREATE POLICY "Users can view own profile or Admins view all"
  ON public.users FOR SELECT
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('Admin', 'Authority')
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own record on registration"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'Citizen');

-- 6.2 OFFICERS RLS
DROP POLICY IF EXISTS "Officers readable by authenticated users" ON public.officers;
CREATE POLICY "Officers readable by authenticated users"
  ON public.officers FOR SELECT
  USING (auth.role() = 'authenticated');

-- 6.3 CATEGORIES RLS
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only Admins manage categories" ON public.categories;

CREATE POLICY "Categories are readable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only Admins manage categories"
  ON public.categories FOR ALL
  USING (public.get_current_role() = 'Admin');

-- 6.4 COMPLAINTS RLS
DROP POLICY IF EXISTS "Citizens view only their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Complaints select access by role" ON public.complaints;
DROP POLICY IF EXISTS "Citizens can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Authority and Officers can update permitted complaint states" ON public.complaints;

CREATE POLICY "Complaints select access by role"
  ON public.complaints FOR SELECT
  USING (
    (citizen_id = auth.uid()) OR
    (public.get_current_role() IN ('Authority', 'Admin')) OR
    (public.get_current_role() = 'Field Officer' AND assigned_officer_id IN (
      SELECT id FROM public.officers WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Citizens can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    citizen_id = auth.uid() AND
    public.get_current_role() = 'Citizen'
  );

CREATE POLICY "Authority and Officers can update permitted complaint states"
  ON public.complaints FOR UPDATE
  USING (
    public.get_current_role() IN ('Authority', 'Admin') OR
    (public.get_current_role() = 'Field Officer' AND assigned_officer_id IN (
      SELECT id FROM public.officers WHERE user_id = auth.uid()
    ))
  );

-- 6.5 EVIDENCE RLS
DROP POLICY IF EXISTS "Users can view evidence on authorized complaints" ON public.evidence;
DROP POLICY IF EXISTS "Evidence readable by authorized complaint viewers" ON public.evidence;
DROP POLICY IF EXISTS "Users can upload evidence for authorized complaints" ON public.evidence;

CREATE POLICY "Evidence readable by authorized complaint viewers"
  ON public.evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = evidence.complaint_id
      AND (
        (c.citizen_id = auth.uid()) OR
        (public.get_current_role() IN ('Authority', 'Admin', 'Field Officer'))
      )
    )
  );

CREATE POLICY "Users can upload evidence for authorized complaints"
  ON public.evidence FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = evidence.complaint_id
      AND (
        c.citizen_id = auth.uid() OR
        public.get_current_role() IN ('Authority', 'Admin', 'Field Officer')
      )
    )
  );

-- 6.6 COMPLAINT STATUS EVENTS RLS (APPEND-ONLY HISTORY AUDIT)
DROP POLICY IF EXISTS "Status events viewable by authorized complaint viewers" ON public.complaint_status_events;
DROP POLICY IF EXISTS "Status events insertable by logged in users" ON public.complaint_status_events;
DROP POLICY IF EXISTS "Status events insertable during complaint workflow" ON public.complaint_status_events;

CREATE POLICY "Status events viewable by authorized complaint viewers"
  ON public.complaint_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_status_events.complaint_id
      AND (
        (c.citizen_id = auth.uid()) OR
        (public.get_current_role() IN ('Authority', 'Admin', 'Field Officer'))
      )
    )
  );

CREATE POLICY "Status events insertable during complaint workflow"
  ON public.complaint_status_events FOR INSERT
  WITH CHECK (
    updated_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_status_events.complaint_id
      AND (
        c.citizen_id = auth.uid() OR
        public.get_current_role() IN ('Authority', 'Admin', 'Field Officer')
      )
    )
  );

-- 6.7 ASSIGNMENTS RLS
DROP POLICY IF EXISTS "Assignments viewable by authenticated users" ON public.assignments;
DROP POLICY IF EXISTS "Authorities manage assignments" ON public.assignments;

CREATE POLICY "Assignments viewable by authenticated users"
  ON public.assignments FOR SELECT
  USING (
    public.get_current_role() IN ('Authority', 'Admin') OR
    officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
  );

CREATE POLICY "Authorities manage assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    assigned_by = auth.uid() AND
    public.get_current_role() IN ('Authority', 'Admin')
  );

-- 6.8 NOTES RLS
DROP POLICY IF EXISTS "Citizens view non-internal notes on their complaints" ON public.notes;
DROP POLICY IF EXISTS "Notes viewable by authorized role" ON public.notes;
DROP POLICY IF EXISTS "Authorized personnel can add notes" ON public.notes;

CREATE POLICY "Notes viewable by authorized role"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = notes.complaint_id
      AND (
        (c.citizen_id = auth.uid() AND is_internal = false) OR
        (public.get_current_role() IN ('Authority', 'Admin', 'Field Officer'))
      )
    )
  );

CREATE POLICY "Authorized personnel can add notes"
  ON public.notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND (
      public.get_current_role() IN ('Authority', 'Admin', 'Field Officer') OR
      (public.get_current_role() = 'Citizen' AND is_internal = false AND EXISTS (
        SELECT 1 FROM public.complaints c
        WHERE c.id = notes.complaint_id AND c.citizen_id = auth.uid()
      ))
    )
  );

-- 6.9 NOTIFICATIONS RLS
DROP POLICY IF EXISTS "Users view only their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users view only their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    public.get_current_role() IN ('Authority', 'Admin', 'Field Officer')
  );

-- 7. STORAGE BUCKET POLICIES FOR 'evidence' BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Evidence storage select for authenticated users" ON storage.objects;
CREATE POLICY "Evidence storage select for authenticated users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evidence' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Evidence storage upload for authenticated users" ON storage.objects;
CREATE POLICY "Evidence storage upload for authenticated users"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidence' AND auth.role() = 'authenticated');
