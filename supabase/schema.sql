-- ============================================================================
-- AQUAGUARD DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target DB: PostgreSQL via Supabase
-- Description: Complete production schema, state machine rules, triggers, seed data, and RLS.
-- ============================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('Citizen', 'Authority', 'Field Officer', 'Admin');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_approval');
CREATE TYPE complaint_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE complaint_status AS ENUM ('Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed');
CREATE TYPE officer_status AS ENUM ('available', 'on_field', 'off_duty');

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_complaint_status ON public.complaints;
CREATE TRIGGER trg_log_complaint_status
AFTER INSERT OR BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION log_complaint_status_change();

-- 4. CATEGORIES SEED DATA
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

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

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

-- Helper function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5.1 USERS RLS
CREATE POLICY "Users can view own profile or Admins view all"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.get_current_role() IN ('Admin', 'Authority'));

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- 5.2 CATEGORIES RLS
CREATE POLICY "Categories are readable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only Admins manage categories"
  ON public.categories FOR ALL
  USING (public.get_current_role() = 'Admin');

-- 5.3 COMPLAINTS RLS
CREATE POLICY "Citizens view only their own complaints"
  ON public.complaints FOR SELECT
  USING (
    (public.get_current_role() = 'Citizen' AND citizen_id = auth.uid()) OR
    (public.get_current_role() IN ('Authority', 'Admin')) OR
    (public.get_current_role() = 'Field Officer' AND assigned_officer_id IN (
      SELECT id FROM public.officers WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Citizens can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (public.get_current_role() = 'Citizen' AND citizen_id = auth.uid());

CREATE POLICY "Authority and Officers can update permitted complaint states"
  ON public.complaints FOR UPDATE
  USING (
    public.get_current_role() IN ('Authority', 'Admin') OR
    (public.get_current_role() = 'Field Officer' AND assigned_officer_id IN (
      SELECT id FROM public.officers WHERE user_id = auth.uid()
    ))
  );

-- 5.4 COMPLAINT STATUS EVENTS RLS
CREATE POLICY "Status events viewable by authorized complaint viewers"
  ON public.complaint_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_status_events.complaint_id
      AND (
        (public.get_current_role() = 'Citizen' AND c.citizen_id = auth.uid()) OR
        (public.get_current_role() IN ('Authority', 'Admin')) OR
        (public.get_current_role() = 'Field Officer')
      )
    )
  );

-- 5.5 NOTES RLS
CREATE POLICY "Citizens view non-internal notes on their complaints"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = notes.complaint_id
      AND (
        (public.get_current_role() = 'Citizen' AND c.citizen_id = auth.uid() AND is_internal = false) OR
        (public.get_current_role() IN ('Authority', 'Admin', 'Field Officer'))
      )
    )
  );

CREATE POLICY "Authorized personnel can add notes"
  ON public.notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND (
      public.get_current_role() IN ('Authority', 'Admin', 'Field Officer') OR
      (public.get_current_role() = 'Citizen' AND is_internal = false)
    )
  );

-- 5.6 NOTIFICATIONS RLS
CREATE POLICY "Users view only their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());
