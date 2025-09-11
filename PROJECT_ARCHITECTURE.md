## BGHS Alumni Website — Project Architecture

### Backend Runtime
- Next.js 14 (App Router) in a single Node process
- API endpoints implemented as route handlers under `app/api/**`

### Data Layer
- Supabase (Postgres + Auth + Storage)
- Key tables: `profiles`, `events`, `password_reset_otps`, gallery-related tables
- RLS enabled; service-role key used for admin flows

### Auth and Verification
- Supabase Auth manages users
- OTP Flows
  - Send OTP: `app/api/auth/forgot-password`, `app/api/auth/send-otp`
  - Verify OTP: `app/api/auth/verify-otp`
  - Helpers: `lib/otp-utils.ts`, `lib/email-service.ts`, `lib/sms-service.ts`
- Registration
  - API: `app/api/auth/register`
  - UI: `app/register/page.tsx` (email/phone verify before submit)

### UI Layer (App Router)
- End-user pages: `app/login`, `app/register`, `app/forgot-password`, `app/events/**`, `app/gallery/**`, `app/profile`
- Admin dashboards: `app/admin/**` (users, events)
- TailwindCSS via `app/globals.css` with utility classes: `btn-primary`, `input-field`, `card`

### Media & Storage
- Gallery and thumbnails served through `app/api/gallery` and `app/api/thumbnails/[filename]`
- Integrations: R2/OneDrive helpers in `lib/r2-storage.ts`, `lib/onedrive-*.ts`

### Utilities
- `lib/supabase.ts`: client factory (browser/server)
- `lib/auth-utils.ts`: roles/permissions
- `lib/email-service.ts` (SendGrid-ready) and `lib/sms-service.ts` (Twilio-ready; logs in dev)
- `lib/onedrive-api.ts`, `lib/onedrive-simple.ts`: OneDrive flows

### Admin APIs
- `app/api/admin/users`: list/create/update/delete profiles (service role)
- `app/api/admin/reset-password`: force-reset by admin

### Scripts & SQL
- `scripts/**`: setup and test scripts (OneDrive, R2, gallery tests)
- SQL: `create-password-reset-table.sql`, `add-education-fields.sql`, `supabase-schema.sql`, etc.

### Configuration
- `.env.local` for Supabase/SendGrid/Twilio/OneDrive/R2
- `next.config.js`, `tsconfig.json`, Tailwind config in `tailwind.config.js`

### Build & Run
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start` (serves pages and API routes)


