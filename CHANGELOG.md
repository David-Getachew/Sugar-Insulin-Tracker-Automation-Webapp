# Changelog

## [2.1.0] - 2025-09-10

### Added
- Inline validation for new contact fields (Telegram IDs and secondary emails)
- Delete button for unsaved contact rows
- Developer console logging for webhook URL in dev mode

### Changed
- Inline Edit/Delete icons for contacts no longer have hover background effects
- Edit/Delete icons show tooltips on hover: "Edit contact" / "Delete contact"
- Full name field shows inline save message when changed: "Not saved yet — press Save Changes below to persist this update"
- Logout button color changed to match Delete button red (#dc2626)
- Addition of Multi-select dropdown for symptoms and actions taken in the emergency form and for its behavior: clicking anywhere on a pill removes it
- Emergency form webhook delivery with error handling
- Telegram relation persistence fixed to properly save in "ID:relation" format

### Fixed
- Telegram ID relations properly persist through both inline and page-level saves
- Multi-select pills can be removed by clicking anywhere on the pill (not just the X)

### Security
- No database schema changes or RLS policy modifications
- No auth/login logic changes
- Environment variables properly used for webhook URL (VITE_N8N_EMERGENCY_WEBHOOK_URL)

## v2.0.0 — Integrated Release
Date: 2025-09-10

### Summary
First integrated release combining frontend and Supabase wiring plus multiple bug fixes.

### Features (integration)
- Supabase integration for authentication and profile fetch.
- Auth context and `useAuth()` hook with proper session handling.
- Dashboard with line charts and bar charts for daily readings and insulin doses.
- Daily readings form with upsert behavior (user_id + date).
- Emergency events form that inserts into `emergency_events` and POSTs to `N8N_EMERGENCY_WEBHOOK_URL`.
- Profiles page (edit full name, secondary emails, telegram ids, change password).
- Demo accounts flagged by `profiles.is_demo` are read-only.

### Fixes and improvements (included in this tag)
- Removed mock data in readings history. When no data exists show: "No data available yet — fill out the daily form to start seeing readings."
- Profile "Save Changes" button now persists updates.
- Symptoms text field accepts input; "Actions Taken" field marked optional.
- Insulin dose inputs no longer auto-correct values. Values remain exactly as entered.
- Dashboard state stabilized to avoid reloads when switching browser tabs or apps.
- Charts fixed to display chronological order: oldest on left, newest right.
- UI: disabled submit buttons during requests, popups/toasts for errors, skeletons for initial loading states.

## [2.0.1] - 2025-09-08 - Dashboard and Profile Enhancements

### 🐛 Bug Fixes
- **Profile Save Button**: Fixed issue preventing profile updates by removing overly strict contact validation
- **Password Change**: Implemented proper password change functionality using Supabase auth instead of placeholder message
- **Dashboard Charts**: Fixed data sorting to display readings in proper chronological order (oldest left, newest right)
- **Emergency Form**: Made "Actions Taken" field optional with clear labeling

### 🎨 UI/UX Improvements
- **Secondary Emails Display**: Reverted to previous expanded form layout for better user experience
- **Dashboard Mock Data**: Removed all mock data and implemented clear "no data" messages across all components
- **Consistent Messaging**: Unified empty state messages across dashboard components

### 🧹 Codebase Cleanup
- **Branding Removal**: Eliminated all "dyad-generated-app" references and branding
- **Dependency Cleanup**: Removed unused dyad dependencies from package.json
- **Component Removal**: Deleted the MadeWithDyad component and all references

## [1.0.0] - Previous Release
- Initial frontend-only implementation
- Basic UI components and routing
- Mock data and static functionality
- shadcn/ui component library integration