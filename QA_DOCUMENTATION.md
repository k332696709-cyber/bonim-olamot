# Bonim Olamot — Technical & Functional QA Documentation

> **Audience:** QA Engineers  
> **Last updated:** April 2026  
> **Status:** Active development  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Routes & Page Map](#3-routes--page-map)
4. [Core Feature Flows](#4-core-feature-flows)
   - 4.1 [Registration — Candidate (Male / Female)](#41-registration--candidate-male--female)
   - 4.2 [Registration — Matchmaker](#42-registration--matchmaker)
   - 4.3 [Matchmaker Hub (Dashboard)](#43-matchmaker-hub-dashboard)
   - 4.4 [Social Wall](#44-social-wall)
   - 4.5 [Date-Spot Finder](#45-date-spot-finder)
   - 4.6 [Notification Bell](#46-notification-bell)
   - 4.7 [Localization (i18n)](#47-localization-i18n)
5. [Critical Components](#5-critical-components)
6. [Data Models & Type Definitions](#6-data-models--type-definitions)
7. [API Endpoints](#7-api-endpoints)
8. [Auth & Session Management](#8-auth--session-management)
9. [Known Constraints & Special Logic](#9-known-constraints--special-logic)
10. [Testing Focus Areas & Test Matrix](#10-testing-focus-areas--test-matrix)

---

## 1. Project Overview

**Bonim Olamot** ("Building Worlds") is a professional Jewish matchmaking platform serving the Haredi community in Israel. The platform connects:

- **Candidates** (male / female) who register and submit detailed matchmaking profiles.
- **Matchmakers** (שדכנים/ות) who access a private hub to manage candidate profiles, lock profiles for 48-hour active work sessions, track match progress, and communicate via a social wall.

The application runs in two languages — **Hebrew (RTL, default)** and **English (LTR)** — with locale-aware routing at every level.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.29 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3.4.4 |
| Form handling | React Hook Form | ^7.52.1 |
| Validation | Zod | ^3.23.8 |
| i18n | next-intl | ^3.17.2 |
| PDF Export | @react-pdf/renderer | ^3.4.4 |
| AI Integration | @anthropic-ai/sdk (Claude Haiku) | ^0.90.0 |
| Date utilities | date-fns | ^3.6.0 |
| Class merging | tailwind-merge + clsx | ^2.4.0 / ^2.1.1 |

**Custom Tailwind theme:**
- `navy` — primary brand color (`#003366`, shades 50–900)
- `burgundy` — accent color (`#800020`, shades 50–900)
- Font families: `Heebo` (sans), `Frank Ruhl Libre` (serif)
- Custom shadows: `shadow-luxury`, `shadow-card`

**No external component library** — all UI components are hand-built.

---

## 3. Routes & Page Map

### Locale-prefixed routes (`/[locale]/`)

| Route | Page | Auth Required | Notes |
|---|---|---|---|
| `/he` or `/en` | Home | No | Candidate registration cards, donations preview, matchmaker corner |
| `/he/about` | About Us | No | Mission, values, process steps |
| `/he/terms` | Terms of Service | No | 4 sections + Matchmaker Code of Ethics |
| `/he/login` | Matchmaker Login | No | Session creation for matchmaker role |
| `/he/register/male` | Male Registration Form | No | Multi-step form with Zod validation |
| `/he/register/female` | Female Registration Form | No | Multi-step form with Zod validation |
| `/he/register/matchmaker` | Matchmaker Registration | No | 7 fields + sector multi-select |
| `/he/matchmaker` | Matchmaker Hub | **Yes** (matchmaker) | Dashboard, profiles table, social wall |
| `/he/matchmaker/profiles/[id]` | Profile Detail | **Yes** (matchmaker) | Read-only matchmaker view of a profile |
| `/he/personal` | Personal Area | No | Candidate's personal space |
| `/he/date-spots` | Date-Spot Finder | No | Filter, browse, view spot cards |
| `/he/donations` | Donations | No | Cause overview + payment form |
| `/he/contact` | Contact | No | Contact form (linked from Terms) |

> **Note:** All routes above apply equally with `/en/` prefix. Middleware auto-redirects `/` → `/he/`.

### API routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/summary` | `POST` | Generates AI bullet-point profile summary (Claude Haiku, falls back to structured) |
| `/api/export/profile/[id]` | `POST` | Renders and streams a candidate PDF (`?gender=male\|female`) |

---

## 4. Core Feature Flows

### 4.1 Registration — Candidate (Male / Female)

Both forms use **React Hook Form** with **Zod** and share the same multi-section layout. All validation error messages are in **Hebrew** regardless of locale.

#### Male Registration (`/register/male`)

**Zod schema:** `src/lib/validations/maleRegistration.ts`

| Field | Type | Validation Rule |
|---|---|---|
| `firstName` | string | min 2 chars |
| `lastName` | string | min 2 chars |
| `age` | number (coerced) | 18–120 |
| `hebrewBirthday` | string | min 3 chars |
| `status` | enum | `single \| divorced \| widowed` |
| `hasChildren` | boolean | Required if status is `divorced\|widowed` |
| `numberOfChildren` | number | Required (min 1) if `hasChildren === true` |
| `community` | string | min 1 char |
| `occupation` | string | min 1 char |
| `city` | string | min 1 char |
| `phone` | string | regex `^05\d{8}$` (Israeli mobile) |
| `email` | string | valid email format |
| `photos` | string[] | max 5 |
| `style` | enum | `yeshivish \| open_ish \| open \| modern \| very_modern` |
| `partnerStyle` | enum | `closed \| open \| open_ish \| modern \| very_modern` |
| `preferredStream` | string? | optional |
| `traits` | string[] | min 2, max 3 from 9 options |
| `relationshipValues` | string[] | min 2, max 3 from 9 options |
| `brings` | string[] | min 2, max 3 from 9 options |
| `doesntSuit` | string? | optional free text |
| `flexibility` | enum | `preferred \| important \| very_important \| not_important` |
| `clothing` | string[] | min 1, max 2 from male clothing options |
| `partnerClothing` | string[] | min 1, max 2 from partner clothing options |
| `phoneType` | enum | `kosher \| filtered \| smartphone \| work_smartphone` |
| `aboutMe` | string? | optional free text |
| `aboutPartner` | string? | optional free text |

**Conditional logic (`superRefine`):**
- If `status` is `divorced` or `widowed` → `hasChildren` must be explicitly set
- If `hasChildren === true` → `numberOfChildren` must be ≥ 1

**Form sections:**
1. `MalePersonalSection` — personal details
2. `PhotoUpload` — drag/click, max 5 images
3. `MaleStyleSection` — style preference + partner style
4. `MaleTraitsSection` — trait checkboxes (min 2, max 3)
5. `MaleValuesSection` — relationship values + brings + doesn't suit
6. **Payment form** — shown only when plan = `premium`

---

#### Female Registration (`/register/female`)

**Zod schema:** `src/lib/validations/femaleRegistration.ts`

Identical structure to Male with these differences:

| Field | Difference |
|---|---|
| `style` | enum starts with `shmura` (not `yeshivish`) |
| `partnerStyle` | enum starts with `shmur` |
| `clothing` | **single enum** (not array): 7 options from `very_simple` → `very_modern` |
| `headcovering` | **New field**: `wig_no_cut \| wig_with_cut \| wig_only \| wig_plus_cover \| kerchief_only \| no_preference` |
| `partnerClothing` | single enum: `only_bw \| bw_elegant \| colorful_weekday \| very_modern` |

---

### 4.2 Registration — Matchmaker

**Route:** `/register/matchmaker`  
**Schema:** Inline Zod object in `MatchmakerRegistrationForm.tsx`

| Field | Type | Validation Rule |
|---|---|---|
| `firstName` | string | min 2 |
| `lastName` | string | min 2 |
| `email` | string | valid email |
| `phone` | string | regex `^05\d{8}$` |
| `idNumber` | string | regex `^\d{9}$` (Israeli ID) |
| `yearsExperience` | number (coerced) | 0–80 |
| `sectors` | string[] | min 1 selected |

**Sector options (multi-select toggle):**

| Value | Hebrew | English |
|---|---|---|
| `hasidic` | חסידי | Hasidic |
| `litvish` | ליטאי | Litvish |
| `sephardic` | עדות המזרח | Sephardic |
| `first_marriage` | פרק א׳ | First Marriage |
| `second_marriage` | פרק ב׳ | Second Marriage |

**"Select All" toggle** — selects/deselects all 5 sectors at once.

---

### 4.3 Matchmaker Hub (Dashboard)

**Route:** `/matchmaker`  
**Auth:** Protected — redirects to `/login` if no session in `localStorage`.  
**Rendering:** Client component (`'use client'`).

#### Stats Bar (4 cards)

| Card | Metric | Color |
|---|---|---|
| Bachurot | Count of female profiles | Navy |
| Bachurim | Count of male profiles | Navy |
| Active Matches | Profiles locked within 48h | Green |
| Urgent | Profiles with `bright_red` status | Red |

#### Profile Status System

Status is computed by `computeStatus(profile)` in `src/lib/matchmaker/statusUtils.ts`:

| Status | Color | Trigger |
|---|---|---|
| `green` | 🟢 Green | Lock is active (within 48 hours of `lockedAt`) |
| `orange` | 🟠 Orange | `lastOfferDate` within last 7 days |
| `light_red` | 🔴 Light Red | 8–60 days since last offer |
| `bright_red` | 🔴 Bright Red | >60 days since last offer, or no offer ever |

#### Lock Mechanism

- **Duration:** 48 hours (`LOCK_MS = 48 * 60 * 60 * 1000`)
- **Lock owner:** stored as `lockedBy` (matchmaker name string)
- **Countdown:** displayed as `"Xש׳ Yד׳"` (he) / `"Xh Ym"` (en), refreshed every 60 seconds
- **Permissions** (`canActOnLock`):
  - Admin → always can act
  - No lock owner (`null`) → anyone can lock
  - Locked by self → can unlock
  - Locked by another → cannot unlock (only admin can)

#### Profiles Table Columns

| # | Column | Notes |
|---|---|---|
| 1 | Name | Clickable → profile detail |
| 2 | Age | Right-aligned, `tabular-nums` |
| 3 | City | — |
| 4 | Style | Locale-aware label |
| 5 | Status | `TrafficLight` component (colored dot) |
| 6 | Last Offer | Relative date via `formatLastOffer()` |
| 7 | Lock | Countdown badge (if locked) or "Start Work" button |
| 8 | Actions | View (eye) · PDF (document) · Notes (chat) |

**Row background:**
- Locked by another matchmaker → `bg-red-50` tint
- Even/odd rows: alternating white / gray-50

#### PDF Export Flow

1. Click PDF icon → button shows loading spinner
2. `POST /api/export/profile/[id]?gender={gender}`
3. Response: `application/pdf` blob
4. Browser auto-downloads as `profile-{id}.pdf`
5. Button resets on completion or error

#### Tabs

- **Bachurot** tab — female profiles
- **Bachurim** tab — male profiles
- Each tab displays badge with count

#### Additional Dashboard Sections

| Section | Description |
|---|---|
| `AnnouncementBar` | Global announcement; editable by admin only |
| `SocialWall` | Internal matchmaker posts & profile tagging |
| `PerformanceScorecard` | Current user's stats (posts, proposals, successful matches) |
| `MatchProgressSection` | Track 5 stages per match: checking → proposal_sent → meeting_1 → meeting_2 → closing |
| `AdminLeaderboard` | Visible to admin only — all matchmakers' activity stats |
| `StatusGuide` | Color legend (collapsible) |

---

### 4.4 Social Wall

**Component:** `src/components/hub/SocialWall.tsx`

#### Post Composer

- Free-text textarea
- `Ctrl+Enter` submits the post
- Hebrew placeholder: "שתף עדכון, הערה, או בשורה..."
- English placeholder: "Share an update, note, or good news..."

#### Profile Tagging

1. Click "Tag candidate" button → dropdown opens
2. Dropdown has:
   - Text search (filters by name)
   - **Gender filter tabs:** All · Female 👩 · Male 👨
3. Shows up to 10 results at a time
4. **Interleaving logic:** Male and female profiles are interleaved so both genders appear without bias in the default `All` view
5. Clicking a profile adds it as a tag chip
6. Tags can be individually removed with ×

#### Post Display

- Author avatar (initials in colored circle)
- Author name + relative time (`timeAgo()`)
- **Announcement badge** if `isAnnouncement === true`
- Post body text
- Tagged profile chips (pink for female, blue for male)

#### Time Formatting (`timeAgo`)

| Hebrew | English | Threshold |
|---|---|---|
| עכשיו | now | < 1 minute |
| לפני X ד׳ | Xm ago | < 1 hour |
| לפני X שע׳ | Xh ago | < 1 day |
| לפני X ימים | Xd ago | ≥ 1 day |

---

### 4.5 Date-Spot Finder

**Route:** `/date-spots`  
**Architecture:** Server component page + `DateSpotsClient` client component for filters.

#### Filters

| Filter | Type | Options |
|---|---|---|
| Search | Text | Matches name, city, or vibe (case-insensitive substring) |
| Category | Select | all · restaurant 🍽️ · hotel_lobby 🏨 · park 🌳 · quiet 🕊️ |
| Region | Select | all · jerusalem · center · north · south |

All three filters combine with AND logic. Empty search + "all" in both selects = show all spots.

#### Spot Card Data

| Field | Type | Notes |
|---|---|---|
| `name` | string | Spot name |
| `city` | string | City |
| `region` | SpotRegion | jerusalem / center / north / south |
| `category` | SpotCategory | restaurant / hotel_lobby / park / quiet |
| `vibe` | string | Short Hebrew description |
| `address` | string? | Optional |
| `googleMapsUrl` | string? | External Google Maps link |
| `kosher` | boolean? | Shows ✓ כשר badge |
| `priceRange` | ₪ / ₪₪ / ₪₪₪ | Optional |
| `averageRating` | number 1–5 | Pre-computed |
| `reviewCount` | number | — |
| `reviews` | SpotReview[] | Embedded review objects |

#### Review Object

```typescript
interface SpotReview {
  id: string
  authorName: string   // Display name only — no PII stored
  rating: number       // 1–5 integer
  text: string
  createdAt: string    // ISO 8601 date string
}
```

#### Tips Strip

A burgundy info bar above the grid with context-sensitive advice:
- Hebrew: "לפגישה ראשונה — לובי מלון או בית קפה שקט. לפגישות מתקדמות — מסעדת שף או טיול בטבע."
- English: "For a first date — a hotel lobby or quiet café. For later dates — a chef restaurant or nature walk."

#### Empty State

Displayed when no spots match current filters:
- Hebrew: "לא נמצאו מקומות התואמים לחיפוש"
- English: "No spots match your search"
- Shows "Clear filters" button

---

### 4.6 Notification Bell

**Component:** `src/components/layout/NotificationBell.tsx`  
**Position:** Navbar, between language switcher and login button.

#### Role Detection

```
getSession() !== null  →  Matchmaker notifications
getSession() === null  →  Candidate notifications
```

#### Demo Notifications

**Matchmaker feed:**

| ID | Hebrew text | English text | Link |
|---|---|---|---|
| `mm1` | מועמד חדש נרשם בסקטור שלך | New candidate registered in your sector | `/[locale]/matchmaker` |
| `mm2` | עדכון מערכת לשדכנים | System update for matchmakers | `/[locale]/matchmaker` |
| `mm3` | הודעה חדשה לכלל הצוות | New global announcement for the team | `/[locale]/matchmaker` |

**Candidate feed:**

| ID | Hebrew text | English text | Link |
|---|---|---|---|
| `c1` | יש לך הצעת שידוך חדשה! | You have a new match suggestion! | `/[locale]/personal` |
| `c2` | סטטוס הפרופיל שלך עודכן | Your profile status was updated | `/[locale]/personal` |
| `c3` | גלה מקומות בילוי חדשים באזורך | Check out new dating spots in your area | `/[locale]/date-spots` |

#### Mobile vs Desktop Behaviour

| Viewport | Behaviour | Implementation |
|---|---|---|
| `< 768px` (mobile) | **Bottom sheet** slides up from screen bottom, max-height 80vh | `createPortal()` at `document.body` |
| `≥ 768px` (desktop) | **Dropdown** — absolute positioned below bell button, w-80 (320px) | Absolute div inside relative wrapper |

**Mobile sheet features:**
- Dark backdrop (`bg-black/50`) — tap to close
- Drag handle bar (cosmetic, top of sheet)
- Safe-area inset padding (`env(safe-area-inset-bottom)`)
- Body scroll locked while open (`document.body.style.overflow = 'hidden'`)
- ✕ Close button in panel header

**Desktop dropdown features:**
- RTL: anchored `right-0`; LTR: anchored `left-0`
- Closes on outside `mousedown`
- ✕ Close button also present

#### Unread State

- Red dot badge on bell if any notification has `read: false`
- Red count badge in panel header
- "Mark all as read" button → sets all `read: true`
- After marking read: footer shows empty-state text instead of button

---

### 4.7 Localization (i18n)

**Library:** next-intl v3.17.2  
**Locales:** `['he', 'en']`  
**Default:** `he` (Hebrew)  
**Routing:** Middleware intercepts all non-API, non-static requests and prepends locale.

#### Direction

Every page wraps its root `<div>` with `dir={isHe ? 'rtl' : 'ltr'}`. The `<html>` tag's `dir` and `lang` attributes are set in the locale layout.

#### Translation Architecture

Two systems coexist:

| System | Location | Used by |
|---|---|---|
| `getT(locale)` helper | `src/lib/i18n/translations.ts` | Server components (Header, Footer) |
| `next-intl` JSON files | `src/i18n/messages/{he,en}.json` | Pages using `useTranslations()` hook |

Most page content uses inline ternary `isHe ? '...' : '...'` for simplicity.

#### RTL-Specific Layout Details

- Navbar dropdown anchor: `right-0` (he) / `left-0` (en)
- Notification chevron: `‹` (he) / `›` (en)
- Mobile nav sidebar: right-anchored (he) / left-anchored (en)
- Form labels and Zod error messages always render in Hebrew
- Social wall `timeAgo()` switches language

---

## 5. Critical Components

The following components carry the highest complexity and warrant the heaviest QA attention:

| Component | Path | Why Critical |
|---|---|---|
| `MaleRegistrationForm` | `src/components/forms/MaleRegistrationForm.tsx` | 38 fields, conditional superRefine logic, multi-section |
| `FemaleRegistrationForm` | `src/components/forms/FemaleRegistrationForm.tsx` | 39 fields, additional `headcovering` field |
| `MatchmakerRegistrationForm` | `src/components/forms/MatchmakerRegistrationForm.tsx` | Sector multi-select, Israeli ID regex |
| `ProfilesTable` | `src/components/matchmaker/ProfilesTable.tsx` | Lock logic, 60s countdown, PDF export, notes thread |
| `SocialWall` | `src/components/hub/SocialWall.tsx` | Interleave algorithm, tagging, Ctrl+Enter shortcut |
| `DateSpotsClient` | `src/components/date-spots/DateSpotsClient.tsx` | Combined AND filter logic, empty states |
| `NotificationBell` | `src/components/layout/NotificationBell.tsx` | Role detection, mobile/desktop branching, portal |
| `PaymentForm` | `src/components/ui/PaymentForm.tsx` | Conditional render, financial input fields |

---

## 6. Data Models & Type Definitions

### Profile Types (`src/types/registration.ts`)

```typescript
type Trait              = 'calm' | 'happy' | 'serious' | 'flowing' | 'deep' | 'social' | 'proactive' | 'shy' | 'communicative'
type RelationshipValue  = 'stability' | 'emotional' | 'aspirations' | 'family' | 'homey' | 'depth' | 'lightness' | 'spiritual' | 'worldview'
type Brings             = 'stability' | 'emotional' | 'commitment' | 'responsibility' | 'homey' | 'depth' | 'lightness' | 'reliability' | 'communication'
type Flexibility        = 'preferred' | 'important' | 'very_important' | 'not_important'
type PhoneType          = 'kosher' | 'filtered' | 'smartphone' | 'work_smartphone'
type MaleStyle          = 'yeshivish' | 'open_ish' | 'open' | 'modern' | 'very_modern'
type FemaleStyle        = 'shmura' | 'open_ish' | 'open' | 'modern' | 'very_modern'
type Headcovering       = 'wig_no_cut' | 'wig_with_cut' | 'wig_only' | 'wig_plus_cover' | 'kerchief_only' | 'no_preference'
type MatchmakerStatus   = 'green' | 'orange' | 'light_red' | 'bright_red'
```

Extended profile objects add:
```typescript
{
  id: string
  matchmakerStatus: MatchmakerStatus
  notes: Note[]
  lockedAt: Date | null
  lockedBy: string | null
  lastOfferDate: Date | null
}
```

### Hub Types (`src/types/hub.ts`)

```typescript
type MatchStage = 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'

interface TaggedProfile { id: string; name: string; gender: 'male' | 'female' }
interface SocialPost    { id, author, authorEmail, content, taggedProfiles: TaggedProfile[], createdAt: Date, isAnnouncement: boolean }
interface MatchProgress { id, femaleId, femaleName, maleId, maleName, stage: MatchStage, matchmakerName, matchmakerEmail, updatedAt }
interface MatchmakerLeaderboardEntry { name, email, postsCount, statusUpdatesCount, successfulMatchesCount, activeProposalsCount }
```

### Date Spots Types (`src/types/dateSpots.ts`)

```typescript
type SpotCategory = 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
type SpotRegion   = 'jerusalem' | 'center' | 'north' | 'south'
type PriceRange   = '₪' | '₪₪' | '₪₪₪'

interface SpotReview { id, authorName, rating: number, text, createdAt: string }
interface DateSpot   { id, name, city, region, category, vibe, address?, googleMapsUrl?, kosher?, priceRange?, averageRating, reviewCount, reviews: SpotReview[] }
```

---

## 7. API Endpoints

### `POST /api/ai/summary`

**Request body:**

```typescript
{
  aboutMe: string
  aboutPartner: string
  name: string
  gender: 'male' | 'female'
  locale: 'he' | 'en'
  style: string
  traits: string[]
  relationshipValues: string[]
  brings: string[]
  doesntSuit?: string
}
```

**Response:**
```typescript
{ bullets: string[], source: 'ai' | 'structured' }
```

**Logic:**
1. If `ANTHROPIC_API_KEY` env var is set and meaningful input exists → calls **Claude Haiku** (`claude-haiku-4-5-20251001`, max 400 tokens)
2. If no API key → generates `structured` bullets deterministically from form data (no external call, no crash)

**Note:** The `source` field distinguishes AI vs fallback output.

---

### `POST /api/export/profile/[id]`

**Query param:** `?gender=male|female` (default: `female`)

**Response on success:**
```
HTTP 200
Content-Type: application/pdf
Content-Disposition: attachment; filename="profile-{id}.pdf"
```

**Response on failure:**
```
HTTP 404  (profile ID not found in mock data)
```

---

## 8. Auth & Session Management

### Session Storage

**File:** `src/lib/auth/session.ts`  
**Storage:** `localStorage['matchmaker_session']` (JSON string)

```typescript
interface MatchmakerSession {
  name: string
  email: string
  role: 'matchmaker' | 'admin'
}
```

| Function | Behaviour |
|---|---|
| `getSession()` | Returns `MatchmakerSession \| null`; always `null` during SSR |
| `setSession(data)` | Serialises and stores to localStorage |
| `clearSession()` | Removes key from localStorage (logout) |

> ⚠️ **SSR Safety:** All session calls are guarded with `typeof window === 'undefined'` checks.

### Demo Identities (Lock Context)

**File:** `src/lib/matchmaker/lockContext.tsx`  
**Storage:** `localStorage['bonim-matchmaker-identity']`

| Name | Is Admin |
|---|---|
| שדכן א | No |
| שדכן ב | No |
| שדכן ג | No |
| מנהל | **Yes** |

Default on first load: `שדכן א`.

### Permission Matrix

| Action | Own lock | Admin | Unowned profile | Other's lock |
|---|---|---|---|---|
| Lock a profile | ✅ | ✅ | ✅ | ❌ |
| Unlock a profile | ✅ | ✅ | ✅ | ❌ |
| See lock owner name | ✅ | ✅ | ✅ | ✅ |
| Edit announcement | ❌ | ✅ | — | — |
| View leaderboard | ❌ | ✅ | — | — |

---

## 9. Known Constraints & Special Logic

### 9.1 Reviews Display — Hebrew Language Lock

Spot reviews (`SpotReview.text`) are stored as Hebrew strings in the mock data. When a user switches the UI to English, review text **remains in Hebrew** — it is not translated. This is by design (authentic community content).

> ✅ **QA note:** Do **not** file a defect if review text appears in Hebrew while the UI language is set to English.

---

### 9.2 Notification Bell — Mobile Bottom Sheet

The dropdown was replaced with a bottom sheet on mobile (`< 768px`) because an absolute-positioned dropdown overflows the viewport on small screens.

- Sheet is injected into `document.body` via `createPortal()`, bypassing all parent stacking contexts.
- `window.innerWidth` is measured on mount and on every `resize` event to switch modes reactively.
- The 768px threshold matches Tailwind's `md:` breakpoint exactly.

---

### 9.3 Lock Countdown — 60-Second Refresh Interval

The lock countdown badge updates every **60 seconds** via `setInterval`. It does not update in real time — there is a maximum visible lag of 60 seconds between actual expiry and UI reflecting it.

> ✅ **QA note:** A badge showing "0ש׳ 0ד׳" for up to 60 seconds after expiry is expected behaviour, not a bug.

---

### 9.4 AI Summary — Graceful Fallback

If `ANTHROPIC_API_KEY` is absent or the API call fails, the system returns a deterministic structured summary. The response shape is identical in both cases. Inspect the `source` field to determine which path was taken.

---

### 9.5 PDF Export — Mock Data Only

Profile export reads from **in-memory mock arrays** at startup. There is no database. A valid-looking but non-existent `id` returns HTTP 404.

---

### 9.6 Auth is Client-Side Only

Route protection for `/matchmaker/**` is enforced in `matchmaker/layout.tsx` (client component). There is no server-side middleware guard. This is acceptable for the current prototype stage since all data is also client-side mock data.

---

### 9.7 Sector "Select All" Toggle Clears on Second Click

In the matchmaker registration form, clicking "Select All" twice returns `sectors` to an empty array. Since Zod requires `min(1)`, submitting with an empty sectors array blocks form submission.

---

### 9.8 Zod Error Messages Are Always Hebrew

All Zod error message strings are written in Hebrew (`.min(2, 'שדה חובה')` etc.). Even when the UI is in English, validation errors display in Hebrew. This is by design.

---

## 10. Testing Focus Areas & Test Matrix

### Priority 1 — Form Validation (Highest Risk)

| Test Case | Expected Result |
|---|---|
| Submit male form with all required fields empty | All required fields show Hebrew error messages |
| `phone`: enter `0501234567` | Valid — no error |
| `phone`: enter `0601234567` (starts with 06) | Error: invalid phone format |
| `phone`: enter `123` | Error: invalid phone format |
| `idNumber`: enter `12345678` (8 digits) | Error: must be 9 digits |
| `idNumber`: enter `123456789` (9 digits) | Valid — no error |
| `status = divorced`, leave `hasChildren` unset | Error on `hasChildren` field |
| `status = divorced`, `hasChildren = true`, `numberOfChildren` blank | Error on `numberOfChildren` |
| `status = single`, check for `hasChildren` field | Field must not be visible |
| Select 1 trait only | Error: "select at least 2" |
| Select 4 traits | 4th selection should be blocked or trigger error |
| `sectors` in matchmaker form: submit with none selected | Error: "Select at least one sector" |
| `sectors`: click "Select All" | All 5 sectors selected |
| `sectors`: click "Select All" again | All 5 sectors deselected |
| Submit female form without `headcovering` | Error on `headcovering` |
| Select premium plan | Payment form section appears below |
| Select free plan | Payment form section is hidden |
| Upload 6 photos | Only 5 accepted; 6th rejected |

---

### Priority 2 — Matchmaker Lock Logic

| Test Case | Expected Result |
|---|---|
| Click "Start Work" on an unlocked profile | Profile locks; 48h countdown badge appears |
| Switch identity → view profile locked by previous identity | Row shows locker's name; no unlock button |
| Switch to Admin identity → view locked profile | Unlock button is visible |
| Admin clicks unlock | Lock cleared; "Start Work" button returns |
| Mock `lockedAt` to 49h ago | Status changes from green → orange/red |
| Observe countdown badge over time | Badge value decreases; updates every ~60s |
| Add note to a profile | Note appears with author name and timestamp |
| Click PDF on female profile | `profile-{id}.pdf` downloads successfully |
| Click PDF on male profile | PDF contains correct male data |
| Request `GET /api/export/profile/nonexistent-id` | HTTP 404 |

---

### Priority 3 — Social Wall

| Test Case | Expected Result |
|---|---|
| Type post and click "Post" button | New post appears at top of wall |
| Type post and press Ctrl+Enter | Post submits |
| Open tag dropdown → type partial name | Filtered candidate list shown |
| Tag dropdown → switch to "Female" tab | Only female candidates shown |
| Tag dropdown → switch to "Male" tab | Only male candidates shown |
| Tag dropdown → switch to "All" tab | Both genders interleaved |
| Tag a female candidate | Pink chip appears in composer |
| Tag a male candidate | Blue chip appears in composer |
| Click × on a tag chip | Tag removed from list |
| Submit post with tags | Post card shows colored profile chips |
| Admin post with `isAnnouncement = true` | "Announcement" badge visible on card |

---

### Priority 4 — Date-Spot Finder

| Test Case | Expected Result |
|---|---|
| Load page with no filters active | All spots shown in grid |
| Search "מלון" | Only spots matching "מלון" in name/city/vibe |
| Filter category = `restaurant` | Only restaurant cards visible |
| Filter region = `jerusalem` | Only Jerusalem spots visible |
| Search + category + region combined | AND logic — only spots matching all three |
| No spots match filters | Empty state message shown + "Clear filters" button |
| Click "Clear filters" | All three filters reset; all spots shown |
| Click Google Maps link | Opens external URL in new tab |
| Spot with no `googleMapsUrl` | No map link rendered (graceful) |
| Spot with `kosher: true` | "✓ כשר" badge visible on card |
| Switch UI to English | Tips strip shows English text; review text stays Hebrew |

---

### Priority 5 — Notification Bell

| Test Case | Expected Result |
|---|---|
| Page load with no `localStorage` session | Candidate notifications (c1, c2, c3) shown |
| Page load with matchmaker `localStorage` session | Matchmaker notifications (mm1, mm2, mm3) shown |
| Notifications are unread on load | Red dot visible on bell icon |
| Click bell (desktop ≥ 768px) | Dropdown opens below the bell |
| Click outside dropdown (desktop) | Dropdown closes |
| Click bell (mobile < 768px) | Bottom sheet slides up from screen bottom |
| Tap backdrop (mobile) | Sheet dismisses |
| Tap ✕ button (any viewport) | Panel / sheet closes |
| Click a notification row | Navigates to the correct route |
| Click "Mark all as read" | All dots turn gray; footer shows empty state text |
| Reopen bell after marking read | Red dot gone from bell icon |
| Resize from desktop to mobile mid-session | Bottom sheet used from that point forward |

---

### Priority 6 — i18n / RTL / Responsive

| Test Case | Expected Result |
|---|---|
| Load `/he/*` | `dir="rtl"`, Hebrew content, navbar mirrored |
| Load `/en/*` | `dir="ltr"`, English content, navbar mirrored |
| Click language toggle → same page | URL changes locale prefix; layout mirrors |
| Notification dropdown in Hebrew | Panel anchored `right-0` |
| Notification dropdown in English | Panel anchored `left-0` |
| Form validation errors in English UI | Error messages still appear in Hebrew |
| Relative dates in Hebrew locale | "לפני 3 ימים" format |
| Relative dates in English locale | "3d ago" format |
| Test at 375px (iPhone SE) | Bottom sheet fully visible; no overflow |
| Test at 768px (breakpoint) | Dropdown used (not sheet) |
| Test at 1280px (desktop) | Full desktop layout |

---

### Priority 7 — API Endpoints

| Test Case | Expected Result |
|---|---|
| `POST /api/ai/summary` with valid body + API key | `{ bullets: [...], source: 'ai' }` |
| `POST /api/ai/summary` without `ANTHROPIC_API_KEY` | `{ bullets: [...], source: 'structured' }`, no crash |
| `POST /api/ai/summary` with `locale: 'en'` | Bullets returned in English |
| `POST /api/ai/summary` with `locale: 'he'` | Bullets returned in Hebrew |
| `POST /api/export/profile/[valid-id]?gender=female` | HTTP 200, PDF downloaded |
| `POST /api/export/profile/[valid-id]?gender=male` | HTTP 200, male-specific PDF content |
| `POST /api/export/profile/nonexistent` | HTTP 404 |

---

### Regression Checklist (Run After Any Code Change)

- [ ] Male and female registration forms submit successfully in both locales
- [ ] Profile lock acquired persists on tab refresh
- [ ] Language toggle does not reset form state
- [ ] Notification bell shows correct role-based content (matchmaker vs candidate)
- [ ] Bottom sheet renders on mobile; dropdown renders on desktop
- [ ] PDF export completes without error for both genders
- [ ] All footer links resolve to real pages (`/about`, `/terms`, `/date-spots`, `/donations`)
- [ ] Admin-only sections (announcement edit, leaderboard) hidden for non-admin users
- [ ] RTL layout intact after CSS changes (no text overflow; chevrons point correctly)
- [ ] `computeStatus()` produces correct color for all 4 status scenarios
- [ ] `timeAgo()` format switches language correctly
- [ ] Date-spot filters combine correctly (AND logic, empty state, clear button)

---

*Document generated from live codebase analysis — April 2026.*
