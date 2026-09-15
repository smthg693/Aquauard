# 🌊 AquaGuard — Municipal Water Governance & Incident Response Platform

AquaGuard is an end-to-end, enterprise-grade civic-tech platform designed to monitor municipal water infrastructure, streamline water contamination and leakage reporting, and coordinate real-time incident resolution between citizens, municipal water authorities, and field crews.

---

## 🎯 Use Cases & Problem Statement

Urban water distribution systems face critical challenges:
- **Non-Revenue Water (NRW) Losses**: Undetected pipe fractures waste millions of liters of treated drinking water.
- **Delayed Incident Response**: Fragmented reporting delays emergency valve shutoffs during major main breaks.
- **Lack of Transparency**: Citizens lack visibility into repair progress, causing repeated calls and distrust.
- **Inefficient Field Allocation**: Municipal authorities struggle to prioritize field crews based on severity and geographical proximity.

**AquaGuard resolves these challenges through a unified digital platform:**
- **Citizens** report issues instantly with photos, exact GPS coordinates, and address details.
- **Water Authorities** monitor city-wide incidents on an interactive GIS map, assign field officers, and track SLA resolution metrics.
- **Field Crews** receive real-time repair work orders, inspect on-site damage, and submit completion evidence.
- **System Admins** maintain role-based governance, ward jurisdictions, and system categorization.

---

## ✨ Key Features by Role

### 👤 1. Citizen Portal (`/citizen`)
- **Geo-located Reporting**: Submit water leaks, contamination alerts, low pressure, or billing disputes with auto-detected GPS coordinates.
- **Photo Evidence Upload**: Attach photos directly to complaints via secure cloud storage.
- **Live Lifecycle Tracking**: Track complaint progress through real-time state machine milestones (*Submitted* ➔ *Acknowledged* ➔ *Assigned* ➔ *In Progress* ➔ *Resolved* ➔ *Closed*).
- **Personal Incident History**: Review past reported incidents and ward notices.

### 🏢 2. Water Board Authority Control Room (`/authority`)
- **Command Center Dashboard**: Filter and manage complaints by status, priority, and ward jurisdiction.
- **Interactive GIS Incident Map**: Visual map powered by Leaflet displaying real-time incident clusters and severity heatmaps.
- **Officer Dispatch & Assignment**: Dynamically assign field officers based on ward jurisdiction and workload.
- **Analytics & SLA Metrics**: Track mean time to resolution (MTTR), ward performance, and issue categorization trends.

### 👷 3. Field Officer Portal (`/field-officer`)
- **Mobile-Optimized Inspection Portal**: Ground crews review assigned work orders with emergency contact details and navigation points.
- **Status Updates**: Progress work orders from *Assigned* to *In Progress* and *Resolved*.
- **Resolution Verification**: Upload post-repair photo evidence directly from the field.

### ⚙️ 4. System Administration (`/admin`)
- **User & RBAC Governance**: Manage system users and role permissions (`Citizen`, `Authority`, `Field Officer`, `Admin`).
- **Authority Wards**: Configure municipal water board jurisdictions, zones, and escalation contacts.
- **Officer Directory**: Manage field crew credentials, badge numbers, and department allocations.
- **Incident Taxonomy**: Configure complaint categories, priority tiers, and SLA response targets.

---

## 🛡️ Security & Database Architecture

AquaGuard is built with a **Default DENY** security model enforced natively inside PostgreSQL:

- **PostgreSQL Row-Level Security (RLS)**: Strict RLS policies on all 10 public tables guarantee data isolation across citizens and officers.
- **Non-Recursive Role Resolution**: Uses `SECURITY DEFINER` function `public.get_current_role()` with restricted `search_path` to evaluate permissions safely.
- **State Machine Transition Guard**: Database trigger `trg_log_complaint_update` prevents illegal status jumps (e.g., `Submitted` ➔ `Closed`).
- **Append-Only Audit Log**: `public.complaint_status_events` enforces immutable status history via trigger `trg_prevent_status_history_update`.
- **Privilege Escalation Protection**: Trigger `trg_prevent_user_role_change` prevents users from altering their assigned database roles.
- **Storage Security**: Folder-based storage policies restrict evidence uploads to authorized complaint owners.
- **Realtime Streaming**: PostgreSQL WAL (Write-Ahead Log) events streamed securely over WebSockets via Supabase Realtime.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **UI & Styling** | Custom Design System, Tailwind CSS, Lucide Icons |
| **GIS & Mapping** | Leaflet, OpenStreetMap GIS Engine |
| **Database & Auth** | Supabase PostgreSQL 15, Supabase Auth |
| **Storage & Realtime** | Supabase Storage (S3-compatible), Supabase Realtime (WebSockets) |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/smthg693/Aquauard.git
cd Aquauard
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://cokysnnrutydayommrvu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_NVjNAwjnP6ovWTXQ-uHB4Q_8g2YaN2P
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-Configured Test Credentials

| Role | Email Login | Password | Default Redirect Route |
| :--- | :--- | :--- | :--- |
| 🏢 **Water Authority** | `authority@aquaguard.org` | `AquaGuard2026!` | `/authority/dashboard` |
| ⚙️ **System Admin** | `admin@aquaguard.org` | `AquaGuard2026!` | `/admin/dashboard` |
| 👷 **Field Officer** | `officer@aquaguard.org` | `AquaGuard2026!` | `/field-officer/dashboard` |
| 👤 **Citizen Account** | *Register on site* | *User password* | `/citizen/dashboard` |

---

## 📜 Database Migrations

Database schema and security migration files are located in `supabase/`:
- `supabase/schema.sql`: Core schema, 10 tables, triggers, and base RLS policies.
- `supabase/migrations/20260915_harden_functions_and_policies.sql`: Production hardened triggers, non-recursive policies, storage RLS, and realtime publications.
